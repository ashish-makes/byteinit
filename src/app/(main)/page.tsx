import React from "react";
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
} from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import Marquee from "@/components/magicui/marquee";
import NumberTicker from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
  icon: any;
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
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto">
        {/* Centered Hero Content */}
        <div className="flex flex-col items-center justify-center text-center pt-40 pb-12">
          <div className="z-10 mb-8">
            <div
              className={cn(
                "group inline-flex rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>✨ 20k + resources</span>
                <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>

          <h1 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl">
            <TextAnimate animation="slideUp" by="word">
              All resources a developer needs at one place.
            </TextAnimate>
          </h1>

          <TextAnimate
            animation="fadeIn"
            by="line"
            as="p"
            className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base md:text-lg max-w-2xl"
          >
            Your go-to platform for finding and sharing development tools,
            libraries, and resources. Join a community of developers building
            the future together.
          </TextAnimate>

          <div className="flex flex-row gap-4">
            <Button className="rounded-full">
              Get Started
              <ArrowRight className="ml-2" />
            </Button>
            <Button variant="secondary" className="rounded-full">
              Browse resources
            </Button>
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
      {/* Stats Section */}
<section className="py-12 md:py-20">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center flex flex-col items-center">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
            <span className="flex items-baseline justify-center gap-1">
              <NumberTicker value={stat.value} />
              <span className="">k+</span>
            </span>
          </h3>
          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Features Section */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <TextAnimate animation="slideUp" by="word">
                Powerful features for developers
              </TextAnimate>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to discover, manage, and share development
              resources effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-gray-700/50 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 dark:bg-neutral-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <TextAnimate animation="slideUp" by="word">
                Loved by developers
              </TextAnimate>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of developers who are already using our platform
            </p>
          </div>

          <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden rounded-lg">
            <div className="resources absolute inset-0 flex flex-col items-center justify-center">
              <Marquee pauseOnHover className="[--duration:20s]">
                {firstRowTestimonials.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRowTestimonials.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-none shadow-none bg-neutral-50 dark:bg-neutral-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-neutral-200/50 dark:bg-grid-neutral-700/50" />

            {/* Decorative Elements */}
            <div className="absolute top-12 left-12 animate-pulse">
              <Sparkles className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="absolute bottom-12 right-12 animate-pulse delay-300">
              <Star className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>

            <CardContent className="relative px-8 py-20">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                  <TextAnimate animation="slideUp" by="word">
                    Ready to supercharge your development workflow?
                  </TextAnimate>
                </h2>

                <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-300">
                  Join thousands of developers discovering and sharing the best
                  development resources daily. Your next breakthrough project
                  starts here.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button className="rounded-full">
                    Get Started
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Browse resources
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>50,000+ developers</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span>Free forever</span>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span>No credit card required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
