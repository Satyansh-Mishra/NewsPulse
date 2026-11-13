import Parser from "rss-parser";
import axios from "axios";
import cron from "node-cron";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NewsPulse-Intelligence-Bot/1.0"
  }
});

const NLP_WORKER_URL = process.env.NLP_WORKER_URL || "http://localhost:8000";

export const DEFAULT_FEEDS = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "Tech"
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "Tech"
  },
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "World"
  },
  {
    name: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    category: "World"
  },
  {
    name: "CNBC Business",
    url: "https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=business&output=rss",
    category: "Business"
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "Tech"
  }
];

export async function seedDefaultFeeds(): Promise<void> {
  const count = await prisma.feedSource.count();
  if (count === 0) {
    for (const feed of DEFAULT_FEEDS) {
      await prisma.feedSource.upsert({
        where: { url: feed.url },
        update: {},
        create: {
          name: feed.name,
          url: feed.url,
          category: feed.category,
          active: true
        }
      });
    }
  }
}

export interface IngestionResult {
  totalFeedsProcessed: number;
  newArticlesIngested: number;
  duplicatesSkipped: number;
  errors: string[];
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function ingestFeed(feedSource: { id: string; name: string; url: string; category: string }): Promise<{ ingested: number; skipped: number; error?: string }> {
  let ingested = 0;
  let skipped = 0;

  try {
    const feed = await parser.parseURL(feedSource.url);
    const items = feed.items || [];

    for (const item of items) {
      const url = item.link || item.guid;
      if (!url) continue;

      const existing = await prisma.article.findUnique({
        where: { url }
      });

      if (existing) {
        skipped++;
        continue;
      }

      const articleId = randomUUID();
      const title = item.title || "Untitled News Story";
      const rawContent = item.content || item["content:encoded"] || item.contentSnippet || item.summary || "";
      const cleanedContent = stripHtml(rawContent);
      const summary = item.contentSnippet ? stripHtml(item.contentSnippet) : cleanedContent.slice(0, 300);
      const publishedAt = item.pubDate ? new Date(item.pubDate) : (item.isoDate ? new Date(item.isoDate) : new Date());

      let sentimentLabel = "neutral";
      let sentimentScore = 0.0;
      let entities: Record<string, string[]> = {
        PERSON: [],
        ORG: [],
        GPE: [],
        DATE: []
      };

      try {
        const nlpResponse = await axios.post(
          `${NLP_WORKER_URL}/process-article`,
          {
            id: articleId,
            title,
            content: cleanedContent || title,
            source: feedSource.name,
            published_at: publishedAt.toISOString(),
            url
          },
          { timeout: 8000 }
        );

        if (nlpResponse.status === 200 && nlpResponse.data) {
          sentimentLabel = nlpResponse.data.sentiment?.label || "neutral";
          sentimentScore = nlpResponse.data.sentiment?.score || 0.0;
          entities = nlpResponse.data.entities || entities;
        }
      } catch {
        const posWords = ["gain", "record", "growth", "breakthrough", "success", "surge", "rally", "profit", "win"];
        const negWords = ["drop", "loss", "crash", "war", "decline", "fall", "crisis", "threat", "risk", "conflict"];
        const lower = (title + " " + cleanedContent).toLowerCase();
        let score = 0;
        posWords.forEach(w => { if (lower.includes(w)) score += 0.2; });
        negWords.forEach(w => { if (lower.includes(w)) score -= 0.2; });
        sentimentScore = Math.max(-1, Math.min(1, score));
        sentimentLabel = sentimentScore > 0.05 ? "positive" : sentimentScore < -0.05 ? "negative" : "neutral";
      }

      let topicLabel = feedSource.category;
      if (entities.ORG && entities.ORG.length > 0) {
        topicLabel = `${entities.ORG[0]} / ${feedSource.category}`;
      }

      await prisma.article.create({
        data: {
          id: articleId,
          title,
          url,
          source: feedSource.name,
          publishedAt,
          summary,
          content: cleanedContent,
          sentiment: sentimentLabel,
          sentimentScore,
          entities: entities as object,
          topicLabel,
          category: feedSource.category
        }
      });

      ingested++;
    }

    return { ingested, skipped };
  } catch (err: any) {
    return { ingested, skipped, error: `Failed feed ${feedSource.name} (${feedSource.url}): ${err?.message || "Unknown error"}` };
  }
}

export async function ingestAllFeeds(): Promise<IngestionResult> {
  await seedDefaultFeeds();

  const activeFeeds = await prisma.feedSource.findMany({
    where: { active: true }
  });

  let totalIngested = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const feed of activeFeeds) {
    const res = await ingestFeed(feed);
    totalIngested += res.ingested;
    totalSkipped += res.skipped;
    if (res.error) {
      errors.push(res.error);
    }
  }

  return {
    totalFeedsProcessed: activeFeeds.length,
    newArticlesIngested: totalIngested,
    duplicatesSkipped: totalSkipped,
    errors
  };
}

let cronJob: cron.ScheduledTask | null = null;

export function startIngestionScheduler(cronExpression: string = "*/30 * * * *"): void {
  if (cronJob) {
    cronJob.stop();
  }
  cronJob = cron.schedule(cronExpression, async () => {
    try {
      await ingestAllFeeds();
    } catch {}
  });
}

export function stopIngestionScheduler(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}
