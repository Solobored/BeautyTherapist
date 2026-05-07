import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const webpOnly = formData.get('webpOnly') === 'true';
    const resourceType = formData.get('resourceType') === 'video' ? 'video' : 'image';
    const folder = String(
      formData.get('folder') ??
        (resourceType === 'video' ? 'beauty-therapy/seller-videos' : 'beauty-therapy/uploads')
    ).trim();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes =
      resourceType === 'video'
        ? ALLOWED_VIDEO_TYPES
        : webpOnly
          ? ['image/webp']
          : ALLOWED_IMAGE_TYPES;
    const maxFileSize = resourceType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    // Validate file size
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error:
            resourceType === 'video'
              ? `El video supera el limite de 100MB. Tamano: ${(file.size / 1024 / 1024).toFixed(2)}MB`
              : `File size exceeds 5MB limit. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: webpOnly
            ? 'Solo se permiten archivos WebP'
            : `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const uploadOptions =
      resourceType === 'video'
        ? {
            folder,
            resource_type: 'video' as const,
            format: 'mp4',
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
            eager: [{ width: 400, height: 711, crop: 'fill', format: 'webp', start_offset: '0' }],
            eager_async: true,
          }
        : {
            folder,
            resource_type: 'image' as const,
            format: 'webp',
            quality: 'auto',
            fetch_format: 'auto',
            flags: ['progressive', 'immutable_cache'],
            transformation: [{ quality: 'auto', fetch_format: 'webp', flags: 'progressive' }],
            colors: true,
            default_source: true,
            responsive_width: true,
            eager_async: true,
          }

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve(
              NextResponse.json(
                { error: 'Error al subir la imagen' },
                { status: 500 }
              )
            );
          } else if (result) {
            resolve(
              NextResponse.json({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                size: result.bytes,
                format: result.format,
                colors: result.colors || [],
                resourceType,
                thumbnailUrl:
                  resourceType === 'video'
                    ? result.eager?.[0]?.secure_url ||
                      result.secure_url.replace(
                        '/video/upload/',
                        '/video/upload/so_0,f_webp,w_400,h_711,c_fill/'
                      )
                    : undefined,
                duration: resourceType === 'video' ? result.duration : undefined,
              })
            );
          }
        }
      );

      uploadStream.end(uint8Array);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}
