"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Github, Globe, Twitter, RefreshCw, User2, Calendar, Link as LinkIcon, ArrowUp, MessageSquare } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TextShimmer } from '@/components/core/text-shimmer';
import Link from 'next/link';
import { FollowButton } from "@/components/FollowButton"
import { useSession } from 'next-auth/react';
import { getFollowStats } from "@/lib/actions/follow"
import { formatDistanceToNowStrict } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  createdAt: Date;
  _count: {
    votes: number;
    comments: number;
  }
}

interface ProfileData {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  github?: string;
  website?: string;
  twitter?: string;
  location?: string;
  currentRole?: string;
  company?: string;
  techStack?: string;
  yearsOfExperience?: string;
  lookingForWork: boolean;
  image?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
    createdAt: string;
  }>;
  followerCount: number
  isFollowing: boolean
  followingCount: number
  blogs: BlogPost[]
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LoadingState = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    "Gathering profile data...",
    "Analyzing with AI...",
    "Crafting developer story...",
    "Generating portfolio view..."
  ];

  const safeStep = Math.min(currentStep, steps.length - 1);

  return (
    <div className="w-full max-w-xl space-y-8 text-center">
      <motion.div
        key={steps[safeStep]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <TextShimmer 
          className="font-mono text-sm bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent" 
          duration={1.2}
        >
          {steps[safeStep]}
        </TextShimmer>
      </motion.div>
    </div>
  );
};

const UserNotFound = () => (
  <motion.div 
    className="text-center space-y-4"
    {...fadeIn}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
      <User2 className="w-8 h-8 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-medium">User Not Found</h2>
      <p className="text-sm text-muted-foreground">
        The profile you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="text-sm"
        >
          Return Home
        </Button>
      </div>
    </div>
  </motion.div>
);

const CreatePortfolioPrompt = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed bottom-6 right-6 max-w-xs z-50 bg-background/80 backdrop-blur-sm"
  >
    <div className="bg-card/80 p-4 rounded-lg border shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">✨</span>
        <p className="text-sm font-medium">Want your own portfolio?</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Create your AI-powered dev portfolio in minutes.
      </p>
      <Button
        size="sm"
        className="w-full text-xs bg-primary hover:bg-primary/90"
        onClick={() => window.location.href = '/auth/register'}
      >
        Create Portfolio
      </Button>
    </div>
  </motion.div>
);

const getFileExtension = (techStack: string) => {
  const tech = techStack.toLowerCase();
  if (tech.includes('typescript') || tech.includes('ts')) return 'ts';
  if (tech.includes('javascript') || tech.includes('js')) return 'js';
  if (tech.includes('python')) return 'py';
  if (tech.includes('rust')) return 'rs';
  if (tech.includes('go')) return 'go';
  return 'code';
};

const getCodeSnippet = (techStack: string, skills: string[]) => {
  const tech = techStack.toLowerCase();
  
  if (tech.includes('python')) {
    return {
      filename: 'skills.py',
      code: [
        'class Developer:',
        '    def __init__(self):',
        '        self.skills = [',
        ...skills.map(skill => `            "${skill.trim()}",`),
        '        ]',
        '',
        '    def get_skills(self):',
        '        return self.skills'
      ]
    };
  }

  if (tech.includes('rust')) {
    return {
      filename: 'skills.rs',
      code: [
        'struct Developer {',
        '    skills: Vec<&str>',
        '}',
        '',
        'impl Developer {',
        '    fn new() -> Self {',
        '        Self {',
        '            skills: vec![',
        ...skills.map(skill => `                "${skill.trim()}",`),
        '            ]',
        '        }',
        '    }',
        '}'
      ]
    };
  }

  // Default to TypeScript/JavaScript
  return {
    filename: `skills.${getFileExtension(techStack)}`,
    code: [
      'interface Developer {',
      '  skills: string[];',
      '}',
      '',
      'const developer: Developer = {',
      '  skills: [',
      ...skills.map(skill => `    "${skill.trim()}",`),
      '  ]',
      '};'
    ]
  };
};

const getTechStackArray = (techStack: unknown): string[] => {
  if (typeof techStack === 'string') {
    return techStack.split(',');
  }
  if (Array.isArray(techStack)) {
    return techStack;
  }
  return [];
};

