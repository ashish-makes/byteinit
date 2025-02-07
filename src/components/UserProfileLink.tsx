import Link from "next/link"

interface UserProfileLinkProps {
  username: string
  children: React.ReactNode
}

export function UserProfileLink({ username, children }: UserProfileLinkProps) {
  return (
    <Link 
      href={`/${username}`}
      className="hover:text-primary transition-colors"
    >
      {children}
    </Link>
  )
} 