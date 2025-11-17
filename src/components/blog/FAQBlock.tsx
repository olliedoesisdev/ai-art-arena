'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  items: FAQItem[];
  onChange: (items: FAQItem[]) => void;
  editable?: boolean;
}

export function FAQBlock({ items, onChange, editable = false }: FAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const addItem = () => {
    onChange([...items, { question: '', answer: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (editable) {
    return (
      <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">FAQ Section</h3>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={addItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            No FAQ items yet. Click "Add Question" to get started.
          </p>
        )}

        {items.map((item, index) => (
          <div key={index} className="border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Question..."
                  value={item.question}
                  onChange={(e) => updateItem(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Answer..."
                  value={item.answer}
                  onChange={(e) => updateItem(index, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Read-only view with accordion
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50"
        >
          <button
            type="button"
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <h4 className="text-white font-medium pr-4">{item.question}</h4>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-950/50">
              <p className="text-slate-300">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Generate Schema.org FAQ markup for SEO
export function generateFAQSchema(items: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}
