"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sparkles, User, LogOut, Settings, BookMarked, Plus, ChevronDown, Code, ExternalLink, BookOpen, HelpCircle, FileText, MessageSquare, Users, Github, FolderKanban, Database, PenSquare, BarChart3, Layers, Zap, Terminal, ArrowRight, Package, Bookmark, Coffee, BookCheck, Rocket, CodeSquare, GraduationCap, LayoutGrid, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/core/animated-background";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const communityDropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  // Navigation items ordered by priority
  const TABS = [
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Mobile navigation items (including Dashboard)
  const MOBILE_TABS = [
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target as Node)) {
        setResourcesMenuOpen(false);
      }
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target as Node)) {
        setCommunityMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
    if (resourcesMenuOpen) setResourcesMenuOpen(false);
    if (communityMenuOpen) setCommunityMenuOpen(false);
  }, [userMenuOpen, resourcesMenuOpen, communityMenuOpen]);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
    if (mobileMenuOpen) setMobileMenuOpen(false);
    if (resourcesMenuOpen) setResourcesMenuOpen(false);
    if (communityMenuOpen) setCommunityMenuOpen(false);
  }, [mobileMenuOpen, resourcesMenuOpen, communityMenuOpen]);

  const toggleResourcesMenu = useCallback(() => {
    setResourcesMenuOpen((prev) => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
    if (communityMenuOpen) setCommunityMenuOpen(false);
  }, [userMenuOpen, communityMenuOpen]);

  const toggleCommunityMenu = useCallback(() => {
    setCommunityMenuOpen((prev) => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
    if (resourcesMenuOpen) setResourcesMenuOpen(false);
  }, [userMenuOpen, resourcesMenuOpen]);

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getProfileUrl = () => {
    const identifier = session?.user?.username || session?.user?.email?.split('@')[0] || '';
    return `/u/${identifier}`;
  };

  const handleCopyProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const profileUrl = `${window.location.origin}${getProfileUrl()}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Profile URL copied",
        description: "Your profile URL has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy profile URL to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!mounted) return null;

  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  const UserMenu = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "w-60 p-1",
        "bg-background",
        "shadow-[0_10px_38px_-10px_rgba(0,0,0,0.2),0_10px_20px_-15px_rgba(0,0,0,0.1)]",
        "dark:shadow-[0_10px_38px_-10px_rgba(0,0,0,0.4),0_10px_20px_-15px_rgba(0,0,0,0.2)]",
        "border border-border/50",
        "rounded-lg"
      )}
    >
      {/* User Info */}
      <div className="flex items-center gap-3 px-3 py-2 mb-1">
        <Avatar className="h-10 w-10">
          {session?.user?.image ? (
            <AvatarImage src={session.user.image || ''} alt={session.user?.name || 'Profile'} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
        </div>
      </div>

      <div className="h-px bg-border/50 my-1" />

      <div className="py-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent/50 transition-colors duration-200"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href={getProfileUrl()}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent/50 transition-colors duration-200 justify-between group"
        >
          <div className="flex items-center gap-3">
            <User className="h-4 w-4" />
            <span>Public Profile</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-accent rounded-md shrink-0"
            onClick={handleCopyProfile}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </Link>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent/50 transition-colors duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>

        <div className="h-px bg-border/50 my-1" />

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </motion.div>
  );

  const ResourcesMenu = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="bg-background rounded-md overflow-hidden shadow-[0_6px_16px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)_inset] dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)_inset] border border-border/50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="px-3 py-2 border-b border-border/40 bg-muted"
      >
        <span className="text-sm font-medium">Developer Resources</span>
      </motion.div>
      <div className="py-1">
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
        >
          <Link
            href="/resources/frontend"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <Code className="w-4 h-4 text-primary/70" />
            <span>Frontend Development</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        >
          <Link
            href="/resources/backend"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <Database className="w-4 h-4 text-primary/70" />
            <span>Backend Development</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.15 }}
        >
          <Link
            href="/resources/tools"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <CodeSquare className="w-4 h-4 text-primary/70" />
            <span>Dev Tools & Libraries</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.2 }}
        >
          <Link
            href="/resources/browse"
            className="flex items-center gap-2 px-3 py-1.5 mt-1 pt-1 text-sm border-t border-border/40 hover:bg-primary/10 transition-all duration-200"
          >
            <Layers className="w-4 h-4 text-primary/70" />
            <span>Browse All Resources</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );

  const BlogMenu = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="bg-background rounded-md overflow-hidden shadow-[0_6px_16px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)_inset] dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)_inset] border border-border/50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="px-3 py-2 border-b border-border/40 bg-muted"
      >
        <span className="text-sm font-medium">Blog Categories</span>
      </motion.div>
      <div className="py-1">
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
        >
          <Link
            href="/blog/tutorials"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 text-primary/70" />
            <span>Tutorials</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        >
          <Link
            href="/blog/news"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <FileText className="w-4 h-4 text-primary/70" />
            <span>News & Updates</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.15 }}
        >
          <Link
            href="/blog/case-studies"
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-primary/10 transition-all duration-200"
          >
            <GraduationCap className="w-4 h-4 text-primary/70" />
            <span>Case Studies</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: 0.2 }}
        >
          <Link
            href="/blog"
            className="flex items-center gap-2 px-3 py-1.5 mt-1 pt-1 text-sm border-t border-border/40 hover:bg-primary/10 transition-all duration-200"
          >
            <Bookmark className="w-4 h-4 text-primary/70" />
            <span>All Articles</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <header
          className={`
            mx-auto max-w-6xl rounded-full 
            bg-background/60 backdrop-blur-xl 
            px-4 py-3 transition-all duration-300 
            border border-border/40
            ${isScrolled ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]" : "shadow-none"}
          `}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-all duration-300"
              >
                <Image 
                  src={logoSrc} 
                  alt="Byteinit Logo" 
                  width={24} 
                  height={24}
                  className="transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-row">
              <AnimatedBackground
                defaultValue={TABS[0].name}
                className="rounded-full bg-zinc-100 dark:bg-zinc-800"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.3,
                }}
                enableHover
              >
                {TABS.map((tab, index) => (
                  <Link
                    key={index}
                    href={tab.href}
                    data-id={tab.name}
                    className="px-3 py-1.5 text-zinc-600 transition-colors duration-300 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {tab.name}
                  </Link>
                ))}
              </AnimatedBackground>
            </div>

            {/* Actions - More compact */}
            <div className="flex items-center gap-1">
              {status === "loading" ? (
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <>
                  {/* Profile Dropdown */}
                  <div className="hidden sm:block relative" ref={userDropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleUserMenu}
                      className="px-2 relative h-9 flex items-center gap-2.5 hover:bg-muted/50 rounded-full"
                    >
                      <Avatar className="h-7 w-7">
                        {session.user?.image ? (
                          <AvatarImage 
                            src={session.user.image || ''} 
                            alt={session.user?.name || 'Profile'} 
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm font-medium">
                        {session.user?.name?.split(" ")[0] || 'User'}
                      </span>
                    </Button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-60 overflow-hidden">
                          <UserMenu />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-normal transition-all duration-300 text-md"
                    >
                      Sign up
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-normal text-md hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                </div>
              )}

              <ThemeToggle />

              {/* Mobile Menu */}
              <div className="relative md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 rounded-full transition-all duration-300"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  aria-haspopup="true"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>
      
      {/* Mobile Menu - moved outside the header to avoid positioning constraints */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 top-0 left-0 w-full h-full bg-background dark:bg-zinc-900 z-[100] overflow-hidden flex flex-col"
          >
            {/* Mobile Menu Header - compact and clean */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border-b border-border/40"
            >
              <div className="flex items-center justify-between p-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-bold hover:text-primary transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  <Image 
                    src={logoSrc} 
                    alt="Byteinit Logo" 
                    width={22} 
                    height={22}
                    className="transition-opacity"
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={toggleMobileMenu}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-md mx-auto pt-2 pb-4 px-4 h-full flex flex-col">
                {/* Main Navigation - Compact */}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="pb-3"
                >
                  <AnimatePresence mode="wait">
                    <div>
                      {MOBILE_TABS.map((tab, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ 
                            delay: index * 0.03, 
                            duration: 0.2,
                            exit: { delay: 0.01 * (MOBILE_TABS.length - index) }
                          }}
                        >
                          <Link
                            href={tab.href}
                            className="group flex items-center justify-between py-3"
                            onClick={toggleMobileMenu}
                          >
                            <span className="text-base font-medium">
                              {tab.name}
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary group-hover:-rotate-45 transition-all duration-200" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </motion.div>
                
                {/* Auth buttons for non-logged in users */}
                {!session && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="py-5"
                  >
                    <div className="px-1 space-y-3">
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, delay: 0.25 }}
                        className="w-full"
                      >
                        <Link href="/auth/register" onClick={toggleMobileMenu} className="block w-full">
                          <Button
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-md text-base font-medium"
                          >
                            Sign up
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                        className="w-full"
                      >
                        <Link href="/auth/login" onClick={toggleMobileMenu} className="block w-full">
                          <Button
                            variant="outline"
                            className="w-full h-12 border-2 hover:bg-background hover:text-primary hover:border-primary transition-all duration-300 rounded-md text-base font-medium"
                          >
                            Log in
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                {/* Content placeholder - keeps the layout intact */}
                <div className="flex-1"></div>
                
                {/* Social Links - Simplified to text only */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="pt-4 pb-2 mt-auto"
                >
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
                    <AnimatePresence mode="wait">
                      {[
                        { name: "Discord", href: "/discord" },
                        { name: "GitHub", href: "https://github.com/byteinit" },
                        { name: "Twitter", href: "https://twitter.com/byteinit" },
                        { name: "Roadmap", href: "/roadmap" },
                        { name: "Sponsor", href: "/sponsor" }
                      ].map((link, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ 
                            duration: 0.15, 
                            delay: 0.3 + (index * 0.05),
                            exit: { delay: 0.01 * (5 - index) }
                          }}
                        >
                          <Link 
                            href={link.href} 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={toggleMobileMenu}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
                
                {/* Legal Links */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                  className="pt-2 pb-3"
                >
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <AnimatePresence mode="wait">
                      {[
                        { name: "Terms of Service", href: "/legal/terms" },
                        { name: "Privacy Policy", href: "/legal/privacy" },
                        { name: "Cookie Policy", href: "/legal/cookies" },
                        { name: "Licenses", href: "/legal/licenses" }
                      ].map((link, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ 
                            duration: 0.15, 
                            delay: 0.45 + (index * 0.05),
                            exit: { delay: 0.01 * (4 - index) }
                          }}
                        >
                          <Link 
                            href={link.href} 
                            className="hover:text-primary"
                            onClick={toggleMobileMenu}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.6 }}
                    className="text-center text-xs text-muted-foreground mt-3"
                  >
                    © {new Date().getFullYear()} ByteInit. All rights reserved.
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}