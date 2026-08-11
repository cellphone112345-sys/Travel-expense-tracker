import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as expenseController from "../controllers/expenseController";

// Mounted at /api/trips/:tripId/expenses (needs mergeParams for req.params.tripId).
export const expensesRouter = Router({ mergeParams: true });
expensesRouter.get("/", asyncHandler(expenseController.list));
expensesRouter.post("/", asyncHandler(expenseController.create));

// Mounted standalone at /api/expenses for single-resource access by id.
export const expenseByIdRouter = Router();
expenseByIdRouter.get("/:id", asyncHandler(expenseController.get));
expenseByIdRouter.put("/:id", asyncHandler(expenseController.update));
expenseByIdRouter.delete("/:id", asyncHandler(expenseController.remove));
