import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code,
  Database,
  Book,
  Terminal,
  GitBranch,
  Package,
  Cloud,
  Coffee,
  Layout,
  Cpu,
  Globe,
  FileCode,
  Zap,
  Star,
  Users,
  Download,
  Sparkles,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import Marquee from "@/components/magicui/marquee";
import NumberTicker from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import { SavedPostsProvider } from "@/contexts/SavedPostsContext";

const resources = [
  {
    name: "React Components",
    category: "Frontend",
    description: "Collection of reusable React components and hooks",
    icon: Code,
  },
  {
    name: "API Tools",
    category: "Backend",
    description: "Essential tools for API development and testing",
    icon: Database,
  },
  {
    name: "Documentation",
    category: "Resources",
    description: "Comprehensive guides and documentation templates",
    icon: Book,
  },
  {
    name: "CLI Tools",
    category: "DevTools",
    description: "Command-line utilities for faster development",
    icon: Terminal,
  },
  {
    name: "Git Resources",
    category: "Version Control",
    description: "Git workflows and best practices",
    icon: GitBranch,
  },
  {
    name: "NPM Packages",
    category: "Libraries",
    description: "Curated list of essential npm packages",
    icon: Package,
  },
  {
    name: "Cloud Services",
    category: "Infrastructure",
    description: "Cloud computing tools and services",
    icon: Cloud,
  },
  {
    name: "Development Setup",
    category: "Environment",
    description: "Development environment configurations",
    icon: Coffee,
  },
  {
    name: "UI Libraries",
    category: "Design",
    description: "Modern UI components and design systems",
    icon: Layout,
  },
  {
    name: "System Tools",
    category: "Performance",
    description: "System optimization and monitoring tools",
    icon: Cpu,
  },
  {
    name: "Web APIs",
    category: "Integration",
    description: "Web API documentation and testing tools",
    icon: Globe,
  },
  {
    name: "Code Snippets",
    category: "Utilities",
    description: "Useful code snippets and algorithms",
    icon: FileCode,
  },
];

const features = [
  {
    title: "Smart Search",
    description: "Find resources instantly with our AI-powered search system",
    icon: Zap,
  },
  {
    title: "Curated Collections",
    description: "Hand-picked resources organized by experienced developers",
    icon: Star,
  },
  {
    title: "Community Driven",
    description: "Resources vetted and recommended by the dev community",
    icon: Users,
  },
  {
    title: "Regular Updates",
    description: "New resources and tools added daily by our active community",
    icon: Download,
  },
];

const categories = [
  {
    name: "Frontend Development",
    icon: Layout,
    count: "2.3k",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    name: "Backend & APIs",
    icon: Database,
    count: "1.8k",
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    name: "DevOps & Cloud",
    icon: Globe,
    count: "1.5k",
    color: "bg-green-500/10 text-green-500"
  },
  {
    name: "System Design",
    icon: Cpu,
    count: "980",
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    name: "Algorithms & DSA",
    icon: Code,
    count: "1.2k",
    color: "bg-pink-500/10 text-pink-500"
  },
  {
    name: "CLI Tools",
    icon: Terminal,
    count: "750",
    color: "bg-yellow-500/10 text-yellow-500"
  },
  {
    name: "Version Control",
    icon: GitBranch,
    count: "890",
    color: "bg-red-500/10 text-red-500"
  },
  {
    name: "Code Snippets",
    icon: FileCode,
    count: "2.1k",
    color: "bg-indigo-500/10 text-indigo-500"
  }
];

const latestResources = [
  {
    title: "Next.js 14 Performance Optimization Guide",
    category: "Frontend",
    date: "2 days ago",
    views: "1.2k",
    author: "Sarah Chen"
  },
  {
    title: "Docker Compose Best Practices 2024",
    category: "DevOps",
    date: "3 days ago",
    views: "980",
    author: "Mike Ross"
  },
  {
    title: "GraphQL API Security Checklist",
    category: "Backend",
    date: "4 days ago",
    views: "850",
    author: "Alex Kumar"
  },
  {
    title: "React Server Components Deep Dive",
    category: "Frontend",
    date: "5 days ago",
    views: "2.1k",
    author: "Lisa Wang"
  }
];

const communityHighlights: Array<{
  type: "contributor" | "discussion";
  name?: string;
  avatar?: string;
  contributions?: string;
  specialty?: string;
  badge?: string;
  title?: string;
  participants?: string;
  replies?: string;
  category?: string;
  isHot?: boolean;
}> = [
  {
    type: "contributor",
    name: "David Kim",
    avatar: "https://avatar.vercel.sh/david",
    contributions: "234",
    specialty: "Frontend Development",
    badge: "Top Contributor"
  },
  {
    type: "discussion",
    title: "Best practices for API authentication in 2024",
    participants: "45",
    replies: "128",
    category: "Backend",
    isHot: true
  },
  {
    type: "contributor",
    name: "Emma Wilson",
    avatar: "https://avatar.vercel.sh/emma",
    contributions: "189",
    specialty: "DevOps",
    badge: "Rising Star"
  },
  {
    type: "discussion",
    title: "Comparing state management solutions",
    participants: "32",
    replies: "95",
    category: "Frontend",
    isHot: true
  }
];

