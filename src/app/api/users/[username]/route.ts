import { prisma } from "@/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    console.log("Fetching public profile for:", username)

    // Get current session using the new auth() helper
    const session = await auth()

    // Find user with their public profile data
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        github: true,
        website: true,
        twitter: true,
        location: true,
        currentRole: true,
        company: true,
        techStack: true,
        yearsOfExperience: true,
        lookingForWork: true,
        image: true,
        resources: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            title: true,
            url: true,
            type: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create the public profile response
    const publicProfile = {
      ...user,
      isOwner: session?.user?.email === user.email,
      // Only show email if it's the profile owner
      email: session?.user?.email === user.email ? user.email : undefined,
    }

    console.log("Found user profile:", user.username)
    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error("[PUBLIC_PROFILE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}