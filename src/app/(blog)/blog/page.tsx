import React from 'react';
import BlogList from '@/components/blog/BlogList';

export default function BlogPage() {
  return (
    <div className="w-full max-w-none">
      <BlogList section="hot" />
    </div>
  );
}