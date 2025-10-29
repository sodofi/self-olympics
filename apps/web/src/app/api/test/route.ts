import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  console.log('✅ Test endpoint hit!');
  return NextResponse.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  }, { headers: corsHeaders });
}

export async function POST() {
  console.log('✅ Test POST endpoint hit!');
  return NextResponse.json({
    message: 'POST is working!',
    timestamp: new Date().toISOString()
  }, { headers: corsHeaders });
}

