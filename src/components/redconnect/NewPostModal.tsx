'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ImagePlus, Send, Tag } from 'lucide-react';

interface NewPostModalProps {
  onClose: () => void;
  onSubmit: (data: { content: string; image_url: string | null; tag: string }) => Promise<void>;
}

const TAG_OPTIONS = [
  { value: 'general', label: 'General', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { value: 'query', label: 'Query', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'experience', label: 'Experience', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'suggestion', label: 'Suggestion', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
];

export default function NewPostModal({ onClose, onSubmit }: NewPostModalProps) {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('general');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  function handleImageUpload(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    if (content.length > 2000) {
      setError('Post must be under 2000 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        content: content.trim(),
        image_url: imagePreview,
        tag,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          className="relative z-10 w-full max-w-xl bg-[#141416] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              <h3 className="text-lg font-medium text-white">New Post</h3>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#e51d38] text-white hover:bg-[#c0142b] hover:shadow-[0_0_20px_rgba(229,29,56,0.4)]"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Tag Selector */}
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2 flex-wrap">
                {TAG_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTag(t.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      tag === t.value
                        ? t.color + ' shadow-sm'
                        : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or tell your experience..."
              className="w-full bg-transparent text-white text-sm leading-relaxed placeholder-gray-500 focus:outline-none resize-none min-h-[120px] mb-4"
              maxLength={2000}
            />

            {/* Character count */}
            <div className="flex justify-end mb-4">
              <span className={`text-xs font-mono ${content.length > 1800 ? 'text-[#e51d38]' : 'text-gray-600'}`}>
                {content.length}/2000
              </span>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-4 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full max-h-[300px] object-cover"
                />
                <button
                  onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Image Upload Zone */}
            {!imagePreview && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-[#e51d38]/30 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <ImagePlus className="w-8 h-8 text-gray-600 group-hover:text-[#e51d38]/60 mx-auto mb-2 transition-colors" />
                <p className="text-xs text-gray-500 group-hover:text-gray-400">
                  Drop an image here or click to upload
                </p>
                <p className="text-[10px] text-gray-600 mt-1">Max 2MB • JPG, PNG, GIF, WebP</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Error */}
            {error && (
              <p className="text-xs text-[#e51d38] mt-3">{error}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
