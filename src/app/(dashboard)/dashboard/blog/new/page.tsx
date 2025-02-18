"use client"

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, UploadCloud, X } from 'lucide-react'
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

const ImageUpload = ({ 
  value,
  onChange,
  onRemove,
  className,
}: { 
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  className?: string
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const url = URL.createObjectURL(file)
      onChange(url)
      
      // Cleanup
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Cover Image</Label>
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files[0]
          await handleFile(file)
        }}
        className={cn(
          "relative h-[200px] rounded-lg overflow-hidden border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          value ? "p-0" : "flex flex-col items-center justify-center gap-1",
          !isUploading && !value && "cursor-pointer"
        )}
      >
        {value ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Cover image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-black/10 transition-colors hover:bg-black/20" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
            <Progress value={uploadProgress} className="h-1 w-full" />
            <p className="text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop your image here or click to browse
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

export default function NewBlogPost() {
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

  async function onSubmit(data: BlogPostFormData) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("A post with this slug already exists", {
            description: "Please choose a different URL slug"
          })
          return
        }

        if (response.status === 422) {
          const errors = await response.json()
          errors.forEach((error: { message: string }) => {
            toast.error("Validation Error", {
              description: error.message
            })
          })
          return
        }

        throw new Error("Failed to create blog post")
      }

      const post = await response.json()
      toast.success("Blog post created successfully!")
      router.push('/dashboard/blog')
      router.refresh()
    } catch (err) {
      console.error("Failed to create blog post:", err)
      toast.error("Failed to create blog post", {
        description: "Please try again later"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full dark:bg-background/50 bg-white dark:border dark:border-border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Upload className="h-6 w-6 text-primary" />
        Create New Blog Post
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
              // If it's a blob URL, we need to upload it first
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
                  value={field.value.join(', ')}
                  onChange={(value) => field.onChange(value.split(',').map(tag => tag.trim()))}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="published">Publishing Status</Label>
              <p className="text-sm text-muted-foreground">
                Toggle to publish your post immediately
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

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {form.watch('published') ? 'Publishing Post...' : 'Saving Draft...'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {form.watch('published') ? 'Publish Post' : 'Save as Draft'}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
