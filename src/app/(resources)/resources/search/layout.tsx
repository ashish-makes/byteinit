import { Metadata } from 'next'

interface SearchLayoutProps {
  children: React.ReactNode
  params: {}
  searchParams?: { q?: string }
}

export function generateMetadata({ searchParams = {} }: SearchLayoutProps): Metadata {
  const query = searchParams?.q || ''
  
  return {
    title: query 
      ? `Search results for "${query}" | Resources - ByteInit` 
      : 'Search Resources - ByteInit',
    description: query
      ? `Search results for "${query}" in developer resources, tools, libraries, and more.`
      : 'Search for developer resources, tools, libraries, and more.',
    openGraph: {
      title: query 
        ? `Search results for "${query}"` 
        : 'Search Resources',
      description: query
        ? `Search results for "${query}" in developer resources, tools, libraries, and more.`
        : 'Search for developer resources, tools, libraries, and more.',
    },
    robots: {
      index: false,
      follow: true,
    }
  }
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 