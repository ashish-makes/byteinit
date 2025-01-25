"use client"

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Edit, 
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
import { useRouter } from 'next/navigation';

const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["LIBRARY", "TOOL", "FRAMEWORK", "TUTORIAL", "TEMPLATE", "OTHER"]),
  category: z.enum(["FRONTEND", "BACKEND", "FULLSTACK", "DEVOPS", "MOBILE", "AI_ML", "DATABASE", "SECURITY", "OTHER"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.string().optional().nullable()
});

const RESOURCE_TYPES = [
  "LIBRARY", "TOOL", "FRAMEWORK", "TUTORIAL", "TEMPLATE", "OTHER"
];

const RESOURCE_CATEGORIES = [
  "FRONTEND", "BACKEND", "FULLSTACK", "DEVOPS", 
  "MOBILE", "AI_ML", "DATABASE", "SECURITY", "OTHER"
];

const TagInput = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

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

interface EditResourceFormProps {
  resourceId: string;
}

export default function EditResourceForm({ resourceId }: EditResourceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const fetchResource = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch resource');
      }
      
      const resource = await response.json();
      
      form.reset({
        ...resource,
        tags: resource.tags ? resource.tags.join(', ') : null
      });
    } catch (error) {
      console.error('Fetch resource error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load resource');
      router.push('/dashboard/resources');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  const onSubmit = async (data: z.infer<typeof resourceSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
        })
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update resource');
      }
      
      toast.success('Resource updated successfully');
      router.push('/dashboard/resources');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full dark:bg-background/50 bg-white dark:border dark:border-border rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <Edit className="h-6 w-6 text-primary" />
          Edit Resource
        </h2>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Title */}
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

          {/* URL */}
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

          {/* Type and Category */}
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
                          {type.charAt(0) + type.slice(1).toLowerCase()}
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
                          {category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Tags */}
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
        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Update Resource
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push('/dashboard/resources')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}