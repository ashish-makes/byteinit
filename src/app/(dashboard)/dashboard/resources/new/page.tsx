/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Upload, 
  Loader2, 
  X, 
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum([
    "LIBRARY", 
    "TOOL", 
    "FRAMEWORK", 
    "TUTORIAL", 
    "TEMPLATE", 
    "ICON_SET", 
    "ILLUSTRATION", 
    "COMPONENT_LIBRARY", 
    "CODE_SNIPPET", 
    "API", 
    "DOCUMENTATION", 
    "COURSE", 
    "OTHER"
  ]),
  category: z.enum([
    "FRONTEND", 
    "BACKEND", 
    "FULLSTACK", 
    "DEVOPS", 
    "MOBILE", 
    "AI_ML", 
    "DATABASE", 
    "SECURITY", 
    "UI_UX", 
    "DESIGN", 
    "MACHINE_LEARNING", 
    "CLOUD", 
    "OTHER"
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.string().optional().nullable()
});

const RESOURCE_TYPES = [
  "LIBRARY", 
  "TOOL", 
  "FRAMEWORK", 
  "TUTORIAL", 
  "TEMPLATE", 
  "ICON_SET", 
  "ILLUSTRATION", 
  "COMPONENT_LIBRARY", 
  "CODE_SNIPPET", 
  "API", 
  "DOCUMENTATION", 
  "COURSE", 
  "OTHER"
];

const RESOURCE_CATEGORIES = [
  "FRONTEND", 
  "BACKEND", 
  "FULLSTACK", 
  "DEVOPS", 
  "MOBILE", 
  "AI_ML", 
  "DATABASE", 
  "SECURITY", 
  "UI_UX", 
  "DESIGN", 
  "MACHINE_LEARNING", 
  "CLOUD", 
  "OTHER"
];

// Helper function to format enum values for display
const formatEnumValue = (value: string) => {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TagInput = ({ 
  value, 
  onChange 
}: TagInputProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = value ? value.split(',').map(t => t.trim()) : [];
      onChange([...currentTags, newTag.trim()].join(', '));
      setNewTag('');
    }
    setIsAdding(false);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = value ? value.split(',').map(t => t.trim()) : [];
    onChange(currentTags.filter(tag => tag !== tagToRemove).join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTag('');
    }
  };

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-lg min-h-[2.5rem] items-center">
      {value && value.split(',').map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
        >
          {tag.trim()}
          <button
            type="button"
            className="ml-1 hover:text-destructive-foreground/90"
            onClick={() => removeTag(tag.trim())}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {isAdding ? (
        <Input
          ref={inputRef}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="w-32 h-7 text-sm bg-background"
          placeholder="Add tag..."
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full hover:bg-muted"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      )}
    </div>
  );
};

export default function ResourceUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "OTHER",
      category: "OTHER",
      description: "",
      tags: null
    }
  });

  const onSubmit = async (data: z.infer<typeof resourceSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
        })
      });

      if (!response.ok) throw new Error('Failed to upload resource');
      
      toast.success('Resource uploaded successfully');
      form.reset();
    } catch (error) {
      toast.error('Failed to upload resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full dark:bg-background/50 bg-white dark:border dark:border-border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Upload className="h-6 w-6 text-primary" />
        Upload New Resource
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Title - Highest Priority Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Resource Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Enter a descriptive title for the resource"
              aria-invalid={form.formState.errors.title ? "true" : "false"}
              className="w-full"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* URL - Second Highest Priority */}
          <div className="space-y-2">
            <Label htmlFor="url">Resource URL *</Label>
            <Input
              id="url"
              {...form.register('url')}
              placeholder="https://example.com/resource"
              aria-invalid={form.formState.errors.url ? "true" : "false"}
              className="w-full"
            />
            {form.formState.errors.url && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>

          {/* Type and Category - Third Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resource Type *</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger aria-label="Select resource type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatEnumValue(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category *</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger aria-label="Select resource category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatEnumValue(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Description - Now Required */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Provide additional details about the resource"
              className="w-full min-h-[100px]"
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Tags - Using new TagInput component */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <TagInput
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full mt-6"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resource
            </>
          )}
        </Button>
      </form>
    </div>
  );
}