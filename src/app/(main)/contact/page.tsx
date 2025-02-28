'use client'

import React, { useState } from 'react'
import { TextAnimate } from "@/components/magicui/text-animate"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  Loader2,
  MessageSquare,
  Mail,
  Twitter,
  MessagesSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  issueType: z.string().min(1, "Please select an issue type"),
})

type FormValues = z.infer<typeof formSchema>

const issueTypes = [
  { 
    id: "technical-issue", 
    label: "Technical Issue",
    description: "Report bugs or technical problems"
  },
  { 
    id: "content-suggestion", 
    label: "Content Suggestion",
    description: "Suggest new resources or blog topics"
  },
  { 
    id: "feature-request", 
    label: "Feature Request",
    description: "Request new features or improvements"
  },
  { 
    id: "account-support", 
    label: "Account Support",
    description: "Help with your account or profile"
  },
  { 
    id: "partnership", 
    label: "Partnership Inquiry",
    description: "Collaborate with us"
  },
  { 
    id: "other", 
    label: "Other",
    description: "Other inquiries"
  }
]

const contactMethods = [
  {
    icon: MessageSquare,
    title: "Start a live chat",
    description: "Speak to our friendly team via live chat",
    href: "#",
    label: "Start a live chat"
  },
  {
    icon: Mail,
    title: "Shoot us an email",
    description: "Send us a message at ashindia.003@gmail.com",
    href: "mailto:ashindia.003@gmail.com",
    label: "Send email"
  },
  {
    icon: Twitter,
    title: "Message us on X",
    description: "DM us for quick answers to your questions",
    href: "https://twitter.com/yourusername",
    label: "Message on X"
  }
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      issueType: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    const promise = fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to send message')
      form.reset()
      return response.json()
    })

    toast.promise(promise, {
      loading: 'Sending message...',
      success: 'Message sent successfully! Check your email for confirmation.',
      error: 'Failed to send message. Please try again later.',
      finally: () => setIsLoading(false)
    })
  }

  return (
    <div className="container max-w-6xl py-32">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-3">
          <TextAnimate animation="slideUp" by="word">
            Get in Touch with Our Team
          </TextAnimate>
        </h1>
        <p className="text-muted-foreground">
          Have a question, suggestion, or need help? We're here to assist you with anything related to our developer resources platform.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issue Type */}
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What can we help you with?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid sm:grid-cols-2 gap-4"
                      >
                        {issueTypes.map((issue) => (
                          <FormItem key={issue.id}>
                            <label
                              htmlFor={issue.id}
                              className={cn(
                                "flex flex-col items-start p-4 border rounded-lg space-y-2 cursor-pointer",
                                "hover:border-primary/50 transition-colors",
                                field.value === issue.id && "border-primary bg-primary/5"
                              )}
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <RadioGroupItem 
                                  value={issue.id} 
                                  id={issue.id}
                                />
                                <div className="space-y-1 flex-1">
                                  <FormLabel className="text-base">
                                    {issue.label}
                                  </FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    {issue.description}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Leave us a message..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending message...
                  </>
                ) : (
                  'Send message'
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Contact Methods */}
        <div className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Quick Support Options</h2>
            <p className="text-muted-foreground">
              Choose the most convenient way to reach us
            </p>
            <div className="grid gap-6">
              {contactMethods.map((method) => (
                <a
                  key={method.title}
                  href={method.href}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <method.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Join Our Community</h2>
            <p className="text-sm text-muted-foreground">
              Connect with thousands of developers and tech enthusiasts in our community.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 