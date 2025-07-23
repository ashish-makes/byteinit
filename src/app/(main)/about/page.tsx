"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { 
  Code,
  Lightbulb, 
  Share2, 
  Users,
  ArrowRight,
  Terminal,
  Github,
  FileCode,
  Globe,
  Zap,
  BookOpen,
  Bookmark,
  Heart,
  MessageSquare,
  Rocket,
  CheckCircle2,
  Star,
  TrendingUp,
  Target,
  Eye,
  ArrowUpRight,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink,
  Lock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Marquee from "@/components/magicui/marquee";
// Import new components
import { ComparisonRow, PartnerCard, IntegrationCategory } from './components';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Platform features
const features = [
  {
    icon: <FileCode className="h-6 w-6" />,
    title: "Resource Discovery",
    description: "Find curated developer resources organized by categories and community ratings.",
    image: "/features/resource-discovery.jpg"
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Developer Blog",
    description: "Technical articles with syntax highlighting and executable code examples.",
    image: "/features/developer-blog.jpg"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Professional Portfolios",
    description: "Custom profile pages to showcase your projects and contributions.",
    image: "/features/portfolios.jpg"
  },
  {
    icon: <Bookmark className="h-6 w-6" />,
    title: "Collections",
    description: "Organize resources in personal collections with tags and search.",
    image: "/features/collections.jpg"
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Engagement",
    description: "Like, comment, and share valuable content with the community.",
    image: "/features/engagement.jpg"
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Career Growth",
    description: "Discover opportunities and connect with like-minded developers.",
    image: "/features/career-growth.jpg"
  }
];

// Platform stats
const stats = [
  { value: "10K+", label: "Active Developers" },
  { value: "5K+", label: "Resources Shared" },
  { value: "2K+", label: "Blog Posts" },
  { value: "500+", label: "Portfolios Created" }
];

// Code snippets for floating elements
const codeSnippets = [
  "const dev = new Developer();",
  "function connect() { return community; }",
  "import { resources } from 'byteinit';",
  "const profile = await getPortfolio(userId);",
  "export default function DevResource() { ... }",
  "<ResourceCard featured={true} />",
  "const { data, loading } = useResources();",
  "addEventListener('inspiration', handleIdea);"
];

// Fixed positions for code snippets that don't interfere with content
const snippetPositions = [
  { top: '5%', left: '5%', rotate: '8deg' },
  { top: '70%', left: '3%', rotate: '-5deg' },
  { top: '12%', left: '90%', rotate: '-8deg' },
  { top: '75%', left: '92%', rotate: '5deg' },
  { top: '20%', left: '25%', rotate: '-3deg' },
  { top: '80%', left: '30%', rotate: '6deg' },
  { top: '25%', left: '75%', rotate: '-6deg' },
  { top: '80%', left: '70%', rotate: '4deg' }
];

// Define components for new sections
const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-with-border-effect group relative bg-card hover:bg-card/90 rounded-2xl transition-all duration-300 border border-border/30 cursor-pointer overflow-hidden"
    >
      {/* Feature Image */}
      <div className="relative w-full h-40 bg-muted/40 overflow-hidden">
        {feature.image ? (
          <Image 
            src={feature.image}
            alt={feature.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
            <div className="p-3 rounded-xl bg-background/80 text-primary">
              {feature.icon}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{feature.title}</h3>
          <Badge variant="secondary" className="text-xs rounded-full px-3 py-0.5">
            {feature.stats}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const BenefitCard = ({ benefit, index }: { benefit: any, index: number }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-with-border-effect flex items-start space-x-4 p-4 rounded-xl hover:bg-card/60 transition-colors duration-300"
    >
      <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
        {benefit.icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1 text-base">{benefit.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial, index }: { testimonial: any, index: number }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-with-border-effect bg-card rounded-xl p-5 border border-border/30 transition-all duration-300"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="rounded-full overflow-hidden ring-1 ring-primary/10">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{testimonial.name}</h4>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed italic">{testimonial.content}</p>
    </motion.div>
  );
};

const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-with-border-effect flex items-center justify-center space-x-4 p-5 bg-card rounded-xl border border-border/30 transition-all duration-300"
    >
      <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
        {stat.icon}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{stat.value}</div>
        <div className="text-xs text-muted-foreground">{stat.label}</div>
      </div>
    </motion.div>
  );
};

// Platform features with stats
const newFeatures = [
  {
    icon: <FileCode className="h-6 w-6" />,
    title: "Resource Discovery",
    description: "Find curated developer resources organized by categories and community ratings.",
    stats: "10K+ Resources",
    image: "/features/resource-discovery.jpg"
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Developer Blog",
    description: "Technical articles with syntax highlighting and executable code examples.",
    stats: "500+ Articles",
    image: "/features/developer-blog.jpg"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Professional Portfolios",
    description: "Custom profile pages to showcase your projects and contributions.",
    stats: "2K+ Portfolios",
    image: "/features/portfolios.jpg"
  },
  {
    icon: <Bookmark className="h-6 w-6" />,
    title: "Collections",
    description: "Organize resources in personal collections with tags and search.",
    stats: "5K+ Collections",
    image: "/features/collections.jpg"
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Engagement",
    description: "Like, comment, and share valuable content with the community.",
    stats: "50K+ Interactions",
    image: "/features/engagement.jpg"
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Career Growth",
    description: "Discover opportunities and connect with like-minded developers.",
    stats: "1K+ Opportunities",
    image: "/features/career-growth.jpg"
  }
];

const benefits = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community-Driven",
    description: "Join a thriving community of developers sharing knowledge and experiences."
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "Developer-First",
    description: "Built by developers for developers, with features you'll actually use."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Always Evolving",
    description: "Regular updates and new features based on community feedback."
  }
];

