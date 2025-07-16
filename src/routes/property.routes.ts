import { Router } from "express";

//Controllers
import {
	createProperty,
	getAllProperties,
	getPropertyById,
	updateProperty,
	deleteProperty,
} from "../controllers/property.controller";

//Middleware
import { validateSchema } from "../middleware/validation.middleware";

//Schema
import {
	createPropertySchema,
	updatePropertySchema,
} from "../schema/property.schema";

const router = Router();

router.post("/", validateSchema(createPropertySchema), createProperty as any);
router.get("/", getAllProperties as any);
router.get("/:id", getPropertyById as any);
router.put("/:id", validateSchema(updatePropertySchema), updateProperty as any);
router.delete("/:id", deleteProperty as any);

export default router;
