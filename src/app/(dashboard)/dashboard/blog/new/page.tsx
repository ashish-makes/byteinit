"use client"

import { useState, useRef, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

type SEOFeedback = {
  message: string
  type: 'success' | 'warning' | 'error'
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
}

function getTitleFeedback(title: string): SEOFeedback {
  if (!title) return { message: 'Title is required', type: 'error' }
  if (title.length < 20) return { message: 'Title is too short for good SEO', type: 'warning' }
  if (title.length > 70) return { message: 'Title is too long for SEO', type: 'warning' }
  return { message: 'Title length is optimal for SEO', type: 'success' }
}

function getSummaryFeedback(summary: string): SEOFeedback {
  if (!summary) return { message: 'Adding a summary improves SEO', type: 'warning' }
  if (summary.length < 50) return { message: 'Summary is too short for good SEO', type: 'warning' }
  if (summary.length > 160) return { message: 'Summary is too long for SEO', type: 'warning' }
  return { message: 'Summary length is optimal for SEO', type: 'success' }
}

function getSlugFeedback(slug: string): SEOFeedback {
  if (!slug) return { message: 'Slug is required', type: 'error' }
  if (slug.length > 60) return { message: 'Slug is too long for SEO', type: 'warning' }
  return { message: 'Slug length is good for SEO', type: 'success' }
}

function SEOIndicator({ feedback, show }: { feedback: SEOFeedback, show: boolean }) {
  // Don't show anything if not needed to show or if it's a success state
  if (!show || feedback.type === 'success') return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <AlertCircle className={cn(
              "h-4 w-4",
              feedback.type === 'warning' ? "text-yellow-500" : "text-red-500"
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{feedback.message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

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
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current)
      }
    }
  }, [])

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Create a blob URL immediately for preview
      const previewUrl = URL.createObjectURL(file)
      onChange(previewUrl)

      // Simulate progress more naturally
      const startTime = Date.now()
      const duration = 1000 // 1 second upload simulation
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / duration) * 100, 90) // Cap at 90% until actual upload
        setUploadProgress(progress)
        
        if (progress < 90) {
          uploadTimeoutRef.current = setTimeout(updateProgress, 100)
        }
      }
      
      updateProgress()

      // Simulate network delay based on file size
      const delay = Math.min(file.size / 10000, 2000) // Max 2 seconds delay
      await new Promise(resolve => setTimeout(resolve, delay))

      // Complete the upload
      setUploadProgress(100)
      
      // Clear any remaining timeouts
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current)
      }

      // Reset state after a brief delay
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      console.error('Error handling file:', error)
      toast.error('Failed to process image')
      setIsUploading(false)
      setUploadProgress(0)
      onRemove() // Remove the preview if upload failed
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
          if (file) await handleFile(file)
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
              {uploadProgress === 100 ? 'Processing...' : `Uploading... ${Math.round(uploadProgress)}%`}
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
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const router = useRouter()
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

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

  // Watch title changes and update slug
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && !isSlugEdited) {
        const newSlug = generateSlug(value.title || '')
        form.setValue('slug', newSlug, { shouldValidate: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [form, isSlugEdited])

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

  // Get feedback for current values
  const titleFeedback = getTitleFeedback(form.watch('title'))
  const slugFeedback = getSlugFeedback(form.watch('slug'))
  const summaryFeedback = getSummaryFeedback(form.watch('summary') || '')

  // Show indicators only when there are warnings or errors
  const showTitleIndicator = touchedFields.title && titleFeedback.type !== 'success'
  const showSlugIndicator = touchedFields.slug && slugFeedback.type !== 'success'
  const showSummaryIndicator = touchedFields.summary && summaryFeedback.type !== 'success'

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="bg-white dark:bg-background/50 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <Upload className="h-6 w-6 text-primary" />
          Create New Blog Post
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Title *</Label>
                <SEOIndicator 
                  feedback={titleFeedback} 
                  show={showTitleIndicator}
                />
              </div>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="My Awesome Blog Post"
                onFocus={() => setTouchedFields(prev => ({ ...prev, title: true }))}
              />
              <p className="text-xs text-muted-foreground">
                {showTitleIndicator && `${titleFeedback.message} `}
                ({form.watch('title')?.length || 0}/70 characters)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL Slug *</Label>
                <SEOIndicator 
                  feedback={slugFeedback} 
                  show={showSlugIndicator}
                />
              </div>
              <Input
                id="slug"
                {...form.register('slug')}
                placeholder="my-awesome-blog-post"
                disabled={!isSlugEdited}
                onChange={(e) => {
                  if (!isSlugEdited) {
                    setIsSlugEdited(true)
                  }
                  form.setValue('slug', e.target.value, { shouldValidate: true })
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  This will be the URL of your post: /blog/<span className="font-mono">{form.watch('slug') || 'url-slug'}</span>
                  {showSlugIndicator && <span className="ml-1">• {slugFeedback.message}</span>}
                </p>
                {isSlugEdited && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSlugEdited(false)
                      form.setValue('slug', generateSlug(form.watch('title')))
                    }}
                  >
                    Reset to auto-generate
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">Summary</Label>
                <SEOIndicator 
                  feedback={summaryFeedback} 
                  show={showSummaryIndicator}
                />
              </div>
              <Textarea
                id="summary"
                {...form.register('summary')}
                placeholder="Brief description of your post..."
                onFocus={() => setTouchedFields(prev => ({ ...prev, summary: true }))}
              />
              <p className="text-xs text-muted-foreground">
                {showSummaryIndicator && `${summaryFeedback.message} `}
                ({form.watch('summary')?.length || 0}/160 characters)
              </p>
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
    </div>
  )
}