const testimonials = [
  {
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Sarah Chen",
    role: "Senior Developer",
    content: "ByteInit has transformed how I discover and share development resources. The community is incredibly supportive."
  },
  {
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Michael Rodriguez",
    role: "Full Stack Engineer",
    content: "The quality of resources and discussions here is outstanding. It's become my go-to platform for staying updated."
  },
  {
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Emily Taylor",
    role: "DevOps Engineer",
    content: "The portfolio features helped me showcase my work and land my dream job. Highly recommended!"
  }
];

// Update the platformStats array with more realistic numbers for a new platform
const platformStats = [
  { 
    icon: <Users className="h-5 w-5" />, 
    label: "Early Adopters", 
    value: "512", 
    animatedValue: 512,
    description: "Growing our community of developers",
    video: "/videos/community.mp4",
    chartData: [120, 155, 190, 215, 240, 280, 310, 350, 410, 450, 485, 512] // Accelerating growth
  },
  { 
    icon: <FileCode className="h-5 w-5" />, 
    label: "Resources", 
    value: "342", 
    animatedValue: 342,
    description: "Curated development resources",
    video: "/videos/community.mp4",
    chartData: [40, 70, 110, 160, 220, 250, 280, 290, 310, 325, 335, 342] // Quick rise then plateau
  },
  { 
    icon: <BookOpen className="h-5 w-5" />, 
    label: "Blog Posts", 
    value: "48", 
    animatedValue: 48,
    description: "Technical articles with code examples",
    video: "/videos/community.mp4",
    chartData: [8, 10, 14, 14, 18, 20, 28, 30, 35, 40, 44, 48] // Steady growth
  },
  { 
    icon: <Star className="h-5 w-5" />, 
    label: "Beta Rating", 
    value: "4.8/5", 
    animatedValue: 4.8,
    description: "From our beta testers",
    video: "/videos/community.mp4",
    chartData: [3.5, 3.8, 4.0, 4.2, 4.3, 4.5, 4.5, 4.6, 4.7, 4.7, 4.8, 4.8] // Gradual improvement
  }
];

const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    if (inView) {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, inView]);
  
  return <span ref={ref}>{count}</span>;
};

// Create context for sharing state between components
type StatsContextType = {
  activeStatIndex: number;
  setActiveStatIndex: (index: number) => void;
};

const StatsContext = React.createContext<StatsContextType | undefined>(undefined);

const StatsProvider = ({ children, value }: { children: React.ReactNode, value: StatsContextType }) => {
  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

const useStatsContext = () => {
  const context = React.useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStatsContext must be used within a StatsProvider');
  }
  return context;
};

// New components for the interactive stats section
const StatsSelector = () => {
  const { activeStatIndex, setActiveStatIndex } = useStatsContext();
  
  // Random growth percentages for the trend indicators
  const trendData = useMemo(() => {
    return platformStats.map(() => {
      const value = Math.random() * 30;
      return {
        value: Math.round(value * 10) / 10,
        isPositive: Math.random() > 0.2, // 80% chance of positive trend
      };
    });
  }, []);
  
  return (
    <div className="space-y-2 md:space-y-2.5">
      {platformStats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={cn(
            "card-with-border-effect p-2 sm:p-2.5 md:p-3 rounded-lg cursor-pointer transition-all duration-300",
            "border border-border/30 hover:border-border/60",
            "flex items-start space-x-2 sm:space-x-3 hover:scale-[1.01]",
            activeStatIndex === index 
              ? "bg-primary/5 border-primary/20" 
              : "hover:bg-card/80"
          )}
          onClick={() => setActiveStatIndex(index)}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
            {stat.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-0.5">
              <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
                {stat.animatedValue ? (
                  <>{activeStatIndex === index ? (
                    <CountUp end={stat.animatedValue} duration={1500} />
                  ) : stat.animatedValue}
                  {stat.value.includes('+') ? '+' : ''}</>
                ) : (
                  stat.value
                )}
              </h3>
              
              {/* Trend indicator */}
              <div className={cn(
                "text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5 rounded-full flex items-center ml-1",
                trendData[index].isPositive 
                  ? "text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                  : "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10"
              )}>
                {trendData[index].isPositive ? (
                  <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                ) : (
                  <ArrowUpRight className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 rotate-180" />
                )}
                {trendData[index].value}%
              </div>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-foreground mb-0.5 flex items-center truncate">
              {stat.label}
              <span className="ml-1.5 p-0.5 rounded-full bg-muted/50 hover:bg-muted cursor-help" title={`${stat.description} - Updated daily from platform analytics.`}>
                <Eye className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground" />
              </span>
            </p>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
              {stat.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const StatsVideo = () => {
  const { activeStatIndex } = useStatsContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // When the active stat changes, reload the video to restart it
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(error => {
        console.log("Video autoplay prevented:", error);
      });
    }
  }, [activeStatIndex]);

  // Handle video error state - show placeholder if video fails to load
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleVideoError = () => {
    console.log("Video failed to load");
    setVideoError(true);
    setIsLoading(false);
  };
  
  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  return (
    <motion.div 
      key={activeStatIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 w-full h-full bg-muted/10"
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="h-8 w-8 rounded-full border-2 border-t-primary/80 border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
        </div>
      )}
      
      {!videoError ? (
        <video 
          ref={videoRef}
          src={platformStats[activeStatIndex].video}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          className="h-full w-full object-cover object-center transition-all duration-500"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />
      ) : (
        // Placeholder when video can't be loaded
        <div className="h-full w-full flex items-center justify-center bg-muted/20">
          <div className="text-center p-4">
            <FileCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">Visualization data loading...</p>
            <button 
              className="mt-3 px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              onClick={() => {
                setVideoError(false);
                setIsLoading(true);
                // Try to reload the video
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {
                      setVideoError(true);
                      setIsLoading(false);
                    });
                  }
                }, 500);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Removed scrollbar simulation and HUD elements */}
    </motion.div>
  );
};

