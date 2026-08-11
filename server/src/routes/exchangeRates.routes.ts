import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import * as exchangeRateController from "../controllers/exchangeRateController";

export const exchangeRatesRouter = Router();
exchangeRatesRouter.use(requireAuth);

exchangeRatesRouter.get("/latest", asyncHandler(exchangeRateController.latest));
exchangeRatesRouter.get("/convert", asyncHandler(exchangeRateController.convert));
exchangeRatesRouter.get("/history", asyncHandler(exchangeRateController.history));
