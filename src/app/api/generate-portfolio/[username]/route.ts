import { Groq } from "groq-sdk";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const { username } = await params;
    
    // Create normalized version by removing special characters and spaces
    const normalizedSearch = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    console.log('Searching for user with:', {
      originalUsername: username,
      normalizedUsername: normalizedSearch
    });

    // First try exact match
    let userDetails = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      },
      select: {
        id: true,
        username: true,
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
        lookingForWork: true,
        resources: {
          select: {
            title: true,
            url: true,
            type: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        followers: {
          select: {
            id: true,
          }
        },
        following: {
          select: {
            id: true,
          }
        },
        _count: {
          select: {
            followers: true,
            following: true
          }
        },
        blogs: {
          where: { published: true },
          orderBy: [
            { votes: { _count: 'desc' }},
            { createdAt: 'desc' }
          ],
          take: 3,
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            createdAt: true,
            _count: {
              select: {
                votes: true,
                comments: true
              }
            }
          }
        }
      }
    });

    // If no exact match found, try fuzzy match
    if (!userDetails) {
      userDetails = await prisma.user.findFirst({
        where: {
          OR: [
            {
              username: {
                contains: normalizedSearch,
                mode: 'insensitive'
              }
            },
            {
              email: {
                startsWith: normalizedSearch,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          username: true,
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
          lookingForWork: true,
          resources: {
            select: {
              title: true,
              url: true,
              type: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          followers: {
            select: {
              id: true,
            }
          },
          following: {
            select: {
              id: true,
            }
          },
          _count: {
            select: {
              followers: true,
              following: true
            }
          },
          blogs: {
            where: { published: true },
            orderBy: [
              { votes: { _count: 'desc' }},
              { createdAt: 'desc' }
            ],
            take: 3,
            select: {
              id: true,
              title: true,
              slug: true,
              summary: true,
              createdAt: true,
              _count: {
                select: {
                  votes: true,
                  comments: true
                }
              }
            }
          }
        },
      });
    }

    console.log('Found user:', userDetails?.username);

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Generate a narrative bio using a witty developer voice
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a witty developer bio writer who loves tech puns and coding humor.
            Create engaging, fun narratives that blend technical expertise with personality.
            Use casual developer lingo, occasional tech jokes, and clever wordplay.
            Keep it professional but fun - think "debugging life one coffee at a time" style.
            Include a fun tagline or catchphrase that reflects their tech stack.
            Return the response in JSON format.`,
        },
        {
          role: "user",
          content: `Create a fun, dev-style bio using this information:
            ${JSON.stringify(userDetails, null, 2)}
            
            Add personality with:
            - A clever tech-related tagline
            - Light coding humor
            - Developer culture references
            - Coffee or debugging jokes if appropriate
            - Playful tech stack presentation
            
            Keep it professional enough for recruiters but fun enough for fellow devs.
            
            Return in the same JSON format as before.`,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from AI");
    }

    const generatedData = JSON.parse(content);

    // Merge core user details with the generated narrative while preserving certain values
    const enhancedProfile = {
      ...generatedData,
      id: userDetails.id,
      username: userDetails.username,
      name: userDetails.name,
      email: userDetails.email,
      image: userDetails.image,
      github: userDetails.github || generatedData.github,
      website: userDetails.website
        ? userDetails.website.startsWith("http")
          ? userDetails.website
          : `https://${userDetails.website}`
        : generatedData.website,
      lookingForWork: userDetails.lookingForWork ?? false,
      resources: userDetails.resources || [],
      techStack: userDetails.techStack || generatedData.techStack,
      currentRole: userDetails.currentRole || generatedData.currentRole,
      company: userDetails.company || generatedData.company,
      location: userDetails.location || generatedData.location,
      followerCount: userDetails._count.followers,
      followingCount: userDetails._count.following,
      isFollowing: currentUserId ? userDetails.followers.some(f => f.id === currentUserId) : false,
      isOwner: currentUserId === userDetails.id,
      blogs: userDetails.blogs || []
    };

    return NextResponse.json({
      profile: enhancedProfile,
    });
  } catch (error) {
    console.error("Portfolio generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio" },
      { status: 500 }
    );
  }
}
