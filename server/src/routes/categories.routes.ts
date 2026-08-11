import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import * as categoryController from "../controllers/categoryController";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get("/", asyncHandler(categoryController.list));
categoriesRouter.post("/", asyncHandler(categoryController.create));
categoriesRouter.put("/:id", asyncHandler(categoryController.update));
categoriesRouter.delete("/:id", asyncHandler(categoryController.remove));
