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
	uploadVideo,
	uploadMultipleMedia,
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
import authMiddleware from "../middleware/auth.middleware";
import { uploadPropertyMedia } from "../middleware/upload.middleware";

const router = Router();

//--------------------------------Routes--------------------------------

//create property by landlord
router.post(
	"/",
	authMiddleware(["landlord"]),
	uploadPropertyMedia.array("photoUrls", 10),
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

//upload single image
router.post(
	"/upload/image",
	authMiddleware(["admin", "landlord"]),
	uploadPropertyMedia.single("image"),
	uploadImage as any
);

//upload single video
router.post(
	"/upload/video",
	authMiddleware(["admin", "landlord"]),
	uploadPropertyMedia.single("video"),
	uploadVideo as any
);

//upload multiple files (max 10 files)
router.post(
	"/upload/multiple",
	authMiddleware(["admin", "landlord"]),
	uploadPropertyMedia.array("files", 10), //max 10 files
	uploadMultipleMedia as any
);

export default router;
