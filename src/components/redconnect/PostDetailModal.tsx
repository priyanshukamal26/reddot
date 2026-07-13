'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Clock, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  is_own: boolean;
}

interface PostDetailModalProps {
  post: any; // We'll just pass the full post object
  onClose: () => void;
  onCommentAdded: () => void; // To refresh the main feed's comment count
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostDetailModal({ post, onClose, onCommentAdded }: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

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

  async function fetchComments() {
    try {
      const res = await fetch(`/api/redconnect/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/redconnect/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
        onCommentAdded();
        
        // Scroll to bottom
        setTimeout(() => {
          if (modalRef.current) {
            modalRef.current.scrollTop = modalRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const res = await fetch(`/api/redconnect/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCommentAdded(); // Refresh parent count
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  }

  const initial = post.username ? post.username[0].toUpperCase() : '?';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl bg-[#141416] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 bg-[#141416]/80 backdrop-blur-md rounded-t-2xl z-20">
            <h3 className="text-lg font-medium text-white">Discussion</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div ref={modalRef} className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">
            {/* Original Post (Simplified view) */}
            <div className="pb-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e51d38] to-[#c0142b] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(229,29,56,0.2)]">
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{post.username}</span>
                    {post.is_own && (
                      <span className="text-[9px] font-mono tracking-wider text-[#e51d38] bg-[#e51d38]/10 px-1.5 py-0.5 rounded">YOU</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(post.created_at)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                  <img src={post.image_url} alt="Post image" className="w-full max-h-[300px] object-cover" />
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-5 pb-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white/10 border-t-[#e51d38] rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No comments yet. Be the first to start the discussion!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-gray-300">
                      {comment.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-200">{comment.username}</span>
                          {comment.is_own && (
                            <span className="text-[9px] font-mono tracking-wider text-[#e51d38] bg-[#e51d38]/10 px-1.5 py-0 rounded">YOU</span>
                          )}
                          <span className="text-[10px] text-gray-500">{getRelativeTime(comment.created_at)}</span>
                        </div>
                        {comment.is_own && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="shrink-0 p-4 border-t border-white/5 bg-[#141416]/80 backdrop-blur-md rounded-b-2xl z-20">
            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                maxLength={1000}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#e51d38] text-white disabled:opacity-50 disabled:bg-white/10 transition-all hover:bg-[#c0142b] hover:shadow-[0_0_15px_rgba(229,29,56,0.3)]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
