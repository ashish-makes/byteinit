"use client"

import { useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Briefcase, GithubIcon, Globe, MapPin, Twitter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface UserHoverCardProps {
  username: string | null
  children: React.ReactNode
  className?: string
}

interface UserDetails {
  id: string
  username: string | null
  name: string | null
  image: string | null
  bio: string | null
  location: string | null
  github: string | null
  website: string | null
  twitter: string | null
  currentRole: string | null
  company: string | null
  techStack: string | null
  yearsOfExperience: string | null
  lookingForWork: boolean
}

export function UserHoverCard({ username, children, className }: UserHoverCardProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = async () => {
    if (!username) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/users/${username}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }
      
      const data = await response.json()
      setUserDetails(data)
    } catch (err) {
      setError('Error loading user profile')
      console.error('Error fetching user details:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild onClick={fetchUserDetails} onMouseEnter={fetchUserDetails}>
        <span className={cn("cursor-pointer", className)}>
          {children}
        </span>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-64 p-3 shadow-lg">
        {loading ? (
          <UserCardSkeleton />
        ) : error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : userDetails ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userDetails.image || ""} />
                <AvatarFallback className="text-sm">{userDetails.name?.[0] || userDetails.username?.[0] || "?"}</AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium truncate">{userDetails.name || "Anonymous"}</h4>
                {userDetails.username && (
                  <p className="text-xs text-muted-foreground truncate">@{userDetails.username}</p>
                )}
              </div>
              
              {userDetails.lookingForWork && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 text-emerald-500 bg-emerald-500/10">
                  Open to work
                </Badge>
              )}
            </div>
            
            {userDetails.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2">{userDetails.bio}</p>
            )}
            
            <div className="space-y-1">
              {(userDetails.currentRole || userDetails.company) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {userDetails.currentRole && userDetails.company
                      ? `${userDetails.currentRole} at ${userDetails.company}`
                      : userDetails.currentRole || userDetails.company}
                  </span>
                </div>
              )}
              
              {userDetails.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{userDetails.location}</span>
                </div>
              )}
            </div>
            
            {(userDetails.github || userDetails.website || userDetails.twitter) && (
              <div className="flex items-center gap-3 pt-1 border-t border-border/30">
                {userDetails.github && (
                  <a 
                    href={userDetails.github.startsWith('http') ? userDetails.github : `https://github.com/${userDetails.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                
                {userDetails.website && (
                  <a 
                    href={userDetails.website.startsWith('http') ? userDetails.website : `https://${userDetails.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                )}
                
                {userDetails.twitter && (
                  <a 
                    href={userDetails.twitter.startsWith('http') ? userDetails.twitter : `https://twitter.com/${userDetails.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-1">
            <p className="text-xs text-muted-foreground">Loading profile...</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

function UserCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
} 