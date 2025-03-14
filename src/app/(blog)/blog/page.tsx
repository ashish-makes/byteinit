import React from 'react';
import BlogList from '@/components/blog/BlogList';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function BlogPage() {
  return (
    <div className="w-full max-w-none">
      <ErrorBoundary fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">
              We're having trouble loading the blog posts. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }>
        <BlogList section="hot" />
      </ErrorBoundary>
    </div>
  );
}