// src/app/api/user/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return user profile information
  return NextResponse.json({
    name: session.user.name,
    image: session.user.image,
    email: session.user.email
  });
}