'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, MessageCircle, Sparkles, Users, BookmarkCheck, User, Search, RefreshCw } from 'lucide-react';
import PostCard from '@/components/redconnect/PostCard';
import NewPostModal from '@/components/redconnect/NewPostModal';
import ImageLightbox from '@/components/redconnect/ImageLightbox';
import PostDetailModal from '@/components/redconnect/PostDetailModal';

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

const FILTER_TABS = [
  { value: 'all', label: 'All', icon: Users },
  { value: 'my', label: 'My Posts', icon: User },
  { value: 'saved', label: 'Saved', icon: BookmarkCheck },
];

const TAG_FILTERS = [
  { value: '', label: 'All Topics' },
  { value: 'query', label: 'Queries' },
  { value: 'experience', label: 'Experiences' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'general', label: 'General' },
];

export default function RedConnectPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = useCallback(async (append = false, targetPage = 1) => {
    try {
      const res = await fetch(`/api/redconnect/posts?filter=${filter}&tag=${tagFilter}&q=${encodeURIComponent(debouncedQuery)}&limit=30&page=${targetPage}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        } else {
          setPosts(data.posts || []);
        }
        setHasMore(!!data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  }, [filter, tagFilter, debouncedQuery]);

  // Initial fetch and filter changes
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchPosts(false, 1).finally(() => setIsLoading(false));
  }, [fetchPosts]);

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchPosts(true, nextPage);
    setPage(nextPage);
    setIsLoadingMore(false);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setPage(1);
    await fetchPosts(false, 1);
    setTimeout(() => setIsRefreshing(false), 500);
  }

  async function handleCreatePost(data: { content: string; image_url: string | null; tag: string }) {
    const res = await fetch('/api/redconnect/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create post');
    }

    setShowNewPost(false);
    await fetchPosts();
  }

  async function handleLike(postId: string) {
    const res = await fetch(`/api/redconnect/posts/${postId}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle like');
  }

  async function handleSave(postId: string) {
    const res = await fetch(`/api/redconnect/posts/${postId}/save`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle save');
  }

  async function handleDelete(postId: string) {
    const res = await fetch(`/api/redconnect/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete post');
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  const showLoadingSpinner = isLoading || searchQuery !== debouncedQuery;

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#e51d38] opacity-30 blur-xl rounded-full" />
            <MessageCircle className="w-8 h-8 text-[#e51d38] relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white">RedConnect</h1>
            <p className="text-xs font-mono text-gray-500 tracking-widest uppercase">Community • Connect • Support</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-lg">
          A safe space to share experiences, ask questions, and support each other. 
          Your identity is protected — only your username is visible.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6"
      >
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#e51d38] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community posts, questions, or users..."
            className="w-full bg-[rgba(20,20,22,0.6)] backdrop-blur-xl border border-white/5 focus:border-[#e51d38]/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        {/* Filter Tabs */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="connect-filter"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* New Post Button */}
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#e51d38] text-white hover:bg-[#c0142b] hover:shadow-[0_0_20px_rgba(229,29,56,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </motion.div>

      {/* Tag Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-8 overflow-x-auto pb-1"
      >
        {TAG_FILTERS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTagFilter(t.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
              tagFilter === t.value
                ? 'bg-[#e51d38]/15 text-[#e51d38] border-[#e51d38]/30'
                : 'bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Posts Feed */}
      {showLoadingSpinner ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#e51d38] rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">
            {searchQuery !== debouncedQuery || searchQuery ? "Searching posts..." : "Loading posts..."}
          </p>
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#e51d38] opacity-10 blur-2xl rounded-full" />
            <Sparkles className="w-14 h-14 text-gray-600 relative z-10" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {debouncedQuery ? "No matching posts found" : (filter === 'saved' ? 'No saved posts yet' : filter === 'my' ? 'You haven\'t posted yet' : 'No posts yet')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            {debouncedQuery 
              ? "Try searching for different keywords or checking your spelling."
              : (filter === 'saved'
                ? 'Bookmark posts you find helpful and they\'ll appear here.'
                : 'Be the first to share your thoughts with the community.')}
          </p>
          {filter !== 'saved' && (
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#e51d38] text-white hover:bg-[#c0142b] hover:shadow-[0_0_20px_rgba(229,29,56,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create First Post
            </button>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4 pb-8">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onLike={handleLike}
              onSave={handleSave}
              onDelete={handleDelete}
              onImageClick={setLightboxImage}
              onClickComments={() => setSelectedPostForComments(post)}
            />
          ))}
          
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-full text-sm font-medium border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Post Detail (Comments) Modal */}
      {selectedPostForComments && (
        <PostDetailModal
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onCommentAdded={fetchPosts}
        />
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
