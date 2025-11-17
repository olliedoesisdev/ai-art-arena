'use client';

import { useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ImageIcon,
  Code,
  Minus,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from './ImageUploader';

interface TipTapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [showImageUploader, setShowImageUploader] = useState(false);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (url: string, filename: string) => {
    editor.chain().focus().setImage({ src: url, alt: filename }).run();
  };

  return (
    <div className="border-b border-slate-700 bg-slate-900/50 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('italic') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('code') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Headings */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Lists */}
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant={editor.isActive('codeBlock') ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Insert Elements */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter link URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowImageUploader(true)}
        title="Upload Image"
      >
        <Upload className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter image URL:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Add Image from URL"
      >
        <ImageIcon className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </Button>

      {showImageUploader && (
        <ImageUploader
          onUpload={handleImageUpload}
          onClose={() => setShowImageUploader(false)}
        />
      )}

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Undo/Redo */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

export function TipTapEditor({ content, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {editor && (
        <div className="border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
          {editor.storage.characterCount.characters()} characters
        </div>
      )}
    </div>
  );
}