const FloatingHeader = ({ profile }: { profile: ProfileData }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 50], [0, 1]);
  const scale = useTransform(scrollY, [0, 50], [0.8, 1]);
  const translateY = useTransform(scrollY, [0, 50], [-60, 0]);

  const hasContent = profile.bio || 
    profile.techStack || 
    (profile.resources?.length ?? 0) > 0 || 
    profile.yearsOfExperience;

  if (!hasContent) return null;

  const socialLinks = [
    profile.github && ({
      icon: <Github className="w-3.5 h-3.5" />,
      href: `https://github.com/${profile.github}`,
      label: 'GitHub'
    }),
    profile.website && ({
      icon: <Globe className="w-3.5 h-3.5" />,
      href: profile.website,
      label: 'Website'
    })
  ].filter((link): link is { icon: React.ReactElement; href: string; label: string } => Boolean(link));

  return (
    <motion.div
      style={{ opacity }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center"
    >
      <motion.div
        style={{ scale, translateY }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border shadow-sm"
      >
        {profile.image && (
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={profile.image}
              alt={profile.name}
            />
            <AvatarFallback className="text-xs">
              {profile.name?.charAt(0).toUpperCase() || <User2 className="w-3 h-3" />}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{profile.name}</span>
          {profile.currentRole && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              · {profile.currentRole}
            </span>
          )}
        </div>

        {(socialLinks.length > 0 || profile.lookingForWork) && (
          <div className="flex items-center gap-2 ml-2 border-l pl-2 border-border/50">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
            {profile.lookingForWork && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full whitespace-nowrap">
                Available
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const PopularPosts = ({ posts }: { posts: BlogPost[] }) => {
  if (!posts.length) return null;

  return (
    <motion.div variants={fadeIn} className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Popular Posts</h2>
      <div className="grid gap-4">
        {posts.map(post => (
          <Link 
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block space-y-1.5 rounded-lg border bg-card/50 p-4 hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-medium group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            {post.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.summary}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5" />
                {post._count.votes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post._count.comments}
              </span>
              <time dateTime={new Date(post.createdAt).toISOString()}>
                {formatDistanceToNowStrict(new Date(post.createdAt))} ago
              </time>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

const NarrativePortfolio = () => {
  const params = useParams();
  const username = params.username as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const session = useSession();

  useEffect(() => {
    if (!isLoading || currentStep >= 3) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, currentStep]);

  const generateNarrativeBio = (profileData: ProfileData): string => {
    if (!profileData) return '';
    
    const templates = [
      `${profileData.bio}`,
      profileData.lookingForWork ? "Open to new opportunities." : ''
    ].filter(Boolean).join(' ');

    return templates;
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setLoadingComplete(false);
      setCurrentStep(0);
      
      const response = await fetch(`/api/generate-portfolio/${username}`);
      
      if (response.status === 404) {
        setError('not_found');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      
      setProfile({
        ...userData.profile,
        followerCount: userData.profile.followerCount,
        followingCount: userData.profile.followingCount,
        isFollowing: userData.profile.isFollowing,
        blogs: userData.profile.blogs || []
      });
      setIsOwner(userData.profile.isOwner);
      
      setTimeout(() => {
        setLoadingComplete(true);
        setIsLoading(false);
      }, 4000);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update the follower update effect
  useEffect(() => {
    const channel = new BroadcastChannel('follower-update');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'FOLLOWER_UPDATE') {
        // Just update the follower count and following state
        setProfile(prev => prev ? {
          ...prev,
          followerCount: event.data.count,
          isFollowing: event.data.isFollowing
        } : null);
      }
    };

    return () => channel.close();
  }, []);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await fetchProfile();
    setIsGenerating(false);
  };

  if (error === 'not_found') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <UserNotFound />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div 
          className="text-destructive text-sm rounded-lg"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  if (isLoading || !loadingComplete) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState currentStep={currentStep} />
      </div>
    );
  }

  if (!profile || Object.keys(profile).every(key => !profile[key as keyof ProfileData])) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <UserNotFound />
      </div>
    );
  }

  return (
    <>
      {profile && <FloatingHeader profile={profile} />}
      <motion.main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={stagger}
        className="min-h-[50vh] flex items-center justify-center py-8 px-4"
      >
        <div className="w-full max-w-xl">
          <motion.header variants={fadeIn} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
              <Avatar className="w-20 h-20 border-2 border-muted self-center sm:self-start">
                <AvatarImage
                  src={profile.image || ''}
                  alt={profile.name}
                />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0).toUpperCase() || <User2 />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                  {profile.lookingForWork && (
                    <span className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full self-center sm:self-start whitespace-nowrap">
                      Open to opportunities
                    </span>
                  )}
                </div>
                {profile.currentRole && (
                  <p className="text-sm text-muted-foreground">
                    {profile.currentRole}
                    {profile.company && <span> @ {profile.company}</span>}
                  </p>
                )}
                {profile.location && (
                  <p className="text-xs text-muted-foreground">
                    {profile.location}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground font-medium">{profile.followerCount.toLocaleString()}</strong>
                      {' '}
                      {profile.followerCount === 1 ? 'follower' : 'followers'}
                    </span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground font-medium">{profile.followingCount.toLocaleString()}</strong>
                      {' '}
                      following
                    </span>
                  </div>
                  {!isOwner && session?.data?.user && (
                    <FollowButton 
                      username={profile.username!}
                      isFollowing={profile.isFollowing}
                      followerCount={profile.followerCount}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {profile.bio && (
            <motion.div 
              variants={fadeIn}
              className="prose prose-zinc dark:prose-invert mb-8 max-w-none"
            >
              <div className="text-sm leading-relaxed space-y-4">
                <div className="font-mono text-xs text-muted-foreground">
                  {/* console.log("Welcome to my digital space! 👋") */}
                </div>
                <p className="bg-muted/30 p-4 rounded-lg backdrop-blur-sm">
            {isGenerating ? (
                    <TextShimmer className="font-mono text-sm" duration={2}>
                      Regenerating bio...
                    </TextShimmer>
            ) : (
                    profile.bio
            )}
          </p>
                {profile.techStack && (
                  <div className="font-mono text-xs rounded-lg bg-[#1e1e1e] p-3 border border-zinc-800 shadow-xl overflow-hidden">
                    <div className="flex items-center gap-3 text-muted-foreground/60 mb-2 pb-2 border-b border-zinc-800">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      {(() => {
                        const techStackArray = getTechStackArray(profile.techStack);
                        const { filename } = getCodeSnippet(
                          typeof profile.techStack === 'string' ? profile.techStack : '',
                          techStackArray
                        );
                        return (
                          <span className="text-[10px] opacity-70">{filename}</span>
                        );
                      })()}
                    </div>
                    <div className="space-y-0.5 font-mono text-[12px] leading-5">
                      {(() => {
                        const techStackArray = getTechStackArray(profile.techStack);
                        const { code } = getCodeSnippet(
                          typeof profile.techStack === 'string' ? profile.techStack : '',
                          techStackArray
                        );
                        return code.map((line, index) => (
                          <div key={index} className="flex">
                            <span className="w-6 text-zinc-600 text-right pr-2 select-none text-[10px]">{index + 1}</span>
                            <span className="flex-1 pl-2 border-l border-zinc-800">
                              {line.includes('interface') && <span className="text-purple-400">interface </span>}
                              {line.includes('class') && <span className="text-purple-400">class </span>}
                              {line.includes('struct') && <span className="text-purple-400">struct </span>}
                              {line.includes('impl') && <span className="text-purple-400">impl </span>}
                              {line.includes('const') && <span className="text-blue-400">const </span>}
                              {line.includes('skills:') && <span className="text-blue-300">skills</span>}
                              {line.includes('"') && <span className="text-green-400">{line}</span>}
                              {!line.includes('"') && !line.includes('interface') && 
                               !line.includes('class') && !line.includes('struct') && 
                               !line.includes('impl') && !line.includes('const') && 
                               !line.includes('skills:') && 
                               <span className="text-zinc-400">{line}</span>}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {profile.blogs && profile.blogs.length > 0 && (
            <PopularPosts posts={profile.blogs} />
          )}

          {profile.yearsOfExperience && (
            <motion.div variants={fadeIn} className="mb-8">
              <h2 className="text-sm font-medium mb-2">Experience</h2>
              <p className="text-sm text-muted-foreground">
                {profile.yearsOfExperience} years of experience
              </p>
            </motion.div>
          )}

          {profile.resources && profile.resources.length > 0 && (
            <motion.div variants={fadeIn} className="mb-8">
              <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Resources
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {resource.type}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
        </div>
            </motion.div>
          )}

          {(profile.github || profile.website || profile.twitter || profile.email) && (
            <motion.div variants={fadeIn} className="flex flex-wrap gap-3 mb-8">
          {profile.github && (
            <a 
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              
              {profile.website && (
                <a 
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Website</span>
                </a>
              )}

              {profile.twitter && (
                <a 
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-3.5 w-3.5" />
                  <span>Twitter</span>
            </a>
          )}
          
              {profile.email && (
          <a 
            href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
          </a>
              )}
            </motion.div>
          )}

          {isOwner && (
            <motion.div variants={fadeIn}>
          <Button
                variant="ghost"
                size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
                className="text-xs text-muted-foreground hover:text-foreground"
          >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Regenerate Bio'}
          </Button>
            </motion.div>
          )}
        </div>
      </motion.main>
      
      {!session?.data?.user && <CreatePortfolioPrompt />}
    </>
  );
};

export default NarrativePortfolio;