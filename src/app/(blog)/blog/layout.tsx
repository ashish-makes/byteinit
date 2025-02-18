import LeftSidebar from "@/components/blog/LeftSidebar"
import RightSidebar from "@/components/blog/RightSidebar"
import BlogHeader from "@/components/blog/BlogHeader"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <BlogHeader />
      <div className="flex pt-14">
        {/* Left Sidebar - Desktop Only */}
        <div className="fixed left-0 top-14 bottom-0 w-60 hidden lg:block border-r bg-background/80 backdrop-blur-sm">
          <div className="h-full">
            <LeftSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-60 lg:mr-72">
          <div className="w-full">{children}</div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="fixed right-0 top-14 bottom-0 w-72 hidden lg:block border-l bg-background/80 backdrop-blur-sm">
          <div className="h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

