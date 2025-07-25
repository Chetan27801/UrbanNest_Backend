import { Router } from "express";

//Controllers
import {
	createProperty,
	getAllProperties,
	getPropertyById,
	updateProperty,
	deleteProperty,
	uploadImage,
	searchProperty,
	aiSearch,
} from "../controllers/property.controller";

//Middleware
import {
	validateBody,
	validateQuery,
} from "../middleware/validation.middleware";

//Schema
import {
	createPropertySchema,
	updatePropertySchema,
	searchPropertySchema,
} from "../schema/property.schema";
import upload from "../middleware/upload.middleware";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

//--------------------------------Routes--------------------------------

//create property by landlord
router.post(
	"/",
	authMiddleware(["landlord"]),
	validateBody(createPropertySchema),
	createProperty as any
);

//get all properties
router.get(
	"/get-all",
	authMiddleware(["admin", "landlord"]),
	getAllProperties as any
);

//get property by property id also filter with id of a user if user is landlord
router.get(
	"/get-by-id/:id",
	authMiddleware(["admin", "landlord"]),
	getPropertyById as any
);

//update property with property id by landlord
router.put(
	"/update/:id",
	authMiddleware(["landlord"]),
	validateBody(updatePropertySchema),
	updateProperty as any
);

//delete property with property id by landlord
router.delete(
	"/delete/:id",
	authMiddleware(["landlord"]),
	deleteProperty as any
);

// Property search with advanced filtering including geolocation
// Supports: text search, price range, property type, amenities, highlights, beds/baths, square feet
// Geolocation: Use lat, lng, radius (in km) to find properties within a specific radius
router.get(
	"/search",
	validateQuery(searchPropertySchema),
	searchProperty as any
);



//TODO: AI Search implementation with Perplexity API
//ai search for properties
router.get(
	"/ai-search",
	authMiddleware(["admin", "landlord"]),
	aiSearch as any
);


//TODO: Upload image to S3
router.post(
	"/upload",
	authMiddleware(["admin", "landlord"]),
	upload.single("image"),
	uploadImage as any
);

export default router;
