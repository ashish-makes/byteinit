import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { email, callbackUrl = "/dashboard" } = body;

    // Check if we have the email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Get GitHub credentials from cookies - using request cookies to avoid async issues
    const githubId = request.cookies.get("github-id")?.value;
    const githubUsername = request.cookies.get("github-username")?.value;
    const githubEmail = request.cookies.get("github-email")?.value;

    console.log("Linking GitHub account", {
      userEmail: email,
      githubId,
      githubUsername,
      githubEmail
    });

    // Verify we have GitHub credentials
    if (!githubId) {
      return NextResponse.json(
        { error: "No GitHub credentials found. Try signing in with GitHub first." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with this email address" },
        { status: 404 }
      );
    }

    // Check if account already exists
    const existingAccount = user.accounts.find(
      (account) => account.provider === "github"
    );

    if (existingAccount) {
      // Update the existing GitHub account
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          providerAccountId: githubId,
        },
      });
    } else {
      // Create a new GitHub account and link it
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "github",
          providerAccountId: githubId,
        },
      });
    }

    // Update user's GitHub username if available
    if (githubUsername) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          github: githubUsername, // Update the existing github field
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "GitHub account linked successfully",
      callbackUrl 
    });
    
  } catch (error) {
    console.error("Error linking GitHub account:", error);
    return NextResponse.json(
      { error: "Failed to link GitHub account" },
      { status: 500 }
    );
  }
} 