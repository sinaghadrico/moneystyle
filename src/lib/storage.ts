import { Client as MinioClient } from "minio";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export interface StorageProvider {
  upload(path: string, buffer: Buffer, contentType: string): Promise<void>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
  getBuffer(path: string): Promise<Buffer>;
}

class MinioStorageProvider implements StorageProvider {
  private client: MinioClient;
  private bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || "transaction-media";
    this.client = new MinioClient({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT || "9000", 10),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, path, buffer, buffer.length, {
      "Content-Type": contentType,
    });
  }

  async delete(path: string): Promise<void> {
    await this.client.removeObject(this.bucket, path);
  }

  getPublicUrl(path: string): string {
    return `/api/media/${path}`;
  }

  async getBuffer(path: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, path);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "transaction-media";
    this.client = new S3Client({
      region: process.env.AWS_REGION || "me-south-1",
    });
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: contentType,
      })
    );
  }

  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      })
    );
  }

  getPublicUrl(path: string): string {
    return `/api/media/${path}`;
  }

  async getBuffer(path: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      })
    );
    const stream = res.Body as AsyncIterable<Uint8Array>;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

function createStorageProvider(): StorageProvider {
  if (process.env.AWS_S3_BUCKET) {
    return new S3StorageProvider();
  }
  return new MinioStorageProvider();
}

export const storage: StorageProvider = createStorageProvider();
export const BUCKET =
  process.env.AWS_S3_BUCKET || process.env.MINIO_BUCKET || "transaction-media";
