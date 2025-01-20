"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Code2, Share2, Send } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const handleShare = async () => {
    const shareData = {
      title: 'DevHub',
      text: 'Check out DevHub - Your go-to platform for finding and sharing development tools, libraries, and resources.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thank you for sharing DevHub!",
          duration: 2000,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
          duration: 2000,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Sharing failed",
          description: "Please try again later.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };
  
  // Rest of your Footer component remains the same...
  return (
    <footer className="mt-auto">
      <div className="container px-4 pb-0">
        <div className="rounded-t-3xl border border-b-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Newsletter Section */}
          <div className="px-8 py-12 bg-neutral-50 dark:bg-neutral-900 rounded-t-3xl">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-3">
                Stay in the loop
              </h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest developer resources, tools, and updates.
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
                  className="inline-flex items-center space-x-2 bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <Code2 className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Byteinit</span>
                </Link>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Your go-to platform for finding and sharing development tools, libraries, and resources. Join a community of developers building the future together.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              {[
                {
                  title: "Platform",
                  links: [
                    { label: "Features", badge: "New" },
                    "Resource Directory",
                    "Integration Hub",
                    "Developer API",
                  ]
                },
                {
                  title: "Community",
                  links: [
                    "Documentation",
                    "Discussion Forums",
                    "Contributing Guide",
                    "Resource Submissions",
                  ]
                },
                {
                  title: "Company",
                  links: [
                    "About Us",
                    "Blog",
                    { label: "Careers", badge: "Hiring" },
                    "Contact",
                  ]
                },
                {
                  title: "Legal",
                  links: [
                    "Privacy Policy",
                    "Terms of Service",
                    "Code of Conduct",
                    "Cookie Settings",
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
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share DevHub
                </Button>
              </div>
              <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                © {currentYear} DevHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;