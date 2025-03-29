import React from 'react'
import { TextAnimate } from "@/components/magicui/text-animate"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Search,
  BookOpen,
  Settings,
  Users,
  MessageCircle,
  Shield,
  Zap,
  FileText,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const helpSections = [
  {
    icon: Zap,
    title: "Quick Start",
    links: [
      { title: "Getting Started Guide", href: "/help/getting-started" },
      { title: "Account Setup", href: "/help/account-setup" },
      { title: "Platform Overview", href: "/help/overview" }
    ]
  },
  {
    icon: BookOpen,
    title: "Using the Platform",
    links: [
      { title: "Finding Resources", href: "/help/resources" },
      { title: "Blog & Content", href: "/help/blog" },
      { title: "Saving & Collections", href: "/help/collections" }
    ]
  },
  {
    icon: Settings,
    title: "Account Settings",
    links: [
      { title: "Profile Management", href: "/help/profile" },
      { title: "Privacy Settings", href: "/help/privacy" }
    ]
  },
  {
    icon: Users,
    title: "Community",
    links: [
      { title: "Contributing Guidelines", href: "/help/guidelines" },
      { title: "Community Rules", href: "/help/rules" },
      { title: "Reputation System", href: "/help/reputation" }
    ]
  },
  {
    icon: Shield,
    title: "Security & Support",
    links: [
      { title: "Account Security", href: "/help/security" },
      { title: "Report an Issue", href: "/help/report" },
      { title: "Contact Support", href: "/contact" }
    ]
  }
]

const helpTopics = [
  { title: "Getting Started", href: "/help/getting-started" },
  { title: "Account Settings", href: "/help/account-settings" },
  { title: "Resources", href: "/help/resources" },
  { title: "Blog Posts", href: "/help/blog-posts" },
  { title: "Profile", href: "/help/profile" },
  { title: "Privacy", href: "/help/privacy" },
  { title: "Terms", href: "/help/terms" },
  { title: "Contact", href: "/help/contact" },
];

export default function HelpCenter() {
  return (
    <div className="container max-w-4xl pt-32 pb-16">
      {/* Header & Search */}
      <div className="space-y-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            <TextAnimate animation="slideUp" by="word">
              How can we help?
            </TextAnimate>
          </h1>
          <p className="text-muted-foreground">
            Search our help articles or browse topics below
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search help articles..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Popular Articles */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Popular Articles</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Platform basics & navigation",
            "Managing your account",
            "Content guidelines",
            "Security best practices"
          ].map((title) => (
            <Link
              key={title}
              href="#"
              className="flex items-center justify-between p-3 rounded-md hover:bg-accent/50 group"
            >
              <span>{title}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Help Sections */}
      <div className="grid gap-8">
        {helpSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-4">
              <section.icon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{section.title}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {section.links.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="p-3 rounded-md hover:bg-accent/50 group flex items-center justify-between"
                >
                  <span className="text-sm">{link.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <Separator className="my-8" />
      <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">Need more help?</h3>
            <p className="text-sm text-muted-foreground">Get in touch with our support team</p>
          </div>
        </div>
        <Link 
          href="/contact"
          className="text-sm text-primary hover:underline"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
} 