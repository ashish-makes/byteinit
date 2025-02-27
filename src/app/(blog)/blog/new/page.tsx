"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Editor } from "@/components/blog/editor"
import { TagInput } from "@/components/ui/tag-input"

export default function NewBlogPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    tags: [] as string[],
    coverImage: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create blog post")
      }

      const data = await response.json()
      toast.success("Blog post created successfully!")
      router.push(`/blog/${data.slug}`)
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast.error("Failed to create blog post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>
            Write and publish your thoughts to share with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="Blog title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Summary (optional)"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <TagInput
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Cover image URL (optional)"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="min-h-[500px] space-y-2">
              <Editor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 