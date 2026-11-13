import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../config/prisma.js";
import { ingestAllFeeds, ingestFeed } from "../services/ingestionService.js";

const NLP_WORKER_URL = process.env.NLP_WORKER_URL || "http://localhost:8000";

export async function getArticles(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string || req.query.q as string || "").trim();
    const category = (req.query.category as string || "").trim();
    const sentiment = (req.query.sentiment as string || "").trim().toLowerCase();
    const entity = (req.query.entity as string || "").trim();
    const source = (req.query.source as string || "").trim();

    const where: any = {};

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (sentiment && sentiment !== "all") {
      where.sentiment = { equals: sentiment };
    }

    if (source && source !== "All") {
      where.source = { equals: source, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ];
    }

    if (entity) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { content: { contains: entity, mode: "insensitive" } },
            { title: { contains: entity, mode: "insensitive" } }
          ]
        }
      ];
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasMore: skip + articles.length < totalCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch articles" });
  }
}

export async function getTrends(req: Request, res: Response): Promise<void> {
  try {
    const recentArticles = await prisma.article.findMany({
      take: 200,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        source: true,
        sentiment: true,
        sentimentScore: true,
        entities: true,
        category: true,
        publishedAt: true
      }
    });

    const personCounts: Record<string, number> = {};
    const orgCounts: Record<string, number> = {};
    const gpeCounts: Record<string, number> = {};
    const sentimentDist: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    const timelineMap: Record<string, { date: string; positive: number; neutral: number; negative: number; total: number }> = {};

    recentArticles.forEach(art => {
      sentimentDist[art.sentiment] = (sentimentDist[art.sentiment] || 0) + 1;

      const dateKey = art.publishedAt.toISOString().slice(0, 10);
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      timelineMap[dateKey].total++;
      if (art.sentiment === "positive") timelineMap[dateKey].positive++;
      else if (art.sentiment === "negative") timelineMap[dateKey].negative++;
      else timelineMap[dateKey].neutral++;

      const ents = art.entities as any;
      if (ents && typeof ents === "object") {
        (ents.PERSON || []).forEach((p: string) => {
          if (p.length > 2) personCounts[p] = (personCounts[p] || 0) + 1;
        });
        (ents.ORG || []).forEach((o: string) => {
          if (o.length > 2) orgCounts[o] = (orgCounts[o] || 0) + 1;
        });
        (ents.GPE || []).forEach((g: string) => {
          if (g.length > 2) gpeCounts[g] = (gpeCounts[g] || 0) + 1;
        });
      }
    });

    const formatRanked = (counts: Record<string, number>) =>
      Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    let topicClusters: any[] = [];
    try {
      const clusterRes = await axios.post(`${NLP_WORKER_URL}/cluster-topics`, {
        n_clusters: 5,
        limit: 100
      }, { timeout: 5000 });
      if (clusterRes.status === 200 && Array.isArray(clusterRes.data)) {
        topicClusters = clusterRes.data;
      }
    } catch {
      const categoryCounts: Record<string, number> = {};
      recentArticles.forEach(a => {
        const cat = a.category || "General";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      topicClusters = Object.entries(categoryCounts).map(([cat, count], idx) => ({
        cluster_id: idx + 1,
        topic_label: cat,
        size: count,
        top_keywords: [cat.toLowerCase(), "news", "updates"],
        sample_titles: recentArticles.filter(a => a.category === cat).slice(0, 3).map(a => a.title),
        sample_article_ids: recentArticles.filter(a => a.category === cat).slice(0, 3).map(a => a.id)
      }));
    }

    res.json({
      totalArticles: recentArticles.length,
      entityTrends: {
        people: formatRanked(personCounts),
        organizations: formatRanked(orgCounts),
        locations: formatRanked(gpeCounts)
      },
      sentimentDistribution: sentimentDist,
      timeline,
      topicClusters
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to calculate trends" });
  }
}

export async function getComparison(req: Request, res: Response): Promise<void> {
  try {
    const topic = (req.params.topic || "").trim();
    if (!topic) {
      res.status(400).json({ error: "Topic parameter is required" });
      return;
    }

    const matchedArticles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: topic, mode: "insensitive" } },
          { summary: { contains: topic, mode: "insensitive" } },
          { content: { contains: topic, mode: "insensitive" } },
          { topicLabel: { contains: topic, mode: "insensitive" } }
        ]
      },
      orderBy: { publishedAt: "desc" },
      take: 50
    });

    if (matchedArticles.length === 0) {
      res.json({
        topic,
        totalArticles: 0,
        publishers: [],
        sentimentComparison: [],
        consensusEntities: [],
        summaryAnalysis: `No articles found discussing "${topic}". Ingest recent feeds or try another query term.`
      });
      return;
    }

    const publisherGroups: Record<string, typeof matchedArticles> = {};
    const entityFrequencies: Record<string, number> = {};

    matchedArticles.forEach(art => {
      if (!publisherGroups[art.source]) {
        publisherGroups[art.source] = [];
      }
      publisherGroups[art.source].push(art);

      const ents = art.entities as any;
      if (ents && typeof ents === "object") {
        [...(ents.PERSON || []), ...(ents.ORG || []), ...(ents.GPE || [])].forEach((e: string) => {
          if (e.length > 2) {
            entityFrequencies[e] = (entityFrequencies[e] || 0) + 1;
          }
        });
      }
    });

    const publishers = Object.entries(publisherGroups).map(([source, arts]) => {
      const avgSentiment = arts.reduce((acc, cur) => acc + cur.sentimentScore, 0) / arts.length;
      const dominantSentiment = avgSentiment > 0.05 ? "positive" : avgSentiment < -0.05 ? "negative" : "neutral";

      const sourceEntities: Record<string, number> = {};
      arts.forEach(a => {
        const e = a.entities as any;
        if (e && typeof e === "object") {
          [...(e.PERSON || []), ...(e.ORG || [])].forEach((ent: string) => {
            sourceEntities[ent] = (sourceEntities[ent] || 0) + 1;
          });
        }
      });

      const topKeyEntities = Object.entries(sourceEntities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      const headlines = arts.slice(0, 3).map(a => a.title);

      let framing = `Neutral factual reporting focused on developments in ${topic}.`;
      if (dominantSentiment === "positive") {
        framing = `Optimistic framing highlighting achievements, expansion, or breakthroughs.`;
      } else if (dominantSentiment === "negative") {
        framing = `Critical coverage emphasizing risks, challenges, regulatory scrutiny, or market impact.`;
      }

      return {
        source,
        articleCount: arts.length,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        dominantSentiment,
        keyEntities: topKeyEntities,
        sampleHeadlines: headlines,
        narrativeFraming: framing,
        latestDate: arts[0].publishedAt
      };
    });

    const sentimentComparison = publishers.map(p => ({
      source: p.source,
      sentimentScore: p.avgSentiment,
      articleCount: p.articleCount,
      sentiment: p.dominantSentiment
    }));

    const consensusEntities = Object.entries(entityFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const publisherNames = publishers.map(p => p.source).join(", ");
    const summaryAnalysis = `Analyzed ${matchedArticles.length} articles across ${publishers.length} outlets (${publisherNames}) on "${topic}". Reporting highlights key entities including ${consensusEntities.slice(0, 3).map(e => e.name).join(", ") || "core subjects"}. Coverage reflects diverse editorial lenses ranging from ${publishers[0]?.dominantSentiment} framing in ${publishers[0]?.source} to broader ecosystem analysis.`;

    res.json({
      topic,
      totalArticles: matchedArticles.length,
      publishers,
      sentimentComparison,
      consensusEntities,
      summaryAnalysis
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate narrative comparison" });
  }
}

export async function triggerIngest(_req: Request, res: Response): Promise<void> {
  try {
    const result = await ingestAllFeeds();
    res.json({
      success: true,
      message: `Ingested ${result.newArticlesIngested} articles from ${result.totalFeedsProcessed} feeds.`,
      result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Feed ingestion failed" });
  }
}

export async function getFeeds(_req: Request, res: Response): Promise<void> {
  try {
    const feeds = await prisma.feedSource.findMany({
      orderBy: { createdAt: "asc" }
    });
    res.json({ feeds });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch feeds" });
  }
}

export async function addFeed(req: Request, res: Response): Promise<void> {
  try {
    const { name, url, category } = req.body;
    if (!name || !url) {
      res.status(400).json({ error: "Name and URL are required" });
      return;
    }

    const feed = await prisma.feedSource.upsert({
      where: { url },
      update: { name, category: category || "General", active: true },
      create: { name, url, category: category || "General", active: true }
    });

    const ingestResult = await ingestFeed(feed);

    res.status(201).json({
      success: true,
      feed,
      ingestedArticles: ingestResult.ingested
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add feed" });
  }
}

export async function toggleFeed(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const existing = await prisma.feedSource.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Feed source not found" });
      return;
    }

    const updated = await prisma.feedSource.update({
      where: { id },
      data: { active: !existing.active }
    });

    res.json({ success: true, feed: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to toggle feed" });
  }
}

export async function deleteFeed(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    await prisma.feedSource.delete({ where: { id } });
    res.json({ success: true, message: "Feed deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete feed" });
  }
}

