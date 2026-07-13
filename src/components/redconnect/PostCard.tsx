'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Bookmark, Trash2, Clock, MessageSquare } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  username: string;
  content: string;
  image_url: string | null;
  tag: string;
  created_at: string;
  like_count: number;
  save_count: number;
  comment_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_own: boolean;
}

interface PostCardProps {
  post: Post;
  index: number;
  onLike: (postId: string) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onImageClick: (src: string) => void;
  onClickComments?: () => void;
}

const TAG_STYLES: Record<string, string> = {
  query: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  experience: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  suggestion: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  general: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const TAG_LABELS: Record<string, string> = {
  query: 'Query',
  experience: 'Experience',
  suggestion: 'Suggestion',
  general: 'General',
};

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

export default function PostCard({ post, index, onLike, onSave, onDelete, onImageClick, onClickComments }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleLike() {
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    if (!wasLiked) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 600);
    }

    try {
      await onLike(post.id);
    } catch {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  }

  async function handleSave() {
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    try {
      await onSave(post.id);
    } catch {
      setIsSaved(wasSaved);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch {
      setIsDeleting(false);
    }
  }

  const initial = post.username ? post.username[0].toUpperCase() : '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -20 : 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
      className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
    >
      {/* Header: avatar, username, time, tag */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e51d38] to-[#c0142b] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_12px_rgba(229,29,56,0.3)]">
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

        {/* Tag */}
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${TAG_STYLES[post.tag] || TAG_STYLES.general}`}>
          {TAG_LABELS[post.tag] || 'General'}
        </span>
      </div>

      {/* Content */}
      <div 
        className={`px-5 pb-3 ${onClickComments ? 'cursor-pointer group/content' : ''}`}
        onClick={() => onClickComments?.()}
      >
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="px-5 pb-3">
          <div
            className="rounded-xl overflow-hidden border border-white/5 cursor-pointer group"
            onClick={() => onImageClick(post.image_url!)}
          >
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-[400px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-5">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
          >
            <motion.div
              animate={isLikeAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Heart
                className={`w-[18px] h-[18px] transition-colors ${
                  isLiked
                    ? 'text-[#e51d38] fill-[#e51d38]'
                    : 'text-gray-500 group-hover:text-[#e51d38]/70'
                }`}
              />
            </motion.div>
            <span className={`text-xs font-medium ${isLiked ? 'text-[#e51d38]' : 'text-gray-500'}`}>
              {likeCount > 0 ? likeCount : ''}
            </span>
          </button>
          
          {/* Comment Button */}
          <button
            onClick={() => onClickComments?.()}
            className="flex items-center gap-1.5 group"
          >
            <MessageSquare className="w-[18px] h-[18px] text-gray-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-medium text-gray-500 group-hover:text-blue-400 transition-colors">
              {post.comment_count > 0 ? post.comment_count : ''}
            </span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 group"
          >
            <Bookmark
              className={`w-[18px] h-[18px] transition-colors ${
                isSaved
                  ? 'text-white fill-white'
                  : 'text-gray-500 group-hover:text-white/70'
              }`}
            />
          </button>
        </div>

        {/* Delete (own posts only) */}
        {post.is_own && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[11px]">Delete</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
