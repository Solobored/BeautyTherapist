import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Falta configurar Cloudinary en las variables de entorno.' },
        { status: 500 }
      )
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'beauty-therapy/seller-videos'
    const eager = 'so_0,f_webp,w_400,h_711,c_fill'
    const transformation = 'q_auto:good,f_mp4,vc_h264,ac_aac,br_1200k'
    const paramsToSign = {
      eager,
      folder,
      format: 'mp4',
      timestamp,
      transformation,
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    return NextResponse.json({
      apiKey,
      cloudName,
      eager,
      folder,
      format: 'mp4',
      signature,
      timestamp,
      transformation,
    })
  } catch (error) {
    console.error('video-signature POST', error)
    return NextResponse.json({ error: 'No se pudo preparar la subida del video.' }, { status: 500 })
  }
}