// Browser toolbar component that has access to context
const BrowserToolbar = () => {
  const { activeStatIndex } = useStatsContext();
  const currentStat = platformStats[activeStatIndex];
  const formattedLabel = currentStat.label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border-b border-border/30 bg-muted/30 flex items-center justify-between">
      <div className="flex space-x-1 sm:space-x-1.5">
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
      </div>
      
      {/* URL bar - simplified */}
      <div className="flex-1 mx-2 sm:mx-3 md:mx-4 px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs bg-background/60 backdrop-blur-sm text-muted-foreground truncate font-mono flex items-center">
        <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-muted-foreground/50">
          <Lock className="w-2 h-2 sm:w-3 sm:h-3" />
        </div>
        byteinit.dev/metrics/{formattedLabel}
      </div>
      
      {/* Removed extra buttons */}
    </div>
  );
};

const AboutPage = () => {
  // Theme hook
  const { theme } = useTheme();
  
  // Add the activeStatIndex state here
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  
  // References for animations
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const snippetsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // References for the feature panels
  const featurePanelsRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse movement for magnetic effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Apply magnetic effect to code snippets
  useEffect(() => {
    if (typeof window === 'undefined' || !snippetsRef.current.length) return;
    
    snippetsRef.current.forEach((snippet) => {
      if (!snippet) return;
      
      const rect = snippet.getBoundingClientRect();
      const snippetCenterX = rect.left + rect.width / 2;
      const snippetCenterY = rect.top + rect.height / 2;
      
      // Calculate distance between mouse and snippet
      const distanceX = mousePosition.x - snippetCenterX;
      const distanceY = mousePosition.y - snippetCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Magnetic effect range (in pixels)
      const magneticRange = 300;
      
      if (distance < magneticRange) {
        // Calculate movement strength based on distance (closer = stronger)
        const strength = 0.3; // Max movement factor
        const factor = strength * (1 - (distance / magneticRange));
        
        // Move snippet towards mouse
        gsap.to(snippet, {
          x: distanceX * factor,
          y: distanceY * factor,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Return to original position
        gsap.to(snippet, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
        });
      }
    });
  }, [mousePosition]);
  
  // Initialize animations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Hero image animation - modified to include initial tilt
    gsap.fromTo(
      '.hero-image-container',
      { 
        opacity: 0, 
        y: 20,
        rotateX: 20, // Initial backward tilt
        transformPerspective: 1000, 
        transformOrigin: 'bottom center' 
      },
      { 
          opacity: 1,
        y: 0, 
          duration: 0.8,
        delay: 0.3,
        ease: 'power2.out'
        // Keep the rotateX at 20 degrees initially
      }
    );

    // Add scroll animation to straighten the image
    ScrollTrigger.create({
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom 30%',
      pin: true,
      pinSpacing: true,
      scrub: true, // Smooth animation tied to scroll position
      onUpdate: (self) => {
        // Animate from tilted to straight as user scrolls
        gsap.to('.hero-image-container', {
          rotateX: 20 - (self.progress * 20), // From 20 degrees to 0 degrees
          y: -40 + (self.progress * 40), // Start closer to text (-40px) and move down as it straightens
          duration: 0,
          ease: 'none',
        });
      },
      onLeave: (self) => {
        // Make sure image is fully straight before leaving
        gsap.to('.hero-image-container', {
          rotateX: 0,
          y: 0, // Ensure it's back to normal position
          duration: 0.3,
        });
      }
    });
    
    // Code snippets animation
    gsap.fromTo(
      '.code-snippet',
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 0.3, 
          scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power1.out'
      }
    );

    // Set up basic scroll trigger animations
    ScrollTrigger.batch('.fade-in', {
      onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.15}),
      start: 'top 85%',
    });
    
    // Add heading animations
    const headings = document.querySelectorAll('.heading-animate');
    headings.forEach(heading => {
      // Get the original text
      const originalText = heading.textContent || '';
      heading.textContent = '';
      
      // Create a wrapper for the words
      const wrapper = document.createElement('div');
      wrapper.style.display = 'inline-block';
      wrapper.style.width = '100%';
      
      // Split text into words and add each with proper spacing
      const words = originalText.trim().split(/\s+/);
      words.forEach((word, index) => {
        // Create span for the word
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.style.display = 'inline-block';
        wordSpan.style.opacity = '0';
        wordSpan.style.transform = 'translateY(2rem)';
        wrapper.appendChild(wordSpan);
        
        // Add space after word (except last word)
        if (index < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.innerHTML = '&nbsp;';
          spaceSpan.style.display = 'inline-block';
          wrapper.appendChild(spaceSpan);
        }
      });
      
      heading.appendChild(wrapper);
      
      // Create a scroll trigger for this heading
      ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          // Only animate the word spans, not the space spans
          gsap.to(wrapper.querySelectorAll('span'), {
            opacity: (i, el) => el.textContent === '\u00A0' ? 1 : 1, // Full opacity for words
            y: 0,
            duration: 0.7,
            stagger: (i, el) => el.textContent === '\u00A0' ? 0 : 0.1, // Only stagger actual words
            ease: 'power2.out'
          });
        }
      });
    });
    
    // Features scrolling animation
    if (featurePanelsRef.current) {
      // Create a timeline for each feature
      const featurePanels = featurePanelsRef.current.querySelectorAll('.feature-panel');
      
      // Create a master timeline for the features
      const featuresTl = gsap.timeline({
          scrollTrigger: {
          trigger: ".features-scroll-section",
          start: "top top",
          end: `+=${featurePanels.length * 100}vh`, // One viewport height per feature
          pin: true,
          anticipatePin: 1,
          scrub: 0.5,
          pinSpacing: true,
          markers: false,
          id: "features-main"
        }
      });
      
      // Hide all panels initially except the first one
      featurePanels.forEach((panel, i) => {
        if (i !== 0) {
          gsap.set(panel, { autoAlpha: 0, y: 50 });
        }
      });
      
      // Add each panel animation to the timeline
      featurePanels.forEach((panel, i) => {
        // Skip first panel (already visible)
        if (i === 0) return;
        
        // Add to timeline at specific progress point
        const progress = i / featurePanels.length;
        
        // Fade in current panel
        featuresTl.to(panel, {
          autoAlpha: 1, 
          y: 0,
          duration: 0.1,
          ease: "power2.out"
        }, progress - 0.1);
        
        // Fade out previous panel (if not the first one)
        if (i > 0) {
          featuresTl.to(featurePanels[i-1], {
            autoAlpha: 0,
            y: -50,
            duration: 0.1
          }, progress - 0.1);
        }
    });
    
    return () => {
        if (featuresTl.scrollTrigger) featuresTl.scrollTrigger.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Reset snippets ref when component updates
  useEffect(() => {
    snippetsRef.current = snippetsRef.current.slice(0, codeSnippets.length);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Update CSS for card effects */}
      <style jsx global>{`
        .card-with-border-effect {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease-in-out;
        }
        
        .card-with-border-effect:hover {
          transform: translateY(-2px);
        }
        
        .card-with-border-effect::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px; /* Border width */
          background: linear-gradient(90deg, 
            var(--primary) 0%, 
            var(--primary-foreground) 25%, 
            var(--primary) 50%, 
            var(--primary-foreground) 75%, 
            var(--primary) 100%
          );
          background-size: 300% 100%;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .card-with-border-effect:hover::after {
          opacity: 1;
          animation: border-trail 4s linear infinite;
        }
        
        @keyframes border-trail {
          0% { background-position: 0% 0; }
          100% { background-position: 300% 0; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0.3; transform: scaleY(0.8); }
          100% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>

      {/* Hero Section with Mission Statement */}
      <section 
        ref={heroRef}
        className="hero-section relative min-h-[90vh] flex flex-col items-center justify-start pt-28 px-4 overflow-hidden"
      >
        {/* Static background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"></div>
        
        {/* Floating code snippets */}
        {codeSnippets.map((snippet, index) => (
          <div 
            key={index}
            ref={(el: HTMLDivElement | null) => { snippetsRef.current[index] = el; }}
            className="code-snippet absolute pointer-events-none"
            style={{
              top: snippetPositions[index].top,
              left: snippetPositions[index].left,
              transform: `rotate(${snippetPositions[index].rotate})`,
              zIndex: 1,
              maxWidth: '220px',
              opacity: 0
            }}
          >
            <div className="rounded-lg bg-card/80 p-3 border border-border/40 shadow-sm">
              <pre className="text-xs text-muted-foreground/70">{snippet}</pre>
          </div>
        </div>
        ))}
        
        {/* Hero content */}
        <div className="text-center z-10 px-4 sm:px-6 mb-0">
          <Badge className="mb-3 rounded-full px-3 py-1 text-xs" variant="secondary">Our Mission</Badge>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 heading-animate">
            Developer platform for discovery & growth
              </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mx-auto mb-0 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            We're building the most comprehensive platform for developers to discover resources, share knowledge, and build their digital presence.
          </p>
        </div>
        
        {/* Platform Image - modified to support 3D perspective */}
        <div 
          ref={imageContainerRef}
          className="hero-image-container relative w-full max-w-5xl mx-auto mt-8 rounded-t-2xl overflow-hidden z-10" 
          style={{
            opacity: 0,
            transform: 'rotateX(20deg)', // Initial tilt
            transformOrigin: 'bottom center',
            perspective: '1000px'
          }}
        >
          <div className="relative aspect-[16/9] w-full">
            {/* Responsive image based on theme */}
            <div className="absolute inset-0 rounded-t-2xl overflow-hidden">
              {/* Image for light mode */}
              <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-300">
                <Image 
                  src="/platform-light.png" 
                  alt="ByteInit platform interface - light mode"
                  fill
                  className="object-cover object-top"
                  priority
                />
                </div>
              
              {/* Image for dark mode */}
              <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-300">
                <Image 
                  src="/platform-dark.png" 
                  alt="ByteInit platform interface - dark mode"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
            
            {/* Fade out gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10"></div>
            </div>
        </div>
      </section>

      {/* Origin Story Section - Redesigned */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <Badge className="mb-3 text-xs rounded-full px-3 py-1 bg-background border-zinc-200 dark:border-zinc-800" variant="outline">Origin Story</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-4xl font-bold text-center max-w-xl"
            >
              The journey of ByteInit
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-center mt-3 max-w-lg font-mono text-sm"
            >
              /* from console.log('hello world') to production */
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left column - Core story */}
            <div className="space-y-6">
              <motion.div 
                className="prose prose-sm dark:prose-invert max-w-none"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-4">function buildPlatform(problem) &#123;</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  As a developer searching for high-quality learning resources, I found myself constantly jumping between dozens of websites, communities, and platforms. There was no single hub for discovering vetted content, sharing knowledge, and building a developer presence.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  ByteInit was born from this need—a platform where developers can find curated resources, showcase their work, and connect with others on the same journey, all in one place.
                </p>
                <p className="text-muted-foreground leading-relaxed font-mono text-sm mt-4">
                  return solution; &#125;
                </p>
              </motion.div>

              {/* Timeline */}
              <div className="border-l border-zinc-200 dark:border-zinc-800 pl-6 pt-6 space-y-10">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="absolute -left-10 mt-1">
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"></div>
                </div>
              </div>
                  <h4 className="text-base font-medium mb-1">2023 — <span className="font-mono">init</span></h4>
                  <p className="text-sm text-muted-foreground">
                    First commit with resource discovery and basic profiles for 100 early adopters
                  </p>
                </motion.div>
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="absolute -left-10 mt-1">
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"></div>
          </div>
        </div>
                  <h4 className="text-base font-medium mb-1">2024 — <span className="font-mono">npm run dev</span></h4>
                  <p className="text-sm text-muted-foreground">
                    Added developer blog, collections, and expanded to 10,000+ users
                  </p>
                </motion.div>
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="absolute -left-10 mt-1">
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"></div>
                    </div>
                  </div>
                  <h4 className="text-base font-medium mb-1">2025 — <span className="font-mono">npm run build</span></h4>
                  <p className="text-sm text-muted-foreground">
                    Introduced professional portfolios and community engagement features
                  </p>
                </motion.div>
              </div>
          </div>

            {/* Right column - Stats and visual with animations */}
            <div className="space-y-10">
              {/* Project stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-5 font-mono">const metrics = &#123;</h3>
                <div className="grid grid-cols-3 gap-4">
                  <motion.div 
                    className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold mb-1">156</div>
                    <div className="text-xs text-muted-foreground">commits</div>
                  </motion.div>
                  <motion.div 
                    className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold mb-1">42</div>
                    <div className="text-xs text-muted-foreground">features</div>
                  </motion.div>
                  <motion.div 
                    className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <div className="text-2xl font-bold mb-1">3.2k</div>
                    <div className="text-xs text-muted-foreground">users</div>
                  </motion.div>
                </div>
                <p className="text-right text-xs font-mono text-muted-foreground mt-2">&#125;;</p>
              </motion.div>
              
              {/* Key aspects */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-3 font-mono">class CorePrinciples &#123;</h3>
                
                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Code className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">soloDevProject = true;</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Designed, developed, and maintained by a single passionate developer
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Github className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">isOpenSource = true;</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Built in public with transparent development and community feedback
                    </p>
                </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="h-3.5 w-3.5" />
          </div>
                  <div>
                    <h4 className="text-sm font-medium">userFirst = true;</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every feature is designed to serve real developer needs
                    </p>
        </div>
                </motion.div>
                <p className="text-right text-xs font-mono text-muted-foreground mt-1">&#125;</p>
              </motion.div>
              
              {/* Version badge */}
              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge variant="outline" className="text-xs font-mono rounded-full px-3 py-1">
                  git tag -a v2.5.0 -m "stable release"
            </Badge>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Enhanced Readability */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-14">
            <Badge className="mb-3 text-xs rounded-full px-3 py-1 bg-background border-zinc-200 dark:border-zinc-800" variant="outline">Mission & Vision</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-4xl font-bold text-center max-w-xl"
            >
              What drives us forward
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-center mt-3 max-w-lg font-mono text-sm"
            >
              /* we fix the bugs others call features */
            </motion.p>
          </div>

          {/* Mission Section - Clean Black and White */}
          <div className="mb-24">
            <div className="grid md:grid-cols-2 items-center gap-12">
              {/* Left: Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-xs uppercase tracking-wider font-medium mb-2 inline-block">Our Mission</span>
                  <h3 className="text-2xl font-semibold mb-4 leading-tight">Unify the developer experience</h3>
                  
                  <p className="text-muted-foreground">
                    One platform to rule them all. No more tab overload syndrome or "where was that resource again?" moments.
                  </p>
                </motion.div>
                
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
                    <div>
                      <h4 className="text-sm font-medium">Resources.filter(r {'=>'} r.isActuallyUseful)</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Quality over quantity. No more "10,000 resources you'll never use".</p>
                    </div>
                  </motion.div>
                    
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">try &#123; askQuestion() &#125; catch &#123; noJudgment &#125;</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">The helpfulness of Stack Overflow without the judgment.</p>
                    </div>
                  </motion.div>
                </div>
                  </div>
                  
              {/* Right: Image */}
              <div className="relative h-full aspect-square md:aspect-auto md:min-h-[480px]">
                {/* Image container */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image 
                    src="/mission-illustration.jpg" 
                    alt="Developer collaboration"
                    fill
                    className="object-cover object-center grayscale"
                    priority
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Static gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                    
                    {/* Animated marquee overlay */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Marquee 
                        className="absolute bottom-0 h-1/2 w-full" 
                        vertical 
                        reverse 
                        pauseOnHover={false}
                        repeat={1}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-background/80 to-transparent opacity-40"></div>
                        <div className="h-full w-full bg-gradient-to-b from-background/80 to-transparent opacity-40"></div>
                      </Marquee>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vision Section - Reversed layout */}
                      <div>
            <div className="grid md:grid-cols-2 items-center gap-12">
              {/* Left: Image (reversed order) */}
              <div className="relative h-full aspect-square md:aspect-auto md:min-h-[480px] order-2 md:order-1">
                {/* Image container */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image 
                    src="/developer-home.jpg" 
                    alt="Future of development"
                    fill
                    className="object-cover object-center grayscale"
                    priority
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Static gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                    
                    {/* Animated marquee overlay */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Marquee 
                        className="absolute bottom-0 h-1/2 w-full" 
                        vertical 
                        reverse 
                        pauseOnHover={false}
                        repeat={1}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-background/80 to-transparent opacity-40"></div>
                        <div className="h-full w-full bg-gradient-to-b from-background/80 to-transparent opacity-40"></div>
                      </Marquee>
                    </div>
                  </div>
                      </div>
                    </div>
                    
              {/* Right: Content */}
              <div className="space-y-8 order-1 md:order-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-xs uppercase tracking-wider font-medium mb-2 inline-block">Our Vision</span>
                  <h3 className="text-2xl font-semibold mb-4 leading-tight">The digital home for developers</h3>
                  
                  <p className="text-muted-foreground">
                    Where developers can finally answer "So, what do you actually do?" with a simple link.
                  </p>
                </motion.div>
                
                <div className="space-y-4">
                  <motion.h4 
                    className="text-sm font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    export const goals = &#123;
                  </motion.h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.div 
                      className="bg-zinc-50 dark:bg-zinc-900 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <h5 className="text-xs font-medium mb-1">search: &#123;</h5>
                      <p className="text-xs text-muted-foreground">One search to rule them all &#125;</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-zinc-50 dark:bg-zinc-900 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <h5 className="text-xs font-medium mb-1">community: &#123;</h5>
                      <p className="text-xs text-muted-foreground">Error messages that make sense &#125;</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-zinc-50 dark:bg-zinc-900 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <h5 className="text-xs font-medium mb-1">portfolio: &#123;</h5>
                      <p className="text-xs text-muted-foreground">More impressive than a GitHub streak &#125;</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-zinc-50 dark:bg-zinc-900 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <h5 className="text-xs font-medium mb-1">growth: &#123;</h5>
                      <p className="text-xs text-muted-foreground">Where imposter syndrome comes to die &#125;</p>
                    </motion.div>
                    </div>
                  </div>
              </div>
          </div>
            </div>
            
          {/* Bottom text message */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <p className="font-mono text-xs text-muted-foreground">
              $ git commit -m "Fix developer experience" -d "Since 1970-01-01T00:00:00Z"<br />
              <span className="text-red-500 dark:text-red-400">Error: time_travel module not found. Still working on it...</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Comparison Section - Completely Redesigned as Terminal/Code Editor */}
      <section className="py-24 bg-zinc-950 dark:bg-zinc-950 bg-white/90 border-t border-border/10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <Badge className="mb-2 text-xs rounded-full px-3 py-1 bg-muted border-border" variant="outline">Comparison</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-3xl font-bold text-center text-foreground"
            >
              Platform Comparison
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-center mt-3 max-w-xl"
            >
              How ByteInit compares to traditional content platforms
            </motion.p>
            </div>
            
          {/* Terminal UI */}
          <div className="rounded-lg overflow-hidden border border-border max-w-4xl mx-auto">
            {/* Terminal Header */}
            <div className="bg-muted/80 dark:bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-border">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                compare.sh
              </div>
              <div className="font-mono text-xs text-muted-foreground/60">
                byteinit
              </div>
            </div>
            
            {/* Terminal Content */}
            <div className="bg-card dark:bg-zinc-950 text-card-foreground dark:text-zinc-300 p-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Command and output simulation */}
                <div className="flex items-start">
                  <span className="text-emerald-600 dark:text-emerald-500 mr-2">$</span>
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="overflow-hidden whitespace-nowrap text-emerald-600 dark:text-emerald-300"
                  >
                    ./compare.sh --core-features
                  </motion.span>
                  </div>
                
                <div className="pt-2 pb-1">
                  <div className="text-purple-600 dark:text-purple-400">
                    # Core Features Comparison
                </div>
              </div>
              
                {/* Simplified Terminal Table Output */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse font-mono text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th className="py-2 px-3 text-left border-b border-border text-purple-600 dark:text-purple-400 font-medium">FEATURE</th>
                        <th className="py-2 px-3 text-left border-b border-border text-blue-600 dark:text-blue-400 font-medium">BYTEINIT</th>
                        <th className="py-2 px-3 text-left border-b border-border text-muted-foreground font-medium">OTHERS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Content Presentation Row */}
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Content<br/>Presentation</span>
                        </td>
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mr-2 flex-shrink-0" />
                            <span className="text-emerald-600 dark:text-emerald-300 font-medium">Modern & Clean</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-foreground dark:text-zinc-300 pl-6">
                            <li>• Sleek developer-focused design</li>
                            <li>• Enhanced content formatting</li>
                          </ul>
                        </td>
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mr-2 flex-shrink-0" />
                            <span className="text-amber-600 dark:text-amber-300 font-medium">Standard Layout</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground pl-6">
                            <li>• Generic content templates</li>
                            <li>• Basic formatting options</li>
                          </ul>
                        </td>
                      </motion.tr>
                      
                      {/* Developer Focus Row */}
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Developer<br/>Focus</span>
                        </td>
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mr-2 flex-shrink-0" />
                            <span className="text-emerald-600 dark:text-emerald-300 font-medium">Built for Developers</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-foreground dark:text-zinc-300 pl-6">
                            <li>• Developer-centered UX</li>
                            <li>• Technical content optimized</li>
                          </ul>
                        </td>
                        <td className="py-3 px-3 align-top border-b border-border/50">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-muted-foreground dark:text-zinc-500 mr-2 flex-shrink-0" />
                            <span className="text-red-600 dark:text-red-400 font-medium">General Audience</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground pl-6">
                            <li>• General purpose design</li>
                            <li>• Not optimized for code</li>
                          </ul>
                        </td>
                      </motion.tr>
                      
                      {/* Future Plans Row */}
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <td className="py-3 px-3 align-top">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Roadmap<br/>Features</span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mr-2 flex-shrink-0" />
                            <span className="text-emerald-600 dark:text-emerald-300 font-medium">Ambitious Plans</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-foreground dark:text-zinc-300 pl-6">
                            <li>• Code execution (coming soon)</li>
                            <li>• Developer portfolios</li>
                            <li className="italic opacity-70">And many more...</li>
                          </ul>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mr-2 flex-shrink-0" />
                            <span className="text-amber-600 dark:text-amber-300 font-medium">Limited Scope</span>
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground pl-6">
                            <li>• General feature improvements</li>
                            <li>• Non-technical focus</li>
                          </ul>
                        </td>
                      </motion.tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Final command */}
                <div className="pt-4 border-t border-border mt-2">
                  <div className="flex items-start">
                    <span className="text-emerald-600 dark:text-emerald-500 mr-2">$</span>
                    <span className="text-emerald-600 dark:text-emerald-300 animate-pulse">_</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Terminal Legend */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              <span>Better choice for developers</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <span>Limited features</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
              <span>Missing features</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section - Video Interactive Version */}
      <section className="py-12 md:py-16 relative bg-background border-t border-border/20">
        {/* Remove grid background */}
        
        <div className="container max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col items-center mb-8 md:mb-10">
            <Badge className="mb-2 md:mb-3 text-xs rounded-full px-3 py-1 bg-background border-zinc-200 dark:border-zinc-800" variant="outline">Platform Metrics</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-center max-w-xl"
            >
              ByteInit by the numbers
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-center mt-2 md:mt-3 max-w-lg font-mono text-xs md:text-sm"
            >
              /* Live data from our developer community */
            </motion.p>
            </div>
            
          {/* Stats with video player layout */}
          <StatsProvider value={{ activeStatIndex, setActiveStatIndex }}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Video display column - takes full width on mobile, 3/5 on desktop */}
              <div className="lg:col-span-3 order-1">
                {/* Browser-like frame for the video */}
                <div className="rounded-lg overflow-hidden border border-border/40 flex flex-col bg-card/90 backdrop-blur-sm w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
                  {/* Browser toolbar */}
                  <BrowserToolbar />
                  
                  {/* Video container - full height and width */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    <StatsVideo />
                  </div>
                  
                  {/* Browser status bar */}
                  <div className="border-t border-border/30 px-3 md:px-4 py-1 md:py-1.5 bg-muted/30 flex justify-end items-center text-[10px] md:text-xs text-muted-foreground">
                    <span>{platformStats[activeStatIndex].value} {platformStats[activeStatIndex].label}</span>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4 md:hidden">
                  <div className="inline-flex p-1 bg-muted/30 backdrop-blur-sm rounded-full">
                    {platformStats.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 mx-1 rounded-full transition-all duration-300",
                          activeStatIndex === index 
                            ? "bg-primary" 
                            : "bg-border hover:bg-primary/50"
                        )}
                        onClick={() => setActiveStatIndex(index)}
                        aria-label={`View ${platformStats[index].label} stats`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stats selector column - takes full width on mobile, 2/5 on desktop */}
              <div className="lg:col-span-2 order-2">
                <div className="relative">
                  {/* Code-inspired decoration */}
                  <div className="absolute -left-4 top-0 bottom-0 border-l-2 border-dashed border-border/30 hidden lg:block"></div>
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center space-x-2 mb-1 md:mb-2">
                      <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <div className="font-mono text-[10px] md:text-xs text-muted-foreground">
                        SELECT * FROM metrics WHERE platform = 'ByteInit'
                      </div>
                    </div>
                    <div className="font-mono text-[10px] md:text-xs text-muted-foreground ml-5 md:ml-6">
                      <span className="opacity-50">// Click to visualize each metric</span>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                    <div className="text-[10px] md:text-xs text-muted-foreground font-mono">
                      metrics[<span className="text-primary">{activeStatIndex + 1}</span>/{platformStats.length}]
                    </div>
                    <div className="flex items-center space-x-1">
                      {platformStats.map((_, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300",
                            activeStatIndex === index 
                              ? "bg-primary" 
                              : "bg-border hover:bg-primary/50 cursor-pointer"
                          )}
                          onClick={() => setActiveStatIndex(index)}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <StatsSelector />
                  
                  <div className="mt-6 md:mt-8 md:ml-6 border border-border/50 rounded-md p-3 md:p-4 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      <span className="font-semibold block mb-1">Data source:</span>
                      All metrics are collected from real platform usage. Updated daily to reflect current growth and user engagement.
                    </p>
                    <div className="mt-2 md:mt-3 flex justify-between items-center text-[10px] md:text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="relative h-1.5 w-1.5 md:h-2 md:w-2">
                          <div className="absolute animate-ping h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                          <div className="relative rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></div>
                        </div>
                        <span>Live data</span>
                      </div>
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pagination dots on desktop */}
              <div className="hidden md:flex lg:col-span-3 order-3 justify-center mt-4">
                <div className="inline-flex p-1 bg-muted/30 backdrop-blur-sm rounded-full">
                  {platformStats.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 mx-1 rounded-full transition-all duration-300",
                        activeStatIndex === index 
                          ? "bg-primary" 
                          : "bg-border hover:bg-primary/50"
                      )}
                      onClick={() => setActiveStatIndex(index)}
                      aria-label={`View ${platformStats[index].label} stats`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </StatsProvider>
        </div>
      </section>

      {/* Creator Section - Solo Builder */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <Badge className="mb-2 text-xs rounded-full px-3 py-1 bg-background border-zinc-200 dark:border-zinc-800" variant="outline">Creator</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-3xl font-bold text-center"
            >
              Meet the Developer
            </motion.h2>
          </div>
            
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Creator Image */}
            <div className="relative min-h-[350px] md:min-h-[500px]">
              <div className="absolute inset-0 overflow-hidden">
                <Image 
                  src="/creator-profile.jpg"
                  alt="Creator portrait"
                  fill
                  className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-500"
                  priority
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                  </div>
              </div>
            </div>
            
            {/* Right: Creator Bio */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">Ashish</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Full Stack Dev</span>
                  </div>
                  
                  {/* Replace static social links with dropdown */}
                  <SocialLinksDropdown />
                </div>
                
                <div className="space-y-2">
                <p className="text-muted-foreground">
                    Full-stack developer with expertise in building scalable web applications using modern JavaScript frameworks. Experienced in React, Next.js, and Node.js ecosystems with a focus on creating performant user experiences.
                </p>
                <p className="text-muted-foreground">
                    Passionate about clean code, responsive design, and accessibility. Currently building ByteInit, a developer platform to unify resource discovery and knowledge sharing in one place.
                </p>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-4 gap-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-center"
                >
                  <p className="text-xl font-bold"><CountUp end={6} /><span>+</span></p>
                  <p className="text-xs text-muted-foreground">Years</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-center"
                >
                  <p className="text-xl font-bold"><CountUp end={20} /><span>+</span></p>
                  <p className="text-xs text-muted-foreground">Projects</p>
              </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-center"
                >
                  <p className="text-xl font-bold"><CountUp end={10} /><span>+</span></p>
                  <p className="text-xs text-muted-foreground">Clients</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-center"
                >
                  <p className="text-xl font-bold">∞</p>
                  <p className="text-xs text-muted-foreground">Bugs Fixed</p>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Tech stack section removed */}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="text-sm font-medium mb-3">Currently Building</h4>
                <div className="p-3 rounded-lg border border-border/50 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">ByteInit Platform</p>
                    <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      In Progress
                </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">A developer platform for discovery & growth</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - with updated CTA */}
      <section className="py-24 bg-background border-t border-border/20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-3 text-xs rounded-full px-3 py-1 bg-background border-zinc-200 dark:border-zinc-800" variant="outline">Join Us</Badge>
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to enhance your developer journey?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground mb-8 max-w-xl mx-auto"
            >
              Join ByteInit today and become part of a growing community of developers sharing resources, knowledge, and opportunities.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                View Resources
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Add before AboutPage component
const SocialLinksDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const socialLinks = [
    { icon: <ExternalLink className="h-4 w-4" />, url: "https://developerashish.vercel.app", label: "Portfolio" },
    { icon: <Github className="h-4 w-4" />, url: "https://github.com/ashish-makes", label: "GitHub" },
    { icon: <Linkedin className="h-4 w-4" />, url: "https://www.linkedin.com/in/ashish-makes/", label: "LinkedIn" },
    { icon: <Twitter className="h-4 w-4" />, url: "https://x.com/ashishmakes", label: "Twitter" },
    { icon: <Mail className="h-4 w-4" />, url: "mailto:ashindia.003@gmail.com", label: "Email" }
  ];
  
  // Handle clicking outside to close the dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
          "bg-primary/10 text-primary hover:bg-primary/20",
          "flex items-center gap-1.5"
        )}
        aria-label="Connect with me"
      >
        Connect
        <div className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-green-500" : "bg-primary"
        )}></div>
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-border/40 z-20 w-56"
        >
          <div className="p-1.5">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              Let's Connect
            </div>
            
            <div className="mt-1 grid gap-1">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ x: 3 }}
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/50 text-foreground">
                    {link.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AboutPage; 