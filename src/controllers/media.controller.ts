import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import { MediaService } from "../utils/media";

export const createPresignedUrl = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { folder, subfolder, fileName, fileType, fileSize } = req.body;

		if (!folder || !fileType) {
			return next(createError("Folder and file type are required", 400));
		}

		const key = MediaService.generateFileKey(folder, subfolder, fileName);

		// Use actual file size if provided, otherwise set a reasonable max size
		const contentLength = fileSize || 1024 * 1024 * 10; // 10MB default

		const url = await MediaService.createPresignedUrl(key, {
			ContentType: fileType,
			ContentLength: contentLength,
		});

		return res.status(200).json({
			success: true,
			message: "Presigned url created successfully",
			url,
			key,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const getMediaUrl = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { key } = req.params;

		if (!key) {
			return next(createError("Key parameter is required", 400));
		}

		// Decode the URL-encoded key
		const decodedKey = decodeURIComponent(key);
		console.log("Getting media URL for key:", decodedKey);

		const url = await MediaService.getMediaUrl(decodedKey);

		return res.status(200).json({
			success: true,
			url,
		});
	} catch (error) {
		console.error("Error getting media URL:", error);
		return next(createError("Failed to get media URL", 500, String(error)));
	}
};
