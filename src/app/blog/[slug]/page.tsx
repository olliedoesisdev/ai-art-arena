import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, ArrowLeft, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { FAQBlock } from '@/components/blog/FAQBlock';
import type { BlogPostWithRelations } from '@/types/database';
import type { Metadata } from 'next';
import React from 'react';

async function getPost(slug: string): Promise<BlogPostWithRelations | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:admin_users(id, name),
      contest:contests(id, title, week_number, year)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error || !post) {
    return null;
  }

  // Get tags
  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select('tag:blog_tags(*)')
    .eq('post_id', post.id);

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id);

  return {
    ...post,
    tags: postTags?.map(pt => pt.tag) || []
  } as BlogPostWithRelations;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || '',
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || '',
      images: post.og_image_url || post.featured_image_url ? [
        {
          url: post.og_image_url || post.featured_image_url || '',
          alt: post.featured_image_alt || post.title,
        }
      ] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || '',
      images: post.og_image_url || post.featured_image_url || undefined,
    },
  };
}

// Render TipTap JSON content to HTML
function renderContent(content: any): React.ReactNode {
  if (!content || !content.content) {
    return null;
  }

  return content.content.map((node: any, index: number) => {
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-slate-300 mb-4">
            {node.content?.map((child: any, i: number) => renderInline(child, i))}
          </p>
        );
      case 'heading':
        const HeadingTag = `h${node.attrs.level}` as keyof React.JSX.IntrinsicElements;
        const headingClasses = ({
          1: 'text-3xl font-bold text-white mb-6 mt-8',
          2: 'text-2xl font-bold text-white mb-4 mt-6',
          3: 'text-xl font-semibold text-white mb-3 mt-4',
        } as Record<number, string>)[node.attrs.level as number] || 'text-lg font-semibold text-white mb-2';
        return (
          <HeadingTag key={index} className={headingClasses}>
            {node.content?.map((child: any, i: number) => renderInline(child, i))}
          </HeadingTag>
        );
      case 'bulletList':
        return (
          <ul key={index} className="list-disc list-inside text-slate-300 mb-4 space-y-2">
            {node.content?.map((item: any, i: number) => (
              <li key={i}>
                {item.content?.[0]?.content?.map((child: any, j: number) => renderInline(child, j))}
              </li>
            ))}
          </ul>
        );
      case 'orderedList':
        return (
          <ol key={index} className="list-decimal list-inside text-slate-300 mb-4 space-y-2">
            {node.content?.map((item: any, i: number) => (
              <li key={i}>
                {item.content?.[0]?.content?.map((child: any, j: number) => renderInline(child, j))}
              </li>
            ))}
          </ol>
        );
      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-slate-400 mb-4">
            {node.content?.map((child: any) => renderContent({ content: [child] }))}
          </blockquote>
        );
      case 'codeBlock':
        return (
          <pre key={index} className="bg-slate-950 border border-slate-700 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-sm text-slate-300">
              {node.content?.[0]?.text}
            </code>
          </pre>
        );
      case 'image':
        return (
          <img
            key={index}
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            className="rounded-lg max-w-full h-auto mb-4"
          />
        );
      case 'horizontalRule':
        return <hr key={index} className="border-slate-700 my-8" />;
      default:
        return null;
    }
  });
}

function renderInline(node: any, index: number): React.ReactNode {
  if (node.type === 'text') {
    let text: React.ReactNode = node.text;

    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === 'bold') {
          text = <strong key={`bold-${index}`}>{text}</strong>;
        } else if (mark.type === 'italic') {
          text = <em key={`italic-${index}`}>{text}</em>;
        } else if (mark.type === 'code') {
          text = <code key={`code-${index}`} className="bg-slate-800 px-1.5 py-0.5 rounded text-sm">{text}</code>;
        } else if (mark.type === 'link') {
          text = (
            <a
              key={`link-${index}`}
              href={mark.attrs.href}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text}
            </a>
          );
        }
      });
    }

    return <span key={index}>{text}</span>;
  }

  return null;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Parse FAQ items if they exist
  const faqItems = post.has_faq && post.content
    ? extractFAQFromContent(post.content)
    : [];

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      {post.faq_schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(post.faq_schema)
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            {/* Category */}
            {post.category && (
              <Link href={`/blog/category/${post.category.slug}`}>
                <Badge
                  variant="default"
                  style={{ backgroundColor: post.category.color }}
                  className="mb-4"
                >
                  {post.category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-slate-400 mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-700">
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </div>
              )}
              {post.read_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.read_time_minutes} min read
                </div>
              )}
              {post.author && (
                <div>
                  By {post.author.name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count} views
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              className="w-full rounded-lg mb-8"
            />
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            {renderContent(post.content)}
          </div>

          {/* FAQ Section */}
          {faqItems.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <FAQBlock items={faqItems} onChange={() => {}} editable={false} />
            </div>
          )}

          {/* Contest Link */}
          {post.contest && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-12">
              <h3 className="text-lg font-semibold text-white mb-2">Related Contest</h3>
              <Link
                href={`/archive/${post.contest.week_number}-${post.contest.year}`}
                className="text-primary hover:underline"
              >
                Week {post.contest.week_number} {post.contest.year}: {post.contest.title}
              </Link>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map(tag => (
                <Badge key={tag.id} variant="default">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="pt-8 border-t border-slate-700">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}

// Helper function to extract FAQ items from content
function extractFAQFromContent(_content: any): any[] {
  // This is a placeholder - in a real implementation, you'd store FAQ items separately
  // or mark them in the content with a special structure
  return [];
}
