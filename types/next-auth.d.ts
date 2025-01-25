import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      image?: string | null // Add this line
      role?: string
      bio?: string
      location?: string
      website?: string
      github?: string
      twitter?: string
      techStack?: string
      yearsOfExperience?: string
      lookingForWork?: boolean
      currentRole?: string
      company?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    image?: string | null // Add this line
    role?: string
    bio?: string
    location?: string
    website?: string
    github?: string
    twitter?: string
    techStack?: string
    yearsOfExperience?: string
    lookingForWork?: boolean
    currentRole?: string
    company?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    image?: string | null // Add this line
    role?: string
    bio?: string
    location?: string
    website?: string
    github?: string
    twitter?: string
    techStack?: string
    yearsOfExperience?: string
    lookingForWork?: boolean
    currentRole?: string
    company?: string
    resources?: {
      id: string
      title: string
      description: string
      url: string
      type: string
      category: string
      tags?: string[]
    }[]
    savedResources?: {
      id: string
      resourceId: string
    }[]
  }
}

