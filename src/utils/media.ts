// TODO: Amazon S3 bucket configuration

import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export interface UploadResult {
	url: string;
	key: string;
	type: "image" | "video";
	size: number;
	filename: string;
}

export class MediaService {
	/**
	 * helper function
	 */

	private static getMediaType(key: string): "image" | "video" {
		return key.includes("/images/") ? "image" : "video";
	}

	private static getMediaCategory(key: string): string {
		const parts = key.split("/");
		return parts[parts.length - 2] || "unknown";
	}
	static async getMediaUrl(key: string) {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});
		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600,
		});
		return url;
	}

	//NEW CODE FOR UPLOADING FILES
	/**
	 * Create a presigned url to upload a file to S3
	 */
	static async createPresignedUrl(
		key: string,
		fileMetadata: {
			ContentType: string;
			ContentLength: number;
		}
	) {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			...fileMetadata,
		});

		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600,
		});
		return url;
	}



	//OLD CODE FOR UPLOADING FILES
	/**
	 * Core function: Uploads a file to S3
	 */

	static async uploadToS3(
		file: Express.Multer.File,
		folder: string,
		subfolder?: string
	): Promise<UploadResult> {
		const fileExtension = path.extname(file.originalname);
		const fileName = `${uuidv4()}${fileExtension}`;
		const key = subfolder
			? `${folder}/${subfolder}/${fileName}`
			: `${folder}/${fileName}`;

		const uploadParams = {
			Bucket: BUCKET_NAME,
			Key: key,
			Body: file.buffer,
			ContentType: file.mimetype,
			CacheControl: "max-age=31536000",
		};

		try {
			//user multipart upload for large files
			if (file.size > 1024 * 1024 * 5) {
				const upload = new Upload({
					client: s3Client,
					params: uploadParams,
				});

				await upload.done();
			} else {
				const command = new PutObjectCommand(uploadParams);
				await s3Client.send(command);
			}

			const url = await this.getMediaUrl(key);

			return {
				url,
				key,
				type: file.mimetype.startsWith("image/") ? "image" : "video",
				size: file.size,
				filename: file.originalname,
			};
		} catch (error) {
			throw new Error(`Failed to upload file: ${error}`);
		}
	}

	/**
	 * Core function: Delete media from S3
	 */
	static async deleteFromS3(key: string): Promise<void> {
		const deleteParams = {
			Bucket: BUCKET_NAME,
			Key: key,
		};

		try {
			const command = new DeleteObjectCommand(deleteParams);
			await s3Client.send(command);
		} catch (error) {
			throw new Error(`Failed to delete file: ${error}`);
		}
	}

	//OLD CODE FOR UPLOADING MULTIPLE FILES
	/**
	 * Core function: Upload multiple file
	 */
	static async uploadMultiple(
		files: Express.Multer.File[],
		folder: string,
		subfolder?: string
	): Promise<UploadResult[]> {
		const uploadPromises = files.map((file) =>
			this.uploadToS3(file, folder, subfolder)
		);

		const results = await Promise.all(uploadPromises);

		return results;
	}

	//-------------User media-------------
	/**
	 * Upload user avatar
	 */

	//OLD CODE FOR UPLOADING USER AVATAR
	static async uploadUserAvatar(
		file: Express.Multer.File,
		userId: string
	): Promise<UploadResult> {
		const folder = `users/avatars/${userId}`;
		return this.uploadToS3(file, folder);
	}

	//NEW CODE FOR UPLOADING USER AVATAR
	static async createPresignedUrlForUserAvatar(userId: string) {
		const key = `users/avatars/${userId}`;
		const url = await this.createPresignedUrl(key, {
			ContentType: "image/jpeg",
			ContentLength: 1024 * 1024 * 5,
		});
		return url;
	}

	/**
	 * Get user avatar
	 */
	static async getUserAvatar(userId: string) {
		const listParams = {
			Bucket: BUCKET_NAME,
			Prefix: `users/avatars/${userId}`,
		};

		try {
			const command = new ListObjectsV2Command(listParams);
			const response = await s3Client.send(command);

			const avatar = response.Contents?.[0];
			if (!avatar || !avatar.Key) return null;

			const url = await this.getMediaUrl(avatar.Key);

			return {
				url,
				key: avatar.Key,
				type: this.getMediaType(avatar.Key),
				size: avatar.Size || 0,
				filename: avatar.Key.split("/").pop() || "",
				lastModified: avatar.LastModified || new Date(),
			};
		} catch (error) {
			throw new Error(`Failed to get user avatar: ${error}`);
		}
	}

	//-------------PROPERTY MEDIA-------------

	//OLD CODE FOR UPLOADING PROPERTY MEDIA
	/**
	 * Upload property media (images and videos)
	 */
	static async uploadPropertyMedia(
		file: Express.Multer.File,
		propertyId: string,
		mediaType: "image" | "video",
		category: string
	): Promise<UploadResult> {
		const folder = `properties/${propertyId}/${mediaType}/${category}`;
		return this.uploadToS3(file, folder);
	}

	//NEW CODE FOR UPLOADING PROPERTY MEDIA
	/**
	 * Create a presigned url to upload a property media
	 */
	static async createPresignedUrlForPropertyMedia(
		propertyId: string,
		mediaType: "image" | "video",
		category: string
	) {
		const key = `properties/${propertyId}/${mediaType}/${category}`;
		const url = await this.createPresignedUrl(key, {
			ContentType: mediaType === "image" ? "image/jpeg" : "video/mp4",
			ContentLength:
				mediaType === "image" ? 1024 * 1024 * 10 : 1024 * 1024 * 50,
		});

		return url;
	}

	/**
	 * Get all media of a property
	 */
	static async getPropertyMedia(propertyId: string) {
		const listParams = {
			Bucket: BUCKET_NAME,
			Prefix: `properties/${propertyId}`,
		};

		try {
			const command = new ListObjectsV2Command(listParams);
			const response = await s3Client.send(command);
			const urls = await Promise.all(
				response.Contents?.map((item) => this.getMediaUrl(item.Key!)) || []
			);

			const mediaItems =
				response.Contents?.map((item, index) => ({
					url: urls[index],
					key: item.Key,
					type: this.getMediaType(item.Key!),
					category: this.getMediaCategory(item.Key!),
					size: item.Size || 0,
					filename: item.Key?.split("/").pop() || "",
					lastModified: item.LastModified || new Date(),
				})) || [];

			return {
				images: mediaItems.filter((item) => item.type === "image"),
				video: mediaItems.filter((item) => item.type === "video"),
				all: mediaItems,
			};
		} catch (error) {
			throw new Error(`Failed to get property media: ${error}`);
		}
	}
}
