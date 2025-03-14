import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubId, githubUsername, githubEmail } = body;
    
    // Create a response with cookies
    const response = NextResponse.json({ success: true });
    
    // Set cookies with a 5-minute expiration (300 seconds)
    if (githubId) {
      response.cookies.set("github-id", githubId, { 
        maxAge: 300,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      });
    }
    
    if (githubUsername) {
      response.cookies.set("github-username", githubUsername, { 
        maxAge: 300,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      });
    }
    
    if (githubEmail) {
      response.cookies.set("github-email", githubEmail, { 
        maxAge: 300,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error storing GitHub info:", error);
    return NextResponse.json(
      { error: "Failed to store GitHub information" },
      { status: 500 }
    );
  }
} 