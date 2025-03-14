/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import GitHub from "next-auth/providers/github"

// Use the default adapter but override the problematic methods
const customAdapter = {
  ...PrismaAdapter(prisma),
  
  // Override createUser to fix the ID format issue with MongoDB
  async createUser(user: { email?: string, name?: string, id?: string, [key: string]: any }) {
    try {
      // Log what's coming in so we can diagnose issues
      console.log("createUser called with:", {
        githubLogin: user.githubLogin,
        email: user.email,
        name: user.name
      });
      
      // Check if user came from GitHub OAuth (has githubLogin but no email)
      const isGithubUser = user.githubLogin && !user.email;
      let existingUser = null;
      
      // For GitHub users, first try to find existing user by GitHub username
      // This is more reliable than account lookups which happen after user creation
      if (isGithubUser && user.githubLogin) {
        console.log("Looking for existing user by GitHub username:", user.githubLogin);
        
        existingUser = await prisma.user.findFirst({
          where: { github: user.githubLogin }
        });
        
        if (existingUser) {
          console.log("Found existing user by GitHub username:", existingUser.id);
          
          // If this user already has a real email (not placeholder), use that
          if (existingUser.email && !existingUser.email.includes("placeholder.com")) {
            console.log("User already has a real email:", existingUser.email);
            return existingUser;
          }
        }
      }

      // Next, for GitHub users, check if a user exists with the placeholder email pattern
      if (isGithubUser && !existingUser && user.githubLogin) {
        const placeholderEmail = `github_${user.githubLogin}@placeholder.com`;
        console.log("Checking for existing user with placeholder email:", placeholderEmail);
        
        existingUser = await prisma.user.findUnique({ 
          where: { email: placeholderEmail } 
        });
        
        if (existingUser) {
          console.log("Found existing GitHub user with placeholder email");
          return existingUser;
        }
      }
      
      // If no GitHub user found, try with the regular email if available
      if (!existingUser && user.email) {
        existingUser = await prisma.user.findUnique({ 
          where: { email: user.email } 
        });
        
        if (existingUser) {
          console.log("Found existing user by email:", user.email);
          return existingUser;
        }
      }
      
      // No existing user found, create a new one
      console.log("No existing user found, creating new user");
      
      // If no email but we have githubLogin, use that for username generation
      const usernameBase = user.githubLogin || user.name || 'user';
      const username = await generateUsername(usernameBase, user.email);
      
      // Remove the id field to let Prisma/MongoDB generate its own ObjectId
      const { id, githubLogin, providerAccountId, ...userData } = user;
      
      // For GitHub OAuth users without email, generate a placeholder email
      // to satisfy the unique constraint (GitHub doesn't always provide email)
      if (isGithubUser) {
        // Generate a fake email like github_123456@placeholder.com
        userData.email = `github_${user.githubLogin}@placeholder.com`;
        
        // Make sure this email is actually unique
        let counter = 1;
        let finalEmail = userData.email;
        
        while (true) {
          const exists = await prisma.user.findUnique({
            where: { email: finalEmail }
          });
          
          if (!exists) break;
          
          // This shouldn't normally happen as we already checked above,
          // but just in case there's a collision
          const emailBase = userData.email.split('@')[0];
          const emailDomain = userData.email.split('@')[1];
          finalEmail = `${emailBase}${counter}@${emailDomain}`;
          counter++;
        }
        
        // Use the finalized unique email
        userData.email = finalEmail;
      }
      
      // Create valid user data by filtering out unknown fields
      const validUserData: any = {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        emailVerified: userData.emailVerified,
        username,
        role: UserRole.USER
      };
      
      // Optionally save GitHub username to github field if the schema has it
      if (githubLogin) {
        // We have github field in the schema as seen in the schema
        validUserData.github = githubLogin;
      }
      
      console.log("Creating user with username:", username);
      console.log("Email being used:", validUserData.email || "none");
      
      // Create the user with the username
      return await prisma.user.create({
        data: validUserData
      });
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  // We don't need to override other methods since they should work fine
  async getUserByAccount(providerAccount: { provider: string, providerAccountId: string }) {
    try {
      console.log("Looking up user by account:", providerAccount.provider, providerAccount.providerAccountId);
      
      // First check for existing account directly
      const account = await prisma.account.findFirst({
        where: {
          provider: providerAccount.provider,
          providerAccountId: providerAccount.providerAccountId
        }
      });
      
      if (account) {
        console.log("Found account, looking up user by account ID:", account.userId);
        // If we found an account, get the user
        const user = await prisma.user.findUnique({
          where: { id: account.userId }
        });
        
        return user;
      }
      
      // Special handling for GitHub accounts - if no direct account match
      // We need a workaround to handle the case where the user has already
      // created an account with a GitHub username, but we don't have a linked GitHub account yet
      if (providerAccount.provider === 'github') {
        // We need to fetch the GitHub username for this provider ID
        // to look up users with matching github field
        
        // Try to get a GitHub username from the provider account ID
        // This is a best-effort approach since we don't have a direct API call
        console.log("Attempting to lookup GitHub username for provider:", providerAccount.providerAccountId);
        
        // You could implement a GitHib API call here to get the username
        // For now, we'll have to return null and rely on the signIn callback
        // to handle these cases
        
        return null;
      }
      
      return null;
    } catch (error) {
      console.error("Custom adapter getUserByAccount error:", error);
      return null;
    }
  },

  // Add linkAccount method to simplify account linkage
  async linkAccount(data: any) {
    try {
      console.log("Linking account for provider:", data.provider, "account ID:", data.providerAccountId);
      
      // Special handling for GitHub accounts
      if (data.provider === 'github') {
        // First check if there's already an account with this provider ID
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: data.provider,
              providerAccountId: data.providerAccountId
            }
          }
        });
        
        if (existingAccount) {
          // If the account exists but belongs to a different user, we need to handle this case
          // This is what causes the OAuthAccountNotLinked error
          if (existingAccount.userId !== data.userId) {
            console.log("Account exists but linked to different user. Current user:", data.userId, "Existing account user:", existingAccount.userId);
            
            // Get the existing user to see if it's the same GitHub username
            const existingUser = await prisma.user.findUnique({
              where: { id: existingAccount.userId }
            });
            
            const currentUser = await prisma.user.findUnique({
              where: { id: data.userId }
            });
            
            // If both users have the same GitHub username, update the account to point to the current user
            if (existingUser?.github && currentUser?.github && existingUser.github === currentUser.github) {
              console.log("Same GitHub username, updating account to point to current user");
              
              return await prisma.account.update({
                where: {
                  provider_providerAccountId: {
                    provider: data.provider,
                    providerAccountId: data.providerAccountId
                  }
                },
                data: {
                  userId: data.userId,
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                  expires_at: data.expires_at,
                  scope: data.scope,
                  token_type: data.token_type,
                  id_token: data.id_token,
                  session_state: data.session_state
                }
              });
            }
            
            // If the users have different GitHub usernames, this is a more complex case
            // Let's check if we should merge the users or fail
            console.log("Different GitHub usernames, handling complex case");
            
            // In a real app, you might want to handle this differently
            // For now, we'll link the account to the current user to avoid the error
            return await prisma.account.update({
              where: {
                provider_providerAccountId: {
                  provider: data.provider,
                  providerAccountId: data.providerAccountId
                }
              },
              data: {
                userId: data.userId,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: data.expires_at,
                scope: data.scope,
                token_type: data.token_type,
                id_token: data.id_token,
                session_state: data.session_state
              }
            });
          }
          
          // If the account belongs to the current user, just update the tokens
          console.log("Updating tokens for existing account");
          return await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: data.provider,
                providerAccountId: data.providerAccountId
              }
            },
            data: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at,
              scope: data.scope,
              token_type: data.token_type,
              id_token: data.id_token,
              session_state: data.session_state
            }
          });
        }
      }
      
      // Retry logic - sometimes the user record might not be fully committed
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Verify that the user actually exists
          const userExists = await prisma.user.findUnique({
            where: { id: data.userId }
          });
          
          if (!userExists) {
            console.log("User not found, retrying linkAccount in 500ms...", data.userId);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
            continue;
          }

          // Create the account
          console.log("Creating new account link for user:", data.userId);
          const account = await prisma.account.create({
            data
          });
          return account;
        } catch (error) {
          // If the error is not a foreign key constraint error, or we've exhausted retries, throw it
          if (
            retryCount >= maxRetries - 1 || 
            (error instanceof Error && !error.message.includes("foreign key constraint"))
          ) {
            throw error;
          }
          
          console.log(`Attempt ${retryCount + 1} failed, retrying linkAccount in 500ms...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
        }
      }
      
      throw new Error("Failed to link account after multiple retries");
    } catch (error) {
      console.error("Error linking account:", error);
      throw error;
    }
  }
};

// Helper function to generate a unique username
async function generateUsername(name?: string | null, email?: string | null): Promise<string> {
  // Start with a base username from name, email, or random string
  let username = '';
  
  if (name) {
    username = name.toLowerCase().replace(/\s+/g, '_');
  } else if (email) {
    username = email.split('@')[0];
  } else {
    username = 'user_' + Math.random().toString(36).substring(2, 10);
  }
  
  // Make sure the username is unique
  let finalUsername = username;
  let counter = 1;
  
  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username: finalUsername }
    });
    
    if (!exists) break;
    finalUsername = `${username}${counter}`;
    counter++;
  }
  
  console.log("Generated username:", finalUsername);
  return finalUsername;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: customAdapter as any,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  // This allows linking accounts with the same email address
  // Required for automatic account linking
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials || !credentials.emailOrUsername || !credentials.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername as string },
              { username: credentials.emailOrUsername as string }
            ],
          },
        })

        if (!user?.password) return null
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string, 
          user.password
        )
        if (!isPasswordValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || "USER",
          username: user.username || ""
        }
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_AUTH_ID,
      clientSecret: process.env.GITHUB_AUTH_SECRET,
      authorization: {
        params: {
          // Request email permissions by adding the user:email scope
          scope: "read:user user:email"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    // Make the profile information available to our adapter
    async signIn({ user, account, profile }) {
      try {
        // For GitHub authentication when email might be null
        if (account?.provider === 'github' && profile) {
          console.log("Processing GitHub sign-in with:", { 
            email: user.email, 
            name: user.name,
            id: user.id
          });
          
          // Try to link GitHub username to the user record
          const githubProfile = profile as any;
          
          if (githubProfile.login) {
            console.log("GitHub login from profile:", githubProfile.login);
            (user as any).githubLogin = githubProfile.login;
            (user as any).providerAccountId = account.providerAccountId;
            
            // Check if we have an existing user with this GitHub username
            const existingUserByGithub = await prisma.user.findFirst({
              where: { github: githubProfile.login }
            });
            
            if (existingUserByGithub) {
              console.log("Found existing user by GitHub username:", existingUserByGithub.id);
              
              // If we find a user by GitHub username, we should use that account
              // This prevents the "OAuthAccountNotLinked" error
              user.id = existingUserByGithub.id;
              user.email = existingUserByGithub.email;
              
              return true;
            }
            
            // If no GitHub match, try by email
            if (user.email) {
              const existingUserByEmail = await prisma.user.findUnique({
                where: { email: user.email }
              });
              
              if (existingUserByEmail) {
                console.log("Found existing user by email:", existingUserByEmail.id);
                
                // Link GitHub to existing user
                user.id = existingUserByEmail.id;
                
                // Update the user to store the GitHub username
                await prisma.user.update({
                  where: { id: existingUserByEmail.id },
                  data: { 
                    github: githubProfile.login
                  }
                });
                
                return true;
              }
            }
          }
          
          // Check if we received private emails from GitHub
          if (!user.email && githubProfile.emails && Array.isArray(githubProfile.emails)) {
            // Find the primary email
            const primaryEmail = githubProfile.emails.find((email: any) => email.primary === true);
            if (primaryEmail && primaryEmail.email) {
              user.email = primaryEmail.email;
              console.log("Found GitHub primary email:", primaryEmail.email);
            } else if (githubProfile.emails.length > 0 && githubProfile.emails[0].email) {
              // Use the first email if no primary is designated
              user.email = githubProfile.emails[0].email;
              console.log("Using GitHub email:", user.email);
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Let the sign-in proceed to avoid blocking users
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.username = token.username as string
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }

      if (trigger === "update" && session) {
        token.name = session.user.name
        token.email = session.user.email
        token.picture = session.user.image
      }

      return token
    }
  },
})

// For middleware usage
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

