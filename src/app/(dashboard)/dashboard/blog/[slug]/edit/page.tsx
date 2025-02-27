/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/ui/tag-input'
import { Editor } from '@/components/blog/editor'
import { toast } from 'sonner'
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ImageUpload } from '@/components/blog/image-upload'
import { Switch } from "@/components/ui/switch"

const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  summary: z.string().optional(),
  coverImage: z.string().url("Please enter a valid URL").optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

type BlogPostFormData = z.infer<typeof blogPostSchema>

export default function EditBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      summary: "",
      coverImage: "",
      tags: [],
      published: false,
    }
  })

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${resolvedParams.slug}`)
        if (!response.ok) throw new Error('Failed to fetch post')
        
        const post = await response.json()
        
        // Set form values
        form.reset({
          title: post.title,
          slug: post.slug,
          content: post.content,
          summary: post.summary || "",
          coverImage: post.coverImage || "",
          tags: post.tags || [],
          published: post.published || false,
        })
      } catch (error) {
        toast.error("Failed to fetch post")
        router.push('/dashboard/blog')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [resolvedParams.slug, form, router])

  const onSubmit = async (data: BlogPostFormData) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/blog/${data.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("A post with this slug already exists")
          return
        }

        if (response.status === 422) {
          const errors = await response.json()
          errors.forEach((error: { message: string }) => {
            toast.error(error.message)
          })
          return
        }

        throw new Error('Failed to update post')
      }

      const post = await response.json()
      toast.success('Post updated successfully')
      router.push('/dashboard/blog')
      router.refresh()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full dark:bg-background/50 bg-white dark:border dark:border-border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Save className="h-6 w-6 text-primary" />
        Edit Blog Post
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="My Awesome Blog Post"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              {...form.register('slug')}
              placeholder="my-awesome-blog-post"
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...form.register('summary')}
              placeholder="Brief description of your post..."
            />
            {form.formState.errors.summary && (
              <p className="text-xs text-destructive">{form.formState.errors.summary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <Editor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your post content here..."
                />
              )}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          <ImageUpload
            value={form.watch('coverImage')}
            onChange={async (url) => {
              if (url.startsWith('blob:')) {
                try {
                  const response = await fetch(url)
                  const blob = await response.blob()
                  const formData = new FormData()
                  formData.append('file', blob)

                  const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  })

                  if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image')
                  }

                  const { url: permanentUrl } = await uploadResponse.json()
                  form.setValue('coverImage', permanentUrl)
                } catch (error) {
                  console.error('Error uploading image:', error)
                  toast.error('Failed to upload cover image')
                }
              } else {
                form.setValue('coverImage', url)
              }
            }}
            onRemove={() => {
              const currentImage = form.watch('coverImage')
              if (currentImage?.startsWith('blob:')) {
                URL.revokeObjectURL(currentImage)
              }
              form.setValue('coverImage', '')
            }}
          />

          <div className="space-y-2">
            <Label>Tags</Label>
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="published">Publishing Status</Label>
              <p className="text-sm text-muted-foreground">
                Toggle to publish or unpublish this post
              </p>
            </div>
            <Controller
              name="published"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Published status"
                />
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {form.watch('published') ? 'Publishing...' : 'Saving Draft...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {form.watch('published') ? 'Publish Changes' : 'Save as Draft'}
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 