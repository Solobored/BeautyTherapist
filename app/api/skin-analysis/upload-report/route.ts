import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { saveSkinAnalysis } from '@/lib/skin-analysis-store'
import { isSkinSessionToken } from '@/lib/skin-analysis'
import { checkRateLimit, clientIp } from '@/lib/rate-limit-ip'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_REPORT_BYTES = 10 * 1024 * 1024
const ALLOWED_REPORT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const limit = checkRateLimit(`skin-analysis-report:${clientIp(request)}`, 6, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Demasiados archivos. Inténtalo de nuevo más tarde.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
      )
    }
    const formData = await request.formData()
    const file = formData.get('file')
    const sessionToken = formData.get('sessionToken')
    if (!(file instanceof File) || !isSkinSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Archivo o sesión inválidos' }, { status: 400 })
    }
    if (formData.get('privacyConsent') !== 'true') {
      return NextResponse.json({ error: 'Debes aceptar el aviso de privacidad' }, { status: 400 })
    }
    if (!ALLOWED_REPORT_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG, WebP o documentos PDF' }, { status: 400 })
    }
    if (file.size <= 0 || file.size > MAX_REPORT_BYTES) {
      return NextResponse.json({ error: 'El archivo debe pesar hasta 10 MB' }, { status: 400 })
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'El servicio de archivos no está configurado' }, { status: 503 })
    }

    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image'
    const buffer = Buffer.from(await file.arrayBuffer())
    const upload = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'beauty-therapy/skin-reports', resource_type: resourceType },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Cloudinary no devolvió un archivo'))
          else resolve(result)
        },
      ).end(buffer)
    })

    const reportFileType = resourceType === 'raw' ? 'pdf' : 'image'
    const { id, error } = await saveSkinAnalysis({
      sessionToken,
      source: 'professional_report',
      reportFileUrl: upload.secure_url,
      reportFileType,
      reportFilePublicId: upload.public_id,
    })
    if (error || !id) {
      console.error('skin-analysis report save', error)
      return NextResponse.json({ error: 'El archivo se subió, pero no se pudo guardar el análisis' }, { status: 500 })
    }

    return NextResponse.json({ analysisId: id, reportFileUrl: upload.secure_url }, { status: 201 })
  } catch (error) {
    console.error('skin-analysis upload-report', error)
    return NextResponse.json({ error: 'No se pudo subir el informe' }, { status: 500 })
  }
}