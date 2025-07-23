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

    // Generate a professional bio with a developer focus
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional bio writer specializing in developer profiles. Create concise, impactful bios that:
- Highlight technical expertise and achievements
- Maintain a professional tone while showing personality
- Focus on value proposition and impact
- Include relevant tech stack and experience
- Keep length between 2-3 sentences for bio
- Create a one-line tagline that captures their professional essence

Return ONLY a JSON object with exactly these fields:
{
  "bio": "professional bio text",
  "tagline": "professional tagline"
}`
        },
        {
          role: "user",
          content: `Create a professional bio and tagline for this developer profile. Focus on their technical expertise and unique value proposition:

${JSON.stringify({
  name: userDetails.name,
  github: userDetails.github,
  techStack: userDetails.techStack,
  currentRole: userDetails.currentRole,
  company: userDetails.company,
  yearsOfExperience: userDetails.yearsOfExperience,
  lookingForWork: userDetails.lookingForWork
}, null, 2)}

Guidelines:
- Write in third person
- Highlight technical expertise first
- Mention current role/company if available
- Include years of experience if available
- Note if they're open to opportunities
- Keep it professional but personable
- Focus on impact and value-add
- Incorporate tech stack naturally

Return as JSON with only bio and tagline fields.`
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from AI");
    }

    const generatedData = JSON.parse(content);

    // Merge core user details with the generated narrative while preserving certain values
    const enhancedProfile = {
      id: userDetails.id,
      username: userDetails.username,
      name: userDetails.name,
      email: userDetails.email,
      image: userDetails.image,
      bio: generatedData.bio || userDetails.bio || "",
      tagline: generatedData.tagline || "",
      github: userDetails.github,
      website: userDetails.website
        ? userDetails.website.startsWith("http")
          ? userDetails.website
          : `https://${userDetails.website}`
        : null,
      lookingForWork: userDetails.lookingForWork ?? false,
      resources: userDetails.resources || [],
      techStack: userDetails.techStack,
      currentRole: userDetails.currentRole,
      company: userDetails.company,
      location: userDetails.location,
      yearsOfExperience: userDetails.yearsOfExperience,
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
