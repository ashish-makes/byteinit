"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sparkles, User, LogOut, Settings, BookMarked, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/core/animated-background";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Navigation items ordered by priority
  const TABS = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
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
  }, [userMenuOpen]);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  const UserMenu = () => (
    <div className="py-1">
      {session && (
        <div className="px-3 py-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <User className="w-8 h-8 p-1.5 rounded-full bg-primary/10" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">{session.user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      )}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <BookMarked className="w-4 h-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <User className="w-4 h-4" />
        Profile
      </Link>
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <Settings className="w-4 h-4" />
        Settings
      </Link>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 w-full text-left px-3 py-2 mt-1 text-sm text-red-600 hover:bg-zinc-100 hover:text-red-700 dark:hover:bg-zinc-800 border-t border-border/40"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
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
            ${isScrolled ? "shadow-lg" : "shadow-none"}
          `}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>byteinit</span>
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
                <div className="h-8 w-8 animate-pulse rounded-full bg-primary/10" />
              ) : session ? (
                <>
                  {/* Profile Dropdown */}
                  <div className="hidden sm:block relative" ref={userDropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleUserMenu}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <span className="truncate max-w-[100px]">
                        {session.user?.name?.split(" ")[0]}
                      </span>
                    </Button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-background border border-border/40">
                        <UserMenu />
                      </div>
                    )}
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
              <div className="relative md:hidden" ref={dropdownRef}>
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
                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-background border border-border/40 divide-y divide-border">
                    {session && <UserMenu />}
                    {/* Navigation Links */}
                    <div className="py-1">
                      {TABS.map((tab, index) => (
                        <Link
                          key={index}
                          href={tab.href}
                          className="block px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          onClick={toggleMobileMenu}
                        >
                          {tab.name}
                        </Link>
                      ))}
                    </div>
                    {/* Auth Actions */}
                    {!session && (
                      <div className="py-1">
                        <Link
                          href="/auth/register"
                          className="block px-3 py-2 text-sm font-normal text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          Sign up
                        </Link>
                        <Link
                          href="/auth/login"
                          className="block px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        >
                          Login
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};