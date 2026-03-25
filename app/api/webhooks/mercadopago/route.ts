import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // NOTE: Mercado Pago webhook integration disabled
  // This endpoint is disabled and will be re-implemented when Mercado Pago is configured
  
  console.log('Mercado Pago webhook received but integration is disabled');
  
  return NextResponse.json({ 
    received: true, 
    message: 'Webhook integration pending - Mercado Pago configuration needed'
  });
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for webhooks.' },
    { status: 405 }
  );
}
