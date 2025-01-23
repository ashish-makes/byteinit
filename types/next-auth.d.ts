// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Ensure that id is always a string
      role?: string; // Role can be optional
      bio?: string; // User bio
      location?: string; // User location
      website?: string; // User website URL
      github?: string; // GitHub profile URL
      twitter?: string; // Twitter profile URL
      techStack?: string; // User's preferred tech stack
      yearsOfExperience?: string; // Years of experience as a string
      lookingForWork?: boolean; // Job-seeking status
      currentRole?: string; // Current job role
      company?: string; // Current company
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // Ensure that id is always a string
    role?: string; // Role can be optional
    bio?: string; // User bio
    location?: string; // User location
    website?: string; // User website URL
    github?: string; // GitHub profile URL
    twitter?: string; // Twitter profile URL
    techStack?: string; // User's preferred tech stack
    yearsOfExperience?: string; // Years of experience as a string
    lookingForWork?: boolean; // Job-seeking status
    currentRole?: string; // Current job role
    company?: string; // Current company
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Ensure that id is always a string
    role?: string; // Role can be optional
    bio?: string; // User bio
    location?: string; // User location
    website?: string; // User website URL
    github?: string; // GitHub profile URL
    twitter?: string; // Twitter profile URL
    techStack?: string; // User's preferred tech stack
    yearsOfExperience?: string; // Years of experience as a string
    lookingForWork?: boolean; // Job-seeking status
    currentRole?: string; // Current job role
    company?: string; // Current company
    resources?: {
      id: string;
      title: string;
      description: string;
      url: string;
      type: string;
      category: string;
      tags?: string[];
    }[];
    savedResources?: {
      id: string;
      resourceId: string;
    }[];
  }
}
