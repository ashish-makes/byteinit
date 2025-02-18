import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RightSidebar() {
  return (
    <div className="h-full py-2 space-y-4 text-sm">
      <div>
        <h3 className="px-2 text-xs font-medium text-muted-foreground mb-1">POPULAR TAGS</h3>
        <div className="flex flex-wrap gap-1 px-2">
          <Button variant="outline" size="sm" className="h-6 text-xs px-2">React</Button>
          <Button variant="outline" size="sm" className="h-6 text-xs px-2">TypeScript</Button>
          <Button variant="outline" size="sm" className="h-6 text-xs px-2">Next.js</Button>
          <Button variant="outline" size="sm" className="h-6 text-xs px-2">UI</Button>
        </div>
      </div>

      <div>
        <h3 className="px-2 text-xs font-medium text-muted-foreground mb-1">TOP RESOURCES</h3>
        <div className="px-2 space-y-1">
          <Link href="#" className="block text-xs hover:underline">Building a Modern Web App with Next.js</Link>
          <Link href="#" className="block text-xs hover:underline">React Performance Tips</Link>
          <Link href="#" className="block text-xs hover:underline">TypeScript Best Practices</Link>
        </div>
      </div>

      <div>
        <h3 className="px-2 text-xs font-medium text-muted-foreground mb-1">CONTRIBUTORS</h3>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-accent" />
            <span>John Doe</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-accent" />
            <span>Jane Smith</span>
          </div>
        </div>
      </div>
    </div>
  )
} 