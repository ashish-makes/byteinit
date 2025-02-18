/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEditor, EditorContent, Editor as TipTapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code as CodeIcon,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  Upload as UploadIcon,
  Table as TableIcon,
  TableProperties,
  RowsIcon,
  ColumnsIcon,
  Trash2,
  Loader2,
  UploadCloud
} from 'lucide-react'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useState, useRef } from 'react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'
import ruby from 'highlight.js/lib/languages/ruby'
import php from 'highlight.js/lib/languages/php'
import sql from 'highlight.js/lib/languages/sql'
import shell from 'highlight.js/lib/languages/shell'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/atom-one-dark.css'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReactRenderer, ReactNodeViewRenderer } from '@tiptap/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Extension } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Suggestion from '@tiptap/suggestion'
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { InputRule } from '@tiptap/core'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BubbleMenu } from '@tiptap/react'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { toast } from "sonner"
import { EditorBubbleMenu } from '@/components/blog/editor-bubble-menu'
import { EditorFloatingMenu } from '@/components/blog/editor-floating-menu'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { Slice } from '@tiptap/pm/model'
import { ExtendedRegExpMatchArray } from '@tiptap/core'
import { SingleCommands, ChainedCommands, CanCommands } from '@tiptap/react'
import { Editor as CoreEditor } from '@tiptap/core'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface CodeBlockProps {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
}

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('typescript', ts)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('rust', rust)
lowlight.register('go', go)
lowlight.register('ruby', ruby)
lowlight.register('php', php)
lowlight.register('sql', sql)
lowlight.register('shell', shell)
lowlight.register('yaml', yaml)

const LANGUAGES = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  rust: 'Rust',
  go: 'Go',
  ruby: 'Ruby',
  php: 'PHP',
  css: 'CSS',
  html: 'HTML',
  sql: 'SQL',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  markdown: 'Markdown',
} as const

const CodeBlockComponent = ({ node, updateAttributes }: CodeBlockProps) => {
  const language = node.attrs.language || 'plaintext'
  const code = node.textContent.replace(/^```|```$/g, '').trim()  // Remove backticks

  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = () => {
    const text = node.textContent
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <NodeViewWrapper className="relative group not-prose">
      <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Select
          value={language}
          onValueChange={(value) => updateAttributes({ language: value })}
        >
          <SelectTrigger className="h-8 w-[120px] bg-zinc-700 border-zinc-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANGUAGES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={copyToClipboard}
          className="rounded-md p-1.5 bg-zinc-700 hover:bg-zinc-600 transition-colors"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-100" />
          )}
        </button>
      </div>
      <div className="text-xs text-zinc-400 bg-zinc-800 px-4 py-2 rounded-t-lg border-b border-zinc-700">
        {LANGUAGES[language as keyof typeof LANGUAGES] || 'Plain Text'}
      </div>
      <pre className="!mt-0 bg-zinc-950 rounded-b-lg">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

interface ImageUpload {
  file: File;
  url: string;
  progress: number;
  alt: string;
}

type UploadingImage = {
  id: string
  file: File
  progress: number
}

const ImageProgress = ({ file }: { file: File }) => {
  return (
    <div className="relative flex items-center gap-2 rounded-md border bg-muted/50 p-2 max-w-[240px]">
      <div className="h-10 w-10 shrink-0 rounded-md border bg-background">
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <Progress className="h-1 mt-1" value={0} />
      </div>
    </div>
  )
}

const LinkDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSubmit: (url: string, options?: { openInNewTab?: boolean; title?: string }) => void; 
}) => {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [openInNewTab, setOpenInNewTab] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url, { openInNewTab, title })
    setUrl('')
    setTitle('')
    setOpenInNewTab(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[300px] rounded-lg overflow-hidden p-4 gap-2">
        <DialogHeader className="px-1">
          <DialogTitle className="text-center text-base font-medium">Insert Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <div className="grid gap-1.5">
              <Label htmlFor="url" className="text-xs font-medium">
                URL
              </Label>
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-8 text-sm"
                autoFocus
                type="url"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs font-medium">
                Title (optional)
              </Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Link title"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="newTab"
                checked={openInNewTab}
                onCheckedChange={(checked) => setOpenInNewTab(checked as boolean)}
                className="h-4 w-4"
              />
              <Label htmlFor="newTab" className="text-xs font-medium">
                Open in new tab
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="h-7 text-xs"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ImageDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSubmit: (url: string) => void; 
}) => {
  const [uploads, setUploads] = useState<ImageUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = async (files: File[]) => {
    const newUploads = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      progress: 0,
      alt: '',
    }))
    setUploads(prev => [...prev, ...newUploads])

    // Simulate upload progress
    newUploads.forEach(upload => {
      const interval = setInterval(() => {
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file
              ? { ...u, progress: Math.min(u.progress + 10, 100) }
              : u
          )
        )
      }, 100)

      setTimeout(() => clearInterval(interval), 1000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 mx-2 rounded-lg sm:mx-0">
        <div className="p-4 border-b">
          <DialogTitle className="text-base font-medium">Upload Images</DialogTitle>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={async (e) => {
            e.preventDefault()
            setIsDragging(false)
            const files = Array.from(e.dataTransfer.files).filter(file => 
              file.type.startsWith('image/')
            )
            await handleFiles(files)
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 transition-colors",
            isDragging ? "bg-muted" : "bg-background",
            uploads.length > 0 && "border-b"
          )}
        >
          <div className="p-3 rounded-full bg-muted">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drag images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              handleFiles(files)
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </Button>
        </div>

        {uploads.length > 0 && (
          <ScrollArea className="max-h-[300px] p-4">
            <div className="space-y-3">
              {uploads.map((upload, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-14 w-14 shrink-0 rounded-md border bg-muted">
                    <img
                      src={upload.url}
                      alt=""
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate flex-1">
                        {upload.file.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          URL.revokeObjectURL(upload.url)
                          setUploads(uploads.filter((_, j) => j !== i))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={upload.progress} className="flex-1 h-1" />
                      <span className="text-xs text-muted-foreground w-9">
                        {upload.progress}%
                      </span>
                    </div>
                    <Input
                      placeholder="Alt text"
                      value={upload.alt}
                      onChange={(e) => {
                        setUploads(uploads.map((u, j) => 
                          i === j ? { ...u, alt: e.target.value } : u
                        ))
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              uploads.forEach(u => URL.revokeObjectURL(u.url))
              setUploads([])
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!uploads.some(u => u.progress === 100)}
            onClick={() => {
              uploads.forEach(u => onSubmit(u.url))
              setUploads([])
              onOpenChange(false)
            }}
          >
            Upload {uploads.length > 0 && `(${uploads.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const MenuBar = ({ 
  editor, 
  setLinkDialogOpen,
  setImageDialogOpen,
}: { 
  editor: TipTapEditor | null;
  setLinkDialogOpen: (open: boolean) => void;
  setImageDialogOpen: (open: boolean) => void;
}) => {
  if (!editor) return null

  const addImage = (images: { url: string; alt: string }[]) => {
    images.forEach(({ url, alt }) => {
      editor?.chain().focus().setImage({ 
        src: url,
        alt: alt || undefined,
      }).run()
    })
    setImageDialogOpen(false)
  }

  const addLink = (url: string, options?: { openInNewTab?: boolean; title?: string }) => {
    if (url) {
      editor?.chain().focus().setLink({ 
        href: url,
        target: options?.openInNewTab ? '_blank' : null,
      }).run()
    }
    setLinkDialogOpen(false)
  }

  return (
    <>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-1 p-1">
          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 1 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 1 (⌘+Alt+1)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 2 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 2 (⌘+Alt+2)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 3 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <span className="text-[11px]">H3</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 3 (⌘+Alt+3)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 4 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                >
                  <span className="text-[10px]">H4</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 4 (⌘+Alt+4)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 5 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                >
                  <span className="text-[9px]">H5</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 5 (⌘+Alt+5)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('heading', { level: 6 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                >
                  <span className="text-[8px]">H6</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 6 (⌘+Alt+6)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('bold')}
                  onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bold (⌘+B)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('italic')}
                  onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Italic (⌘+I)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('strike')}
                  onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'left' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                >
                  <AlignLeft className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Left (⌘+Alt+Left)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'center' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                >
                  <AlignCenter className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Center (⌘+Alt+Center)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'right' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                >
                  <AlignRight className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Right (⌘+Alt+Right)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('bulletList')}
                  onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bullet List (⌘+Alt+L)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('orderedList')}
                  onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numbered List (⌘+Alt+O)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('blockquote')}
                  onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quote (⌘+Alt+Q)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('code')}
                  onPressedChange={() => editor.chain().focus().toggleCode().run()}
                >
                  <CodeIcon className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Code (⌘+/)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('codeBlock')}
                  onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  <Terminal className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Code Block (⌘+Alt+C)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('link')}
                  onPressedChange={() => setLinkDialogOpen(true)}
                >
                  <LinkIcon className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Link (⌘+K)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={false}
                  onPressedChange={() => setImageDialogOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Image</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onPressedChange={() => editor.chain().focus().undo().run()}
                >
                  <Undo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (⌘+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onPressedChange={() => editor.chain().focus().redo().run()}
                >
                  <Redo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (⌘+Shift+Z)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('table')}
                  onPressedChange={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                  <TableIcon className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Table</p>
              </TooltipContent>
            </Tooltip>

            {editor?.isActive('table') && (
              <>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Toggle
                      size="sm"
                      onPressedChange={() => editor.chain().focus().addColumnBefore().run()}
                    >
                      <ColumnsIcon className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Column</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Toggle
                      size="sm"
                      onPressedChange={() => editor.chain().focus().addRowBefore().run()}
                    >
                      <RowsIcon className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Row</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Toggle
                      size="sm"
                      onPressedChange={() => editor.chain().focus().deleteTable().run()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Table</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const SlashCommands = Extension.create({
  name: 'slash-commands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: CoreEditor; range: any; props: any }) => {
          const { from, to } = range
          
          // First store the command to execute
          const commandFn = () => props.command({ editor, range })
          
          // Then delete the slash command text
          editor
            .chain()
            .deleteRange({ from: from - 1, to }) // -1 to include the slash
            .focus()
            .run()
          
          // Finally execute the stored command
          commandFn()
        },
        items: ({ query }: { query: string }) => [
          {
            title: 'Heading 1',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 1 }).run(),
            icon: Heading1,
            shortcut: '# space'
          },
          {
            title: 'Heading 2',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 2 }).run(),
            icon: Heading2,
            shortcut: '## space'
          },
          {
            title: 'Heading 3',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 3 }).run(),
            icon: Heading2,
            shortcut: '### space'
          },
          {
            title: 'Heading 4',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 4 }).run(),
            icon: Heading2,
            shortcut: '#### space'
          },
          {
            title: 'Heading 5',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 5 }).run(),
            icon: Heading2,
            shortcut: '##### space'
          },
          {
            title: 'Heading 6',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleHeading({ level: 6 }).run(),
            icon: Heading2,
            shortcut: '###### space'
          },
          {
            title: 'Bold',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleBold().run(),
            icon: Bold,
            shortcut: '⌘+B'
          },
          {
            title: 'Code Block',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleCodeBlock().run(),
            icon: Terminal,
            shortcut: '```'
          },
          {
            title: 'Bullet List',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleBulletList().run(),
            icon: List,
            shortcut: '- space'
          },
          {
            title: 'Numbered List',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleOrderedList().run(),
            icon: ListOrdered,
            shortcut: '1. space'
          },
          {
            title: 'Blockquote',
            command: ({ editor }: { editor: CoreEditor }) => 
              editor.chain().focus().toggleBlockquote().run(),
            icon: Quote,
            shortcut: '> space'
          },
        ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())),
        render: () => {
          return {
            onStart: () => {},
            onUpdate: () => {},
            onKeyDown: () => false,
            onExit: () => {},
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export function Editor({ value, onChange, placeholder, className }: EditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Map<string, number>>(new Map())

  const handleImageUpload = async (file: File, view: any, pos?: number) => {
    const id = Math.random().toString(36).substring(7)
    setUploadingImages(new Map(uploadingImages.set(id, 0)))
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await response.json()
      
      const imageNode = view.state.schema.nodes.image.create({ 
        src: url,
        alt: file.name,
      })

      if (pos !== undefined) {
        view.dispatch(view.state.tr.replaceWith(pos, pos, imageNode))
      } else {
        view.dispatch(view.state.tr.replaceSelectionWith(imageNode))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image", {
        description: "Please try again or use a different image"
      })
    } finally {
      setUploadingImages(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    }
  }

  const addImage = async (url: string, view: any) => {
    // If it's a blob URL, upload it first
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
        view.chain().focus().setImage({ src: permanentUrl }).run()
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image')
      }
    } else {
      view.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = (url: string, options?: { openInNewTab?: boolean; title?: string }) => {
    if (url) {
      editor?.chain().focus().setLink({ 
        href: url,
        target: options?.openInNewTab ? '_blank' : null,
      }).run()
    }
    setLinkDialogOpen(false)
  }

  const editor: CoreEditor | null = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
        nodeView: ReactNodeViewRenderer(CodeBlockComponent),
      } as any),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto my-2 border bg-muted/50 p-1',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      SlashCommands.configure({
        suggestion: {
          items: ({ query }: { query: string }) => [
            {
              title: 'Heading 1',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
              icon: Heading1,
              shortcut: '# space'
            },
            {
              title: 'Heading 2',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
              icon: Heading2,
              shortcut: '## space'
            },
            {
              title: 'Heading 3',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
              icon: Heading2,
              shortcut: '### space'
            },
            {
              title: 'Heading 4',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 4 }).run(),
              icon: Heading2,
              shortcut: '#### space'
            },
            {
              title: 'Heading 5',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 5 }).run(),
              icon: Heading2,
              shortcut: '##### space'
            },
            {
              title: 'Heading 6',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleHeading({ level: 6 }).run(),
              icon: Heading2,
              shortcut: '###### space'
            },
            {
              title: 'Bold',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleBold().run(),
              icon: Bold,
              shortcut: '⌘+B'
            },
            {
              title: 'Code Block',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleCodeBlock().run(),
              icon: Terminal,
              shortcut: '```'
            },
            {
              title: 'Bullet List',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleBulletList().run(),
              icon: List,
              shortcut: '- space'
            },
            {
              title: 'Numbered List',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleOrderedList().run(),
              icon: ListOrdered,
              shortcut: '1. space'
            },
            {
              title: 'Blockquote',
              command: ({ editor }: { editor: CoreEditor }) => 
                editor.chain().focus().toggleBlockquote().run(),
              icon: Quote,
              shortcut: '> space'
            },
          ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())),
        },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Extension.create({
        addKeyboardShortcuts() {
          return {
            'Mod-k': () => {
              setLinkDialogOpen(true)
              return true
            },
            'Mod-Alt-1': () => {
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
              return true
            },
            'Mod-Alt-2': () => {
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
              return true
            },
            'Mod-Alt-3': () => {
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
              return true
            },
            'Mod-Alt-4': () => {
              editor?.chain().focus().toggleHeading({ level: 4 }).run()
              return true
            },
            'Mod-Alt-5': () => {
              editor?.chain().focus().toggleHeading({ level: 5 }).run()
              return true
            },
            'Mod-Alt-6': () => {
              editor?.chain().focus().toggleHeading({ level: 6 }).run()
              return true
            },
            'Mod-Alt-c': () => {
              editor?.chain().focus().toggleCodeBlock().run()
              return true
            },
            'Mod-Alt-q': () => {
              editor?.chain().focus().toggleBlockquote().run()
              return true
            },
            'Mod-Alt-l': () => {
              editor?.chain().focus().toggleBulletList().run()
              return true
            },
            'Mod-Alt-o': () => {
              editor?.chain().focus().toggleOrderedList().run()
              return true
            },
            'Mod-Alt-left': () => {
              editor?.chain().focus().setTextAlign('left').run()
              return true
            },
            'Mod-Alt-center': () => {
              editor?.chain().focus().setTextAlign('center').run()
              return true
            },
            'Mod-Alt-right': () => {
              editor?.chain().focus().setTextAlign('right').run()
              return true
            },
          }
        }
      }),
      Extension.create({
        addInputRules() {
          return [
            new InputRule({
              find: /\[(.+?)\]\((.+?)\)/,
              handler: ({ state, match, range }: { 
                state: EditorState
                match: ExtendedRegExpMatchArray
                range: { from: number; to: number }
              }) => {
                const [, text, url] = match
                this.editor.commands.setLink({ href: url })
                return null // Return null instead of true to fix void return type
              },
            }),
          ]
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full text-sm border border-border/50 rounded-lg overflow-hidden',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'hover:bg-muted/30 data-[state=selected]:bg-muted/40 transition-colors',
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-4 border-b border-r border-border/50 [&[colspan]]:text-center [&[rowspan]]:text-center [&:last-child]:border-r-0 align-middle [&>*]:m-0 text-sm',
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'h-11 px-4 text-sm font-medium border-b border-r border-border/50 bg-muted/50 text-muted-foreground [&:last-child]:border-r-0 align-middle [&>*]:m-0 text-sm',
        }
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-2',
          className
        ),
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData?.files.length) {
          const files = Array.from(event.clipboardData.files)
          const images = files.filter(file => file.type.startsWith('image/'))
          if (images.length > 0) {
            event.preventDefault()
            images.forEach(image => handleImageUpload(image, view))
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editable: true,
  }, [])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const shortcuts = [
    { key: '⌘ + B', action: 'Bold' },
    { key: '⌘ + I', action: 'Italic' },
    { key: '⌘ + K', action: 'Link' },
    { key: '⌘ + /', action: 'Code' },
    { key: '⌘ + Alt + C', action: 'Code Block' },
  ]

  const characterCount = editor?.storage.characterCount.characters() ?? 0
  const wordCount = editor?.storage.characterCount.words() ?? 0

  const uploadProgress = (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {Array.from(uploadingImages.entries()).map(([id, progress]) => (
        <div key={id} className="bg-background border rounded-md p-4 shadow-lg w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uploading image...</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative min-h-[400px] w-full border rounded-lg">
      <MenuBar 
        editor={editor} 
        setLinkDialogOpen={setLinkDialogOpen}
        setImageDialogOpen={setImageDialogOpen}
      />
      <div className="min-h-[250px] p-3">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Bar - Updated for responsiveness */}
      <div className="border-t border-border">
        <div className="px-3 py-2 flex flex-col sm:flex-row sm:h-8 sm:items-center justify-between text-xs text-muted-foreground gap-2 sm:gap-0">
          {/* Format and Style Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium">
                {editor?.isActive('heading', { level: 1 }) && 'Heading 1'}
                {editor?.isActive('heading', { level: 2 }) && 'Heading 2'}
                {editor?.isActive('heading', { level: 3 }) && 'Heading 3'}
                {editor?.isActive('heading', { level: 4 }) && 'Heading 4'}
                {editor?.isActive('heading', { level: 5 }) && 'Heading 5'}
                {editor?.isActive('heading', { level: 6 }) && 'Heading 6'}
                {editor?.isActive('paragraph') && 'Paragraph'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Style:</span>
              <div className="flex items-center gap-1 font-medium">
                {editor?.isActive('bold') && <span>Bold</span>}
                {editor?.isActive('bold') && editor?.isActive('italic') && <span>+</span>}
                {editor?.isActive('italic') && <span>Italic</span>}
              </div>
            </div>
          </div>

          {/* Shortcuts and Stats */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
            <div className="flex items-center text-[10px] sm:text-xs">
              Press <kbd className="mx-1 px-1 py-0.5 bg-muted rounded">/</kbd> for commands
            </div>
            <div className="flex items-center gap-2">
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              <span className="text-muted-foreground">•</span>
              <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
            </div>
          </div>
        </div>
      </div>
      <LinkDialog 
        open={linkDialogOpen} 
        onOpenChange={setLinkDialogOpen}
        onSubmit={addLink}
      />
      <ImageDialog 
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onSubmit={(url) => addImage(url, editor)}
      />
      {uploadingImages.size > 0 && uploadProgress}
      {editor && <EditorBubbleMenu editor={editor} />}
      {editor && <EditorFloatingMenu editor={editor} />}
    </div>
  )
}
