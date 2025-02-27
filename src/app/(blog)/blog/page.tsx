import React from 'react';
import BlogList from '@/components/blog/BlogList';

const BlogPage = async () => {
  return (
    <div className="w-full max-w-none">
      <BlogList />
    </div>
  );
};

export default BlogPage;