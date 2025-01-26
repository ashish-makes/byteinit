/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Invalid URL"),
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
  tags: z.string().optional()
});

export default function ResourceUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      type: "OTHER",
      category: "OTHER",
      tags: ""
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

  // Helper function to format enum values for display
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Resource Title</FormLabel>
                    <FormDescription>
                      Give your resource a clear and descriptive title
                    </FormDescription>
                    <FormControl>
                      <Input className="border-2" placeholder="Enter resource title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Description</FormLabel>
                    <FormDescription>
                      Explain what makes this resource valuable
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        className="min-h-[120px] border-2" 
                        placeholder="Describe the resource" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Resource URL</FormLabel>
                    <FormControl>
                      <Input className="border-2" placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Resource Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
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
                          ].map(type => (
                            <SelectItem key={type} value={type}>
                              {formatEnumValue(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Resource Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select resource category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
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
                          ].map(category => (
                            <SelectItem key={category} value={category}>
                              {formatEnumValue(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Tags</FormLabel>
                    <FormDescription>
                      Add relevant tags separated by commas (e.g., react, nextjs, typescript)
                    </FormDescription>
                    <FormControl>
                      <Input className="border-2" placeholder="Enter tags..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}