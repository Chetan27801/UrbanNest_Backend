import multer from "multer";

//user memery storage for S3
const storage = multer.memoryStorage();

const IMAGE_SIZE_LIMIT = 1024 * 1024 * 10; // 10MB
const VIDEO_SIZE_LIMIT = 1024 * 1024 * 50; // 50MB
const AVATAR_SIZE_LIMIT = 1024 * 1024 * 5; // 5MB

//different configuration for different upload types
const uploadPropertyMedia = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/png",
			"image/jpg",
			"image/webp",
		];
		const allowedVideoTypes = [
			"video/mp4",
			"video/mov",
			"video/avi",
			"video/mkv",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			const contentLength = parseInt(req.headers["content-length"] || "0");
			if (contentLength > IMAGE_SIZE_LIMIT) {
				return cb(new Error("Image size exceeds the limit") as any, false);
			}
			cb(null, true);
		} else if (allowedVideoTypes.includes(file.mimetype)) {
			const contentLength = parseInt(req.headers["content-length"] || "0");
			if (contentLength > VIDEO_SIZE_LIMIT) {
				return cb(new Error("Video size exceeds the limit") as any, false);
			}
			cb(null, true);
		} else {
			cb(new Error("Invalid file type") as any, false);
		}
	},
});


//user avatar upload
const uploadUserAvatar = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
		if (allowedMimeTypes.includes(file.mimetype)) {
			const contentLength = parseInt(req.headers["content-length"] || "0");
			if (contentLength > AVATAR_SIZE_LIMIT) {
				return cb(new Error("Avatar size exceeds the limit") as any, false);
			}
			cb(null, true);
		} else {
			cb(new Error("Invalid file type") as any, false);
		}
	},
});

export { uploadPropertyMedia, uploadUserAvatar };
