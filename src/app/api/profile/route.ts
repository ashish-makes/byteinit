/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function PUT(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const data = await req.json();
        
        const updateData = {
            ...(data.name && { name: data.name }),
            ...(data.bio && { bio: data.bio }),
            ...(data.location && { location: data.location }),
            ...(data.website && { website: data.website }),
            ...(data.github && { github: data.github }),
            ...(data.twitter && { twitter: data.twitter }),
            ...(data.techStack && { techStack: data.techStack }),
            ...(data.yearsOfExperience && { yearsOfExperience: data.yearsOfExperience }),
            ...(data.currentRole && { currentRole: data.currentRole }),
            ...(data.company && { company: data.company }),
            ...(typeof data.lookingForWork === 'boolean' && { lookingForWork: data.lookingForWork }),
            image: session.user.image || data.image || null,
        };
        
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
            select: {
                name: true,
                email: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                github: true,
                twitter: true,
                techStack: true,
                yearsOfExperience: true,
                currentRole: true,
                company: true,
                lookingForWork: true
            }
        });

        return NextResponse.json({ data: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                github: true,
                twitter: true,
                techStack: true,
                yearsOfExperience: true,
                currentRole: true,
                company: true,
                lookingForWork: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
