/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Github,
  Twitter,
  Globe,
  MapPin,
  User,
  Loader2,
  Code2,
  Briefcase,
  type LucideIcon,
  Pencil,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add this after the imports
const EXPERIENCE_LEVELS = [
  { value: '0-2', label: 'Beginner (0-2 years)', category: 'Entry Level' },
  { value: '2-4', label: 'Junior (2-4 years)', category: 'Entry Level' },
  { value: '4-6', label: 'Mid-Level (4-6 years)', category: 'Intermediate' },
  { value: '6-8', label: 'Senior (6-8 years)', category: 'Experienced' },
  { value: '8-12', label: 'Staff (8-12 years)', category: 'Advanced' },
  { value: '12+', label: 'Principal (12+ years)', category: 'Expert' },
] as const;

// Schema validation
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url('Invalid URL').max(100).optional().nullable(),
  github: z.string().max(100).optional().nullable(),
  twitter: z.string().max(100).optional().nullable(),
  techStack: z.string().max(200).optional().nullable(),
  experience: z.string().max(50).optional().nullable(),
  yearsOfExperience: z.string().optional().nullable(),
  currentRole: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  lookingForWork: z.boolean().default(false),
  image: z.string().nullable().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const defaultProfile: ProfileData = {
  name: '',
  email: '',
  image: null,
  bio: '',
  location: '',
  website: '',
  github: '',
  twitter: '',
  techStack: '',
  experience: '',
  yearsOfExperience: null,
  currentRole: '',
  company: '',
  lookingForWork: false,
};

// Components
interface ProfileFieldProps {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  link?: string;
  previewContent?: React.ReactNode;
  testId?: string;
}

