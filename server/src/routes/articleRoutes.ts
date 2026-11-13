import { Router } from "express";
import {
  getArticles,
  getTrends,
  getComparison,
  triggerIngest,
  getFeeds,
  addFeed,
  toggleFeed,
  deleteFeed
} from "../controllers/articleController.js";

const router = Router();

router.get("/articles", getArticles);
router.get("/trends", getTrends);
router.get("/compare/:topic", getComparison);
router.post("/ingest", triggerIngest);
router.get("/feeds", getFeeds);
router.post("/feeds", addFeed);
router.patch("/feeds/:id", toggleFeed);
router.delete("/feeds/:id", deleteFeed);

export default router;

