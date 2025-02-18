import { prisma } from "@/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { JSDOM } from "jsdom"
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import css from "highlight.js/lib/languages/css"
import 'highlight.js/styles/github-dark.css'
import { Clock, User, Pencil } from "lucide-react"
import { recordView, deletePost } from "../actions"
import { DeletePostButton } from "@/components/blog/DeletePostButton"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Register languages
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("css", css)
hljs.registerLanguage("js", javascript)
hljs.registerLanguage("ts", typescript)

const processCodeBlocks = (content: string) => {
  const dom = new JSDOM(content)
  const doc = dom.window.document
  
  doc.querySelectorAll("blockquote").forEach((blockquote) => {
    blockquote.innerHTML = blockquote.innerHTML.replace(/[""]/g, '')
  })

  doc.querySelectorAll("pre code").forEach((codeElement) => {
    let code = codeElement.textContent?.replace(/^```|```$/g, "").trim() || ""
    code = code.replace(/^"|"$/g, "").trim()

    const languageMatch = codeElement.className.match(/language-(\w+)/)
    const language = languageMatch?.[1] || ''

    try {
      const result = language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language })
        : hljs.highlightAuto(code)
      
      codeElement.innerHTML = result.value
      codeElement.classList.add("hljs")
    } catch (error) {
      console.error('Error highlighting code:', error)
      codeElement.textContent = code
    }

    codeElement.parentElement?.classList.add("highlight-pre")
  })

  return doc.body.innerHTML
}

const calculateReadingTime = (content: string): number => {
  if (!content) return 1 // Fallback for empty content
  
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Collapse whitespace
    .trim()

  // Count word boundaries more accurately
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length
  
  // Calculate with minimum 1 minute
  return Math.max(Math.ceil(wordCount / 200), 1)
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params
  
  const post = await prisma.blog.findUnique({
    where: { slug },
    include: { user: true },
  })

  if (!post) notFound()

  // Record the view
  await recordView(post.id)

  const processedContent = processCodeBlocks(post.content)
  const readingTime = calculateReadingTime(post.content)

  return (
    <div className="container max-w-3xl py-6 px-4 sm:px-6 mx-auto">
      <article className="space-y-6">
        {post.coverImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">
                {post.user?.name || 'Anonymous'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {readingTime} min read
              </span>
            </div>
          </div>

          {post.summary && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {post.summary}
            </p>
          )}
        </div>

        <Separator className="my-8" />

        <div
          dangerouslySetInnerHTML={{ __html: processedContent }}
          className={cn(
            "prose prose-neutral dark:prose-invert max-w-none",
            "prose-p:text-base prose-p:leading-7 prose-p:my-2",
            "prose-headings:tracking-tight prose-headings:font-semibold",
            "prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4",
            "prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4",
            "[&_.highlight-pre]:bg-zinc-950 [&_.highlight-pre]:dark:bg-zinc-900 [&_.highlight-pre]:p-4 [&_.highlight-pre]:rounded-lg [&_.highlight-pre]:my-4",
            "[&_.highlight-pre]:ring-1 [&_.highlight-pre]:ring-border/10",
            "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:dark:bg-muted/50",
            "prose-blockquote:border-l-4 prose-blockquote:dark:border-gray-600",
            "prose-a:text-primary prose-a:underline",
            "[&_*:first-child]:mt-0 [&_*:last-child]:mb-0",
          )}
        />

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/blog/${post.slug}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Post
            </Button>
          </Link>
          <DeletePostButton postId={post.id} deletePost={deletePost} />
        </div>
      </article>
    </div>
  )
}