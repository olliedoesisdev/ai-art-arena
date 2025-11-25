'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Calendar, Tag, FolderOpen, Link as LinkIcon, Image as ImageIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TipTapEditor } from '@/components/blog/TipTapEditor';
import { FAQBlock, generateFAQSchema, type FAQItem } from '@/components/blog/FAQBlock';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { BlogCategoryRow, BlogTagRow, ContestRow, BlogPostRow } from '@/types/database';

interface BlogPostFormProps {
  post?: BlogPostRow;
  categories: BlogCategoryRow[];
  tags: BlogTagRow[];
  contests: ContestRow[];
}

export default function BlogPostForm({ post, categories, tags, contests }: BlogPostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || { type: 'doc', content: [] });
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image_url || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featured_image_alt || '');
  const [categoryId, setCategoryId] = useState(post?.category_id || '');
  const [contestId, setContestId] = useState(post?.contest_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>(post?.status as any || 'draft');
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for || '');

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [ogImage, setOgImage] = useState(post?.og_image_url || '');

  // FAQ section
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [showFaqEditor, setShowFaqEditor] = useState(false);

  // Auto-save functionality
  const autoSave = useAutoSave(post ? `blog-edit-${post.id}` : 'blog-new');

  // Auto-save effect - save every 30 seconds if there are changes
  useEffect(() => {
    if (!title && !content) return;

    const timer = setTimeout(() => {
      autoSave.save({
        title,
        slug,
        excerpt,
        content,
        categoryId,
        contestId,
        selectedTags,
        featuredImage,
        featuredImageAlt,
        metaTitle,
        metaDescription,
        ogImage,
        timestamp: Date.now()
      });
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [title, slug, excerpt, content, categoryId, contestId, selectedTags, featuredImage, metaTitle, metaDescription]);

  // Load auto-saved draft on mount
  useEffect(() => {
    if (post) return; // Don't recover if editing existing post

    const savedDraft = autoSave.load();
    if (savedDraft) {
      setShowRecoveryPrompt(true);
    }
  }, []);

  // Validate content structure
  const getValidContent = (data: any) => {
    if (!data || typeof data !== 'object') {
      return { type: 'doc', content: [] };
    }
    if (data.type === 'doc' && Array.isArray(data.content)) {
      return data;
    }
    return { type: 'doc', content: [] };
  };

  // Recover from auto-save
  const recoverDraft = () => {
    const savedDraft = autoSave.load();
    if (savedDraft) {
      setTitle(savedDraft.title || '');
      setSlug(savedDraft.slug || '');
      setExcerpt(savedDraft.excerpt || '');
      setContent(getValidContent(savedDraft.content));
      setCategoryId(savedDraft.categoryId || '');
      setContestId(savedDraft.contestId || '');
      setSelectedTags(savedDraft.selectedTags || []);
      setFeaturedImage(savedDraft.featuredImage || '');
      setFeaturedImageAlt(savedDraft.featuredImageAlt || '');
      setMetaTitle(savedDraft.metaTitle || '');
      setMetaDescription(savedDraft.metaDescription || '');
      setOgImage(savedDraft.ogImage || '');
    }
    setShowRecoveryPrompt(false);
  };

  // Discard recovered draft
  const discardDraft = () => {
    autoSave.clear();
    setShowRecoveryPrompt(false);
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!post) {
      setSlug(generateSlug(value));
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Render preview of content
  const renderPreview = (content: any) => {
    if (!content || !content.content) {
      return <p className="text-slate-600">Start writing to see preview...</p>;
    }

    return content.content.map((node: any, index: number) => {
      switch (node.type) {
        case 'paragraph':
          return (
            <p key={index} className="text-slate-700 mb-4">
              {node.content?.map((child: any, _i: number) => renderInline(child, _i))}
            </p>
          );
        case 'heading':
          const HeadingTag = `h${node.attrs.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          const headingClasses: Record<number, string> = {
            1: 'text-3xl font-bold text-slate-900 mb-6 mt-8',
            2: 'text-2xl font-bold text-slate-900 mb-4 mt-6',
            3: 'text-xl font-semibold text-slate-900 mb-3 mt-4',
          };
          const className = headingClasses[node.attrs.level as number] || 'text-lg font-semibold text-slate-900 mb-2';
          return (
            <HeadingTag key={index} className={className}>
              {node.content?.map((child: any, _i: number) => renderInline(child, _i))}
            </HeadingTag>
          );
        case 'bulletList':
          return (
            <ul key={index} className="list-disc list-inside text-slate-700 mb-4 space-y-2">
              {node.content?.map((item: any, i: number) => (
                <li key={i}>
                  {item.content?.[0]?.content?.map((child: any, j: number) => renderInline(child, j))}
                </li>
              ))}
            </ul>
          );
        case 'orderedList':
          return (
            <ol key={index} className="list-decimal list-inside text-slate-700 mb-4 space-y-2">
              {node.content?.map((item: any, i: number) => (
                <li key={i}>
                  {item.content?.[0]?.content?.map((child: any, j: number) => renderInline(child, j))}
                </li>
              ))}
            </ol>
          );
        case 'blockquote':
          return (
            <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-slate-600 mb-4">
              {node.content?.map((child: any, _i: number) => renderPreview({ content: [child] }))}
            </blockquote>
          );
        case 'codeBlock':
          return (
            <pre key={index} className="bg-slate-100 border border-slate-300 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-sm text-slate-700">
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
  };

  const renderInline = (node: any, index: number) => {
    if (node.type === 'text') {
      let text: any = node.text;

      if (node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type === 'bold') {
            text = <strong key={`bold-${index}`}>{text}</strong>;
          } else if (mark.type === 'italic') {
            text = <em key={`italic-${index}`}>{text}</em>;
          } else if (mark.type === 'code') {
            text = <code key={`code-${index}`} className="bg-slate-200 px-1.5 py-0.5 rounded text-sm">{text}</code>;
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
  };

  const handleSave = async (saveStatus: 'draft' | 'published' | 'scheduled') => {
    if (!title || !slug || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        featured_image_url: featuredImage || null,
        featured_image_alt: featuredImageAlt || null,
        category_id: categoryId || null,
        contest_id: contestId || null,
        status: saveStatus,
        scheduled_for: saveStatus === 'scheduled' ? scheduledFor : null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        og_image_url: ogImage || null,
        og_title: metaTitle || title,
        og_description: metaDescription || excerpt,
        has_faq: faqItems.length > 0,
        faq_schema: faqItems.length > 0 ? generateFAQSchema(faqItems) : null,
        tags: selectedTags
      };

      const url = post
        ? `/api/admin/blog/posts/${post.id}`
        : '/api/admin/blog/posts';

      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      const { post: _savedPost } = await response.json();

      // Clear auto-save after successful save
      autoSave.clear();

      // Redirect to post list
      router.push('/admin/blog');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving post:', error);
      alert(error.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Recovery Prompt */}
      {showRecoveryPrompt && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Recover Unsaved Work?</h3>
            <p className="text-slate-600 mb-6">
              We found an auto-saved draft from your previous session. Would you like to recover it?
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={recoverDraft}
                className="flex-1"
              >
                Recover Draft
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={discardDraft}
                className="flex-1"
              >
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save Indicator */}
      {autoSave.lastSaved && (
        <div className="fixed top-4 right-4 bg-white border border-slate-300 shadow-sm rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-600 z-40">
          <Clock className="w-4 h-4" />
          Last saved at {autoSave.lastSaved.toLocaleTimeString()}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Title & Slug */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title..."
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slug <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post..."
            rows={3}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Content <span className="text-red-600">*</span>
          </label>
          <Button
            type="button"
            variant={showPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
          <div>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your post..."
            />
          </div>

          {showPreview && (
            <div className="border-l border-slate-700 pl-4">
              <div className="sticky top-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Live Preview</h3>
                <div className="prose prose-invert max-w-none">
                  {renderPreview(content)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            FAQ Section (for SEO)
          </label>
          <Button
            type="button"
            variant={showFaqEditor ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowFaqEditor(!showFaqEditor)}
          >
            {showFaqEditor ? 'Hide FAQ Editor' : 'Add FAQ Section'}
          </Button>
        </div>

        {showFaqEditor && (
          <FAQBlock
            items={faqItems}
            onChange={setFaqItems}
            editable
          />
        )}
      </div>

      {/* Sidebar: Meta Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Image */}
        <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Featured Image
          </label>
          <input
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
          {featuredImage && (
            <img
              src={featuredImage}
              alt="Featured preview"
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          <input
            type="text"
            value={featuredImageAlt}
            onChange={(e) => setFeaturedImageAlt(e.target.value)}
            placeholder="Alt text for accessibility"
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>

        {/* Category */}
        <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Contest Link */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4" />
              Link to Contest
            </label>
            <select
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No contest</option>
              {contests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  Week {contest.week_number} {contest.year} - {contest.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-primary text-slate-900'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Metadata */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">SEO Metadata</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={title || 'Post title'}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p className="text-xs text-slate-600 mt-1">
            {metaTitle.length}/60 characters (ideal: 50-60)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={excerpt || 'Brief description for search engines'}
            rows={3}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
          <p className="text-xs text-slate-600 mt-1">
            {metaDescription.length}/160 characters (ideal: 120-160)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            OG Image URL
          </label>
          <input
            type="url"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder={featuredImage || 'https://...'}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Publish Options */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Publishing
        </h3>

        {status === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Scheduled For
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setStatus('scheduled');
              handleSave('scheduled');
            }}
            disabled={saving || !scheduledFor}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish Now
          </Button>
        </div>
      </div>
    </form>
    </>
  );
}