const stats = [
  { label: "Active Users", value: 50 },
  { label: "Resources", value: 20 },
  { label: "Categories", value: 15 },
  { label: "Daily Updates", value: 20 },
];

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
];

const firstRow = resources.slice(0, resources.length / 3);
const secondRow = resources.slice(
  resources.length / 3,
  (resources.length / 3) * 2
);
const thirdRow = resources.slice((resources.length / 3) * 2);

const ResourceCard = ({
  icon: Icon,
  name,
  category,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  category: string;
  description: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-72 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950/[.1] dark:bg-gray-50/[.15]">
          <Icon className="size-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {category}
          </p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </blockquote>
    </figure>
  );
};

const firstRowTestimonials = reviews.slice(0, reviews.length / 2);
const secondRowTestimonials = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure className="w-[280px] p-4 mx-2 rounded-lg bg-white dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50">
      <blockquote className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
        {body}
      </blockquote>
      <div className="flex items-center gap-2">
        <Image
          className="rounded-full"
          width={24}
          height={24}
          alt={`Avatar of ${name}`}
          src={img}
        />
        <div>
          <figcaption className="text-sm font-medium">
            {name}
          </figcaption>
          <p className="text-xs text-muted-foreground">
            {username}
          </p>
        </div>
      </div>
    </figure>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto">
        {/* Centered Hero Content */}
        <div className="flex flex-col items-center justify-center text-center pt-24 pb-12">
          <div className="z-10 mb-6">
            <div className="inline-flex rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
              <AnimatedShinyText className="inline-flex items-center justify-center px-3 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span className="text-xs">✨ 20k + resources</span>
                <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>

          <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            <TextAnimate animation="slideUp" by="word">
              All resources a developer needs at one place.
            </TextAnimate>
          </h1>

          <TextAnimate
            animation="fadeIn"
            by="line"
            as="p"
            className="mb-6 text-sm text-muted-foreground sm:text-base max-w-xl"
          >
            Your go-to platform for finding and sharing development tools,
            libraries, and resources.
          </TextAnimate>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-0 text-black dark:text-white rounded-full px-6"
            >
              Browse resources
            </Button>
          </div>

          {/* Stats - Compact and animated */}
          <div className="flex gap-8 mt-8 justify-center text-center">
            <div>
              <div className="text-2xl font-semibold mb-1">
                <NumberTicker value={10} />k+
              </div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">
                <NumberTicker value={50} />k+
              </div>
              <div className="text-sm text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">
                <NumberTicker value={99} />%
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="relative h-[400px] sm:h-[400px] w-full overflow-hidden rounded-lg">
          <div className="resources absolute inset-0 flex flex-col items-center justify-center">
            <Marquee pauseOnHover className="[--duration:25s]">
              {firstRow.map((resource) => (
                <ResourceCard key={resource.name} {...resource} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:25s]">
              {secondRow.map((resource) => (
                <ResourceCard key={resource.name} {...resource} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:25s]">
              {thirdRow.map((resource) => (
                <ResourceCard key={resource.name} {...resource} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              <TextAnimate animation="slideUp" by="word">
                Powerful features for developers
              </TextAnimate>
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Everything you need to discover, manage, and share development resources effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-5 rounded-lg bg-white dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-md bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-medium mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                <TextAnimate animation="slideUp" by="word">
                  Browse by category
                </TextAnimate>
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Explore our extensive collection of developer resources across different domains
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="group flex items-center gap-3 p-4 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 bg-white dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className={cn("p-2.5 rounded-md", category.color)}>
                    <category.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} resources</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              <TextAnimate animation="slideUp" by="word">
                Loved by developers
              </TextAnimate>
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Join thousands of developers who trust our platform for their resource needs
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="flex flex-col space-y-3">
              <Marquee pauseOnHover className="[--duration:30s]">
                {firstRowTestimonials.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:30s]">
                {secondRowTestimonials.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800/50">
              <div className="grid md:grid-cols-2 items-center">
                {/* Left Content */}
                <div className="p-8 md:p-10 relative z-10">
                  <div className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800/50 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300 mb-6">
                    <Users className="mr-1.5 h-3 w-3" />
                    <span>50,000+ developers</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                    <TextAnimate animation="slideUp" by="word">
                      Ready to discover the best dev resources?
                    </TextAnimate>
                  </h2>

                  <p className="text-sm text-muted-foreground mb-6">
                    Join our community of developers and unlock access to curated resources, tools, and insights.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-0 text-black dark:text-white rounded-full px-6"
                    >
                      Browse resources
                    </Button>
                  </div>

                  <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Free forever
                    </span>
                    <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      No credit card
                    </span>
                  </div>
                </div>

                {/* Right Content */}
                <div className="relative h-full p-8 md:p-10 bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800/50">
                        <Star className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Curated Resources</h3>
                        <p className="text-sm text-muted-foreground">Hand-picked development tools and resources</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800/50">
                        <Users className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Active Community</h3>
                        <p className="text-sm text-muted-foreground">Connect with developers worldwide</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800/50">
                        <ArrowUpRight className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Daily Updates</h3>
                        <p className="text-sm text-muted-foreground">Fresh content added every day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
