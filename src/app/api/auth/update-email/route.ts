import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to update your email" },
        { status: 401 }
      );
    }

    // Get the email from the request body
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Check if the email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This email is already in use by another account" },
        { status: 400 }
      );
    }

    // Check if we're updating from a placeholder email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    });

    const isUpdatingFromPlaceholder = currentUser?.email?.includes("placeholder.com") || false;
    console.log("Updating from placeholder email:", isUpdatingFromPlaceholder);
    console.log("Current email:", currentUser?.email);
    console.log("New email:", email);

    // Update the user's email
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        email,
        // If we were using a placeholder email, we should update the emailVerified field
        emailVerified: isUpdatingFromPlaceholder 
          ? new Date() 
          : undefined
      },
    });

    console.log("User email updated successfully:", updatedUser.email);

    return NextResponse.json(
      { 
        success: true, 
        message: "Email updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isVerified: !!updatedUser.emailVerified
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "An error occurred while updating your email" },
      { status: 500 }
    );
  }
} 