"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Share2, Send } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { resolvedTheme } = useTheme();
  
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  
  return (
    <footer className="mt-auto">
      <div className="container px-4 pb-0">
        <div className="rounded-t-3xl border border-b-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Newsletter Section */}
          <div className="px-8 py-12 bg-neutral-50 dark:bg-neutral-900 rounded-t-3xl">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-3">
                Stay up to date
              </h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest resources, developer tools, and community updates.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="rounded-full pl-4 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-zinc-600"
                />
                <Button className="rounded-full px-6" size="default">
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-8 gap-y-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <Link 
                  href="/" 
                  className="inline-flex items-center space-x-2 px-1 transition-colors"
                >
                  <Image 
                    src={logoSrc} 
                    alt="Byteinit Logo" 
                    width={28} 
                    height={28}
                    className="transition-opacity"
                  />
                </Link>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Your comprehensive platform for discovering and sharing developer resources, tools, and libraries. Join our community of builders creating the future.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <Link href="https://github.com/byteinit" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Github className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="https://twitter.com/byteinit" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              {[
                {
                  title: "Resources",
                  links: [
                    { label: "All Resources", badge: "Popular" },
                    "Frontend",
                    "Backend",
                    "Dev Tools",
                  ]
                },
                {
                  title: "Community",
                  links: [
                    "Blog",
                    "Tutorials",
                    "Contribute",
                    "Submit Resources",
                  ]
                },
                {
                  title: "About",
                  links: [
                    "Our Mission",
                    "Team",
                    { label: "Join Us", badge: "Hiring" },
                    "Contact",
                  ]
                },
                {
                  title: "Legal",
                  links: [
                    "Privacy Policy",
                    "Terms of Service",
                    "Code of Conduct",
                    "Cookie Policy",
                  ]
                }
              ].map((section, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="font-medium text-sm tracking-wide text-primary/90 uppercase">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {typeof link === 'string' ? link : (
                            <span className="flex items-center gap-2">
                              {link.label}
                              {link.badge && (
                                <Badge variant="secondary" className="text-xs rounded-full px-2 bg-primary/10 text-primary hover:bg-primary/20">
                                  {link.badge}
                                </Badge>
                              )}
                            </span>
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Byteinit
                </Button>
              </div>
              <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                © {currentYear} Byteinit. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;