const ProfileField = ({
  icon: Icon,
  label,
  value,
  link,
  testId,
}: ProfileFieldProps) => {
  const getPreviewContent = (type: 'github' | 'twitter' | 'website') => {
    switch (type) {
      case 'github':
        return (
          <div className="space-y-3 p-1">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              <span className="font-semibold">{value}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Active</span>
              </div>
              <p>View repositories, contributions, and more on GitHub</p>
            </div>
            <a 
              href={`https://github.com/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              <span>github.com/{value}</span>
            </a>
          </div>
        );
      case 'twitter':
        return (
          <div className="space-y-3 p-1">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              <span className="font-semibold">@{value}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Follow for tech insights and updates</p>
            </div>
            <a 
              href={`https://twitter.com/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              <span>twitter.com/{value}</span>
            </a>
          </div>
        );
      case 'website':
        return (
          <div className="space-y-3 p-1">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-semibold">Personal Website</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>View portfolio, projects, and more</p>
            </div>
            <a 
              href={value || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{value}</span>
            </a>
          </div>
        );
    }
  };

  const content = (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <span className="truncate">{value ?? 'Not specified'}</span>
    </div>
  );

  if (!link || !value) return (
    <div className="space-y-1" data-testid={testId}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {content}
    </div>
  );

  const type = label.toLowerCase() as 'github' | 'twitter' | 'website';

  return (
    <div className="space-y-1" data-testid={testId}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 hover:text-primary transition-colors w-full md:w-auto"
          >
            {content}
            <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        </HoverCardTrigger>
        <HoverCardContent 
          side="top" 
          align="start"
          alignOffset={-40}
          className="w-[280px] md:w-80 p-3 backdrop-blur-sm bg-card/95"
          sideOffset={10}
        >
          <div className="relative">
            {getPreviewContent(type)}
            <div className="absolute -bottom-2 left-4 w-2 h-2 rotate-45 bg-card/95" />
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

interface ViewModeProps {
  profileData: ProfileData;
  setIsEditing: (value: boolean) => void;
  isLoading: boolean;
}

const ViewMode = ({
  profileData,
  setIsEditing,
  isLoading,
}: ViewModeProps) => (
  <div className="space-y-6">
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profileData.image ?? undefined} alt={profileData.name} />
          <AvatarFallback>
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-medium">{profileData.name}</h2>
            <p className="text-muted-foreground">{profileData.email}</p>
          </div>

          {/* Role and Company */}
          {(profileData.currentRole || profileData.company) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
              {profileData.currentRole && (
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profileData.currentRole}</span>
                </div>
              )}
              {profileData.currentRole && profileData.company && (
                <span className="hidden sm:inline text-muted-foreground/60">•</span>
              )}
              {profileData.company && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profileData.company}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Experience and Work Status */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            {profileData.yearsOfExperience && (
              <Badge 
                variant="secondary" 
                className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {EXPERIENCE_LEVELS.find(level => level.value === profileData.yearsOfExperience)?.label}
              </Badge>
            )}
            {profileData.lookingForWork && (
              <Badge 
                variant="outline"
                className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                Open to Work
              </Badge>
            )}
          </div>
        </div>
      </div>
      {/* Mobile edit button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="h-8 w-8 rounded-full bg-muted md:hidden"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {/* Desktop edit button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="hidden md:inline-flex"
      >
        Edit Profile
      </Button>
    </div>

    <div className="grid gap-6">
      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">About</div>
        <p className="text-sm whitespace-pre-wrap">
          {profileData.bio || 'No bio provided'}
        </p>
      </div>

      {profileData.techStack && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Tech Stack</div>
          <div className="flex flex-wrap gap-2">
            {profileData.techStack.split(',').map((tech) => (
              <Badge 
                key={tech} 
                variant="secondary"
                className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {tech.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField
          icon={MapPin}
          label="Location"
          value={profileData.location}
          testId="profile-location"
        />
        <ProfileField
          icon={Globe}
          label="Website"
          value={profileData.website}
          link={profileData.website ?? undefined}
          previewContent={
            <div className="space-y-2">
              <h4 className="font-semibold">Personal Website</h4>
              <p className="text-sm">View developer portfolio and projects</p>
            </div>
          }
          testId="profile-website"
        />
        <ProfileField
          icon={Github}
          label="GitHub"
          value={profileData.github}
          link={profileData.github ? `https://github.com/${profileData.github}` : undefined}
          previewContent={
            <div className="space-y-2">
              <h4 className="font-semibold">GitHub Profile</h4>
              <p className="text-sm">View repositories and contributions</p>
            </div>
          }
          testId="profile-github"
        />
        <ProfileField
          icon={Twitter}
          label="Twitter"
          value={profileData.twitter}
          link={profileData.twitter ? `https://twitter.com/${profileData.twitter}` : undefined}
          previewContent={
            <div className="space-y-2">
              <h4 className="font-semibold">Twitter Profile</h4>
              <p className="text-sm">Follow for tech insights and updates</p>
            </div>
          }
          testId="profile-twitter"
        />
      </div>
    </div>
  </div>
);

interface TechStackInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TechStackInput = ({ 
  value, 
  onChange 
}: TechStackInputProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTech, setNewTech] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTech = () => {
    if (newTech.trim()) {
      const currentTechs = value ? value.split(',').map(t => t.trim()) : [];
      onChange([...currentTechs, newTech.trim()].join(', '));
      setNewTech('');
    }
    setIsAdding(false);
  };

  const removeTech = (techToRemove: string) => {
    const currentTechs = value ? value.split(',').map(t => t.trim()) : [];
    onChange(currentTechs.filter(tech => tech !== techToRemove).join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTech('');
    }
  };

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-lg min-h-[2.5rem] items-center">
      {value && value.split(',').map((tech) => (
        <Badge
          key={tech}
          variant="secondary"
          className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
        >
          {tech.trim()}
          <button
            type="button"
            className="ml-1 hover:text-destructive-foreground/90"
            onClick={() => removeTech(tech.trim())}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {isAdding ? (
        <Input
          ref={inputRef}
          value={newTech}
          onChange={(e) => setNewTech(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTech}
          className="w-32 h-7 text-sm bg-background"
          placeholder="Add tech..."
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full hover:bg-muted"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tech
        </Button>
      )}
    </div>
  );
};

interface EditModeProps {
  onSubmit: (data: ProfileData) => Promise<void>;
  onCancel: () => void;
  defaultValues: ProfileData;
  isSubmitting: boolean;
}

const EditMode = ({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting,
}: EditModeProps) => {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const { register, handleSubmit, formState: { errors }, control } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Edit Profile</h2>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className="max-w-md"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p className="text-sm text-red-500" id="name-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                rows={3}
                placeholder="Tell us about yourself"
                aria-describedby={errors.bio ? 'bio-error' : undefined}
              />
              {errors.bio && (
                <p className="text-sm text-red-500" id="bio-error">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Professional Details</h3>
          <div className="grid gap-4">
            {/* Work Status */}
            <div className="flex items-center space-x-2">
              <Controller
                name="lookingForWork"
                control={control}
                defaultValue={defaultValues.lookingForWork}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    checked={value}
                    onCheckedChange={onChange}
                    id="lookingForWork"
                  />
                )}
              />
              <Label htmlFor="lookingForWork">Open to Work</Label>
            </div>

            {/* Role and Company */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  {...register('currentRole')}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  {...register('company')}
                  placeholder="e.g. Acme Inc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Experience Level</Label>
                <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          EXPERIENCE_LEVELS.reduce<Record<string, typeof EXPERIENCE_LEVELS[number][]>>(
                            (acc, item) => ({
                              ...acc,
                              [item.category]: [...(acc[item.category] || []), item],
                            }),
                            {}
                          )
                        ).map(([category, items]) => (
                          <SelectGroup key={category}>
                            <SelectLabel>{category}</SelectLabel>
                            {items.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Tech Stack</h3>
          <div className="space-y-2">
            <Label>Technologies</Label>
            <Controller
              name="techStack"
              control={control}
              render={({ field }) => (
                <TechStackInput
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Social Links</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://your-website.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                {...register('github')}
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register('twitter')}
                placeholder="username"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      const sanitizedData = profileSchema.parse({
        ...defaultProfile,
        ...data,
      });
      setProfileData(sanitizedData);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProfileData) => {
    const updateProfile = async () => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      const sanitizedData = profileSchema.parse(result.data);
      setProfileData(sanitizedData);
      setIsEditing(false);
      
      return sanitizedData;
    };

    toast.promise(updateProfile(), {
      loading: 'Updating your profile...',
      success: 'Profile updated successfully! 🎉',
      error: 'Failed to update profile 😔'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="pt-6">
        {isEditing ? (
          <EditMode
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
            defaultValues={profileData}
            isSubmitting={isSubmitting}
          />
        ) : (
          <ViewMode
            profileData={profileData}
            setIsEditing={setIsEditing}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}