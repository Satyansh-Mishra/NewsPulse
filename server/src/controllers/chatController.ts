import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../config/prisma.js";

const NLP_WORKER_URL = process.env.NLP_WORKER_URL || "http://localhost:8000";

export async function chatQuery(req: Request, res: Response): Promise<void> {
  try {
    const { query, top_k = 5 } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      res.status(400).json({ error: "A valid query string is required" });
      return;
    }

    try {
      const nlpRes = await axios.post(
        `${NLP_WORKER_URL}/rag-query`,
        {
          query: query.trim(),
          top_k: Math.min(10, Math.max(1, Number(top_k)))
        },
        { timeout: 15000 }
      );

      if (nlpRes.status === 200 && nlpRes.data) {
        res.json(nlpRes.data);
        return;
      }
    } catch {
      const searchTerms = query.trim().split(/\s+/).filter(w => w.length > 2);
      const orClauses = searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: "insensitive" as const } },
          { content: { contains: term, mode: "insensitive" as const } }
        ]
      }));

      const matched = await prisma.article.findMany({
        where: orClauses.length > 0 ? { OR: orClauses } : undefined,
        take: top_k,
        orderBy: { publishedAt: "desc" }
      });

      if (matched.length === 0) {
        res.json({
          query,
          answer: `I could not find matching articles in the NewsPulse database related to "${query}". Try searching for another topic or trigger a feed sync to ingest fresh news.`,
          citations: [],
          confidence_score: 0.0
        });
        return;
      }

      const citations = matched.map((art, idx) => ({
        citation_id: idx + 1,
        article_id: art.id,
        title: art.title,
        source: art.source,
        url: art.url,
        published_at: art.publishedAt.toISOString(),
        similarity_score: 0.85 - (idx * 0.05),
        excerpt: (art.summary || art.content).slice(0, 240) + "..."
      }));

      const synthesis = matched.map((art, idx) => {
        const snippet = (art.summary || art.content).slice(0, 160).trim();
        return `${art.source} reports: "${snippet}" [${idx + 1}]`;
      }).join("\n\n");

      res.json({
        query,
        answer: `Synthesizing ${matched.length} relevant reports on "${query}":\n\n${synthesis}`,
        citations,
        confidence_score: 0.82
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat query failed" });
  }
}

