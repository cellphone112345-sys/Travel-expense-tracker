import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth.routes";
import { tripsRouter } from "./routes/trips.routes";
import { categoriesRouter } from "./routes/categories.routes";
import { exchangeRatesRouter } from "./routes/exchangeRates.routes";
import { expenseByIdRouter } from "./routes/expenses.routes";
import { requireAuth } from "./middleware/requireAuth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  if (!env.isProduction) {
    // Dev only: client runs on a separate Vite port and needs CORS + credentialed requests.
    app.use(cors({ origin: true, credentials: true }));
  }

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/trips", tripsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/exchange-rates", exchangeRatesRouter);
  app.use("/api/expenses", requireAuth, expenseByIdRouter);

  if (env.isProduction) {
    const clientDist = path.join(__dirname, "..", "..", "client", "dist");
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
