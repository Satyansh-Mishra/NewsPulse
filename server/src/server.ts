import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import articleRoutes from "./routes/articleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { connectPrisma, disconnectPrisma } from "./config/prisma.js";
import {
  seedDefaultFeeds,
  startIngestionScheduler,
  stopIngestionScheduler,
  ingestAllFeeds
} from "./services/ingestionService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "newspulse-server",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", articleRoutes);
app.use("/api", chatRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "API endpoint not found" });
});

async function bootstrap() {
  try {
    await connectPrisma();
    await seedDefaultFeeds();
    startIngestionScheduler("*/30 * * * *");

    setTimeout(async () => {
      try {
        await ingestAllFeeds();
      } catch {}
    }, 2000);

    const server = app.listen(PORT, () => {
      process.stdout.write(`NewsPulse Server running on port ${PORT}\n`);
    });

    const shutdown = async () => {
      stopIngestionScheduler();
      server.close(async () => {
        await disconnectPrisma();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    process.stderr.write(`Failed to start server: ${err}\n`);
    process.exit(1);
  }
}

bootstrap();

