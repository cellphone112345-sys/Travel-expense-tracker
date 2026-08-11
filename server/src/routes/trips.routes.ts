import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import * as tripController from "../controllers/tripController";
import * as exportController from "../controllers/exportController";
import { expensesRouter } from "./expenses.routes";

export const tripsRouter = Router();
tripsRouter.use(requireAuth);

// Must precede "/:tripId" so "compare" isn't matched as a trip id.
tripsRouter.get("/compare", asyncHandler(tripController.compare));

tripsRouter.get("/", asyncHandler(tripController.list));
tripsRouter.post("/", asyncHandler(tripController.create));
tripsRouter.get("/:tripId", asyncHandler(tripController.get));
tripsRouter.put("/:tripId", asyncHandler(tripController.update));
tripsRouter.delete("/:tripId", asyncHandler(tripController.remove));
tripsRouter.get("/:tripId/summary", asyncHandler(tripController.summary));
tripsRouter.get("/:tripId/budget-status", asyncHandler(tripController.budgetStatus));
tripsRouter.get("/:tripId/export/csv", asyncHandler(exportController.csv));
tripsRouter.get("/:tripId/export/pdf", asyncHandler(exportController.pdf));

tripsRouter.use("/:tripId/expenses", expensesRouter);
