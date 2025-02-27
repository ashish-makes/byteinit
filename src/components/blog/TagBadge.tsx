import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  children: string[]
  className?: string
  href?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

const TagBadge = ({ children, className, href, onClick, type = "button" }: TagBadgeProps) => {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center text-xs font-medium hover:underline",
          "text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        "inline-flex items-center text-xs font-medium hover:underline",
        "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

export default TagBadge 