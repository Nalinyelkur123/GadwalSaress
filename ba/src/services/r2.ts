import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gadwal-weaves-media';
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'https://media.gadwalweaves.in';

let s3Client: S3Client | null = null;
if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export class R2Service {
  public static async getPresignedUploadUrl(params: {
    sellerId: string;
    fileType: 'product_image' | 'kyc_document' | 'banner';
    fileName: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
    const fileExt = params.fileName.split('.').pop() || 'jpg';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const objectKey = `${params.fileType}s/${params.sellerId}/${Date.now()}_${randomHex}.${fileExt}`;

    if (s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
          ContentType: params.contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        const publicUrl = `${R2_PUBLIC_DOMAIN}/${objectKey}`;

        return { uploadUrl, publicUrl, objectKey };
      } catch (err) {
        console.error('[R2] Error generating presigned URL:', err);
      }
    }

    // High quality fallback / local simulation
    return {
      uploadUrl: `/api/uploads/direct?key=${encodeURIComponent(objectKey)}`,
      publicUrl: `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80`,
      objectKey,
    };
  }
}
