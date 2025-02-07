/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, MapPin, Briefcase, Globe, Github, Twitter, ExternalLink, Code, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface ViewModeProps {
  user: {
    name: string | null
    username: string | null
    email: string | null
    image: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
    github?: string | null
    twitter?: string | null
    lookingForWork?: boolean | null
    currentRole?: string | null
    company?: string | null
    techStack?: string | null
    yearsOfExperience?: number | null
  }
}

export function ViewMode({ user }: ViewModeProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="mt-2 max-w-md">{user.bio}</p>}
            {user.currentRole && user.company && (
              <p className="text-muted-foreground">
                {user.currentRole} at {user.company}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-4">
        {user.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}
        {user.lookingForWork && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Looking for work</span>
          </div>
        )}
        {user.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <a 
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {user.website}
            </a>
          </div>
        )}
        {user.techStack && (
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>{user.techStack}</span>
          </div>
        )}
        {user.yearsOfExperience && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{user.yearsOfExperience} years of experience</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4">
        {user.github && (
          <Button variant="outline" size="sm" asChild>
            <a 
              href={`https://github.com/${user.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
        )}
        {user.twitter && (
          <Button variant="outline" size="sm" asChild>
            <a 
              href={`https://twitter.com/${user.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
} 