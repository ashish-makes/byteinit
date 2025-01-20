"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Coffee, Chrome, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const experienceLevels = [
  "Beginner (0-2 years)",
  "Intermediate (2-5 years)",
  "Advanced (5-8 years)",
  "Expert (8+ years)"
];

const primaryRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Other"
];

const interests = [
  { id: "frontend", label: "Frontend Development" },
  { id: "backend", label: "Backend Development" },
  { id: "mobile", label: "Mobile Development" },
  { id: "devops", label: "DevOps & Cloud" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "security", label: "Security" },
  { id: "databases", label: "Databases" },
  { id: "architecture", label: "System Architecture" },
  { id: "ui", label: "UI/UX Design" },
  { id: "testing", label: "Testing & QA" }
];

export default function RegistrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    experienceLevel: "",
    primaryRole: "",
    interests: [] as string[],
    preferredStack: "",
    lookingFor: "",
    workStyle: "",
    newsletter: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background dark:bg-zinc-950">
        <Card className="w-full max-w-[500px] shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Byteinit</span>
            </div>
            <CardTitle className="text-2xl font-bold">Join the community</CardTitle>
            <CardDescription>
              Create your account and personalize your experience
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full dark:bg-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background dark:bg-zinc-900 px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full dark:bg-zinc-800 dark:border-zinc-700"
                    onClick={handleGoogleSignIn}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select 
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleInputChange("experienceLevel", value)}
                    >
                      <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Role</Label>
                    <Select
                      value={formData.primaryRole}
                      onValueChange={(value) => handleInputChange("primaryRole", value)}
                    >
                      <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700">
                        <SelectValue placeholder="Select your primary role" />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Tech Stack</Label>
                    <Input
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={formData.preferredStack}
                      onChange={(e) => handleInputChange("preferredStack", e.target.value)}
                      className="dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Areas of Interest</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {interests.map((interest) => (
                        <div key={interest.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest.id}
                            checked={formData.interests.includes(interest.id)}
                            onCheckedChange={() => handleInterestToggle(interest.id)}
                          />
                          <label htmlFor={interest.id} className="text-sm">
                            {interest.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>What are you looking for?</Label>
                    <RadioGroup
                      value={formData.lookingFor}
                      onValueChange={(value) => handleInputChange("lookingFor", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="resources" id="resources" />
                        <Label htmlFor="resources">Learning Resources</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tools" id="tools" />
                        <Label htmlFor="tools">Development Tools</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="community" id="community" />
                        <Label htmlFor="community">Community & Networking</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All of the above</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange("newsletter", checked)}
                    />
                    <label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for dev resources and updates
                    </label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="dark:bg-zinc-800 dark:border-zinc-700"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={currentStep === 3 ? () => console.log(formData) : nextStep}
              className="ml-auto"
            >
              {currentStep === 3 ? (
                isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Platform Info */}
      <div className="hidden lg:flex flex-1 relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] opacity-20" />
        <div className="relative w-full flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                All resources a developer needs at one place.
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Your go-to platform for finding and sharing development tools, libraries, and resources. Join a community of developers building the future together.
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    1
                  </div>
                  Curated development resources and tools
                </li>
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    2
                  </div>
                  Personalized learning paths
                </li>
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    3
                  </div>
                  Active developer community
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}