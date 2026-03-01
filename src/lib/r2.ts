import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// TERAMAP - Cloudflare R2 Upload Service
// ============================================================

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "teramap";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a single file to R2
 */
export async function uploadToR2(
  file: File | Blob,
  folder: string = "uploads"
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file melebihi batas maksimal 5MB`);
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Format file tidak didukung. Gunakan JPEG, PNG, atau WebP`);
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${folder}/${uuidv4()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return {
    url: `/api/files/${key}`,
    key,
  };
}

/**
 * Upload multiple files to R2 (max 5)
 */
export async function uploadMultipleToR2(
  files: File[],
  folder: string = "uploads",
  maxFiles: number = 5
): Promise<UploadResult[]> {
  if (files.length > maxFiles) {
    throw new Error(`Maksimal ${maxFiles} file yang diizinkan`);
  }

  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadToR2(file, folder);
    results.push(result);
  }

  return results;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error("[R2] Failed to delete:", key, error);
  }
}

/**
 * Upload a base64 image to R2 (from camera capture)
 */
export async function uploadBase64ToR2(
  base64Data: string,
  folder: string = "captures"
): Promise<UploadResult> {
  // Remove data URL prefix if present
  const base64Clean = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const buffer = Buffer.from(base64Clean, "base64");

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file melebihi batas maksimal 5MB`);
  }

  // Determine content type from data URL
  const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
  const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`Tipe file tidak didukung: ${contentType}. Gunakan JPEG, PNG, atau WebP.`);
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";

  const key = `${folder}/${uuidv4()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    url: `/api/files/${key}`,
    key,
  };
}

/**
 * Get a presigned URL for a file in R2
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get file from R2 as stream/buffer
 */
export async function getFileFromR2(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  const response = await s3Client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType || "application/octet-stream",
    contentLength: response.ContentLength,
  };
}

/**
 * Extract R2 key from URL (handles both old public URLs and new proxy URLs)
 */
export function extractKeyFromUrl(url: string): string | null {
  // Handle /api/files/... proxy URLs
  const proxyMatch = url.match(/\/api\/files\/(.+)/);
  if (proxyMatch) return proxyMatch[1];

  // Handle old R2 public URLs
  const r2Match = url.match(/r2\.cloudflarestorage\.com\/(.+)/);
  if (r2Match) return r2Match[1];

  return null;
}
