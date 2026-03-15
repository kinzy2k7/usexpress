'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import RichTextEditor from './components/RichTextEditor';
import ArticlePreview from './components/ArticlePreview';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  created_at: string;
  status: 'published' | 'draft';
  views: number;
  image: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
}

const categories = ['Destinations', 'Tips & News', 'Deals & Bookings', 'Shop'];

const formatUSDate = (isoString: string) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return isoString.split('T')[0];
  }
};

const emptyForm = {
  title: '',
  category: categories[0],
  author: '',
  excerpt: '',
  content: '',
  image: '',
  status: 'draft\' as \'published\' | \'draft',
  meta_title: '',
  meta_description: '',
  slug: '',
};

type Tab = 'articles' | 'create';

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailTab, setThumbnailTab] = useState<'url' | 'upload'>('url');
  const [formError, setFormError] = useState('');

  const supabase = createClient();

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setAuthChecked(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchArticles();
  }, [authChecked]);

  const fetchArticles = async () => {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setArticles(data as Article[]);
    }
    setLoadingArticles(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    }
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (!error) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleteConfirm(null);
  };

  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      category: article.category,
      author: article.author,
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      image: article.image,
      status: article.status,
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
      slug: article?.slug || '',
    });
    setActiveTab('create');
    setFormError('');
  };

  // Upload image to Supabase Storage
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
    return publicUrl;
  }, [supabase]);

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setFormError('Tải ảnh bìa thất bại. Vui lòng thử lại.');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Vui lòng nhập tiêu đề bài viết.'); return; }
    if (!form.author.trim()) { setFormError('Vui lòng nhập tên tác giả.'); return; }
    setSaving(true);

    const payload = {
      title: form.title,
      category: form.category,
      author: form.author,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      status: form.status,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      slug: form.slug || generateSlug(form.title),
    };

    if (editingId !== null) {
      const { error } = await supabase.from('articles').update(payload).eq('id', editingId);
      if (error) { setFormError(error.message); setSaving(false); return; }
      await fetchArticles();
      setEditingId(null);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('articles').insert({
        ...payload,
        image: form.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop',
        views: 0,
        created_by: user?.id,
      });
      if (error) { setFormError(error.message); setSaving(false); return; }
      await fetchArticles();
    }

    setSaving(false);
    setForm(emptyForm);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('articles');
    }, 1800);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setActiveTab('articles');
  };

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080C0A] flex items-center justify-center">
        <div className="text-[#F0EDE8]/50 font-sans text-sm">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C0A] text-[#F0EDE8]">
      {/* Preview Modal */}
      {showPreview && (
        <ArticlePreview
          title={form.title}
          author={form.author}
          category={form.category}
          excerpt={form.excerpt}
          content={form.content}
          image={form.image}
          metaTitle={form.meta_title}
          metaDescription={form.meta_description}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Top Bar */}
      <header className="border-b border-white/[0.07] bg-[#0D1410]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home-page" className="flex items-center gap-2 text-[#F0EDE8]/50 hover:text-[#F0EDE8] transition-colors text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Về trang chủ
            </Link>
            <span className="text-white/10">|</span>
            <span className="font-serif text-lg text-[#F0EDE8]">UsExpress <span className="text-[#F5A623] text-sm font-sans font-600">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A6B4A] animate-pulse" />
              <span className="text-xs text-[#F0EDE8]/50 font-sans">Trang quản trị</span>
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-[#F0EDE8]/40 hover:text-[#F0EDE8]/80 font-sans transition-colors border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 rounded-md"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng bài viết', value: articles.length, icon: '📄', color: 'border-white/10' },
            { label: 'Đã đăng', value: publishedCount, icon: '✅', color: 'border-[#1A6B4A]/40' },
            { label: 'Bản nháp', value: draftCount, icon: '📝', color: 'border-[#F5A623]/30' },
            { label: 'Tổng lượt xem', value: totalViews.toLocaleString(), icon: '👁', color: 'border-white/10' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white/[0.03] border ${stat.color} rounded-lg p-4`}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-serif font-600 text-[#F0EDE8]">{stat.value}</div>
              <div className="text-xs text-[#F0EDE8]/50 font-sans mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-lg p-1 w-fit">
          {(['articles', 'create'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'articles') { setEditingId(null); setForm(emptyForm); setFormError(''); }
              }}
              className={`px-5 py-2 rounded-md text-sm font-sans font-500 transition-all duration-200 ${
                activeTab === tab ? 'bg-[#1A6B4A] text-[#F0EDE8]' : 'text-[#F0EDE8]/50 hover:text-[#F0EDE8]'
              }`}
            >
              {tab === 'articles' ? '📋 Quản lý bài viết' : editingId ? '✏️ Chỉnh sửa bài viết' : '✍️ Bài viết mới'}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F0EDE8]/30" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/30 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                />
              </div>
              <div className="flex gap-2">
                {([
                  { value: 'all', label: 'Tất cả' },
                  { value: 'published', label: 'Đã đăng' },
                  { value: 'draft', label: 'Bản nháp' },
                ] as const).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFilterStatus(s.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-sans font-600 uppercase tracking-wider transition-all ${
                      filterStatus === s.value
                        ? 'bg-[#1A6B4A] text-[#F0EDE8]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-[#F0EDE8]/50 hover:text-[#F0EDE8]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingArticles ? (
              <div className="text-center py-16 text-[#F0EDE8]/40 font-sans text-sm">Đang tải bài viết...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-[#F0EDE8]/40 font-sans text-sm">Không có bài viết nào.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((article) => (
                  <div key={article.id} className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-[#F0EDE8] truncate">{article.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-xs text-[#F0EDE8]/40 font-sans">{article.category}</span>
                        <span className="text-xs text-[#F0EDE8]/40 font-sans">bởi {article.author}</span>
                        <span className="text-xs text-[#F0EDE8]/40 font-sans">{formatUSDate(article.created_at)}</span>
                        <span className="text-xs text-[#F0EDE8]/40 font-sans">👁 {(article.views || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleStatus(article.id)}
                        className={`px-3 py-1 rounded-full text-xs font-sans font-600 transition-all ${
                          article.status === 'published' ?'bg-[#1A6B4A]/20 text-[#1A6B4A] border border-[#1A6B4A]/30' :'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20'
                        }`}
                      >
                        {article.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                      </button>
                      <button
                        onClick={() => startEdit(article)}
                        className="p-2 text-[#F0EDE8]/40 hover:text-[#F0EDE8] transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {deleteConfirm === article.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteArticle(article.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded font-sans">Xoá</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs text-[#F0EDE8]/40 border border-white/[0.08] rounded font-sans">Huỷ</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(article.id)}
                          className="p-2 text-[#F0EDE8]/40 hover:text-red-400 transition-colors"
                          title="Xoá"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Tab */}
        {activeTab === 'create' && (
          <div className="max-w-3xl">
            {formSuccess ? (
              <div className="flex items-center gap-3 bg-[#1A6B4A]/20 border border-[#1A6B4A]/30 rounded-lg px-6 py-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1A6B4A]">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div>
                  <div className="text-[#F0EDE8]/90 font-sans text-sm font-600">
                    {editingId ? 'Bài viết đã được cập nhật!' : 'Bài viết đã được tạo thành công!'}
                  </div>
                  <div className="text-[#F0EDE8]/40 font-sans text-xs mt-0.5">Đang chuyển về danh sách...</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-0">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-[#F0EDE8]">
                    {editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 text-xs text-[#F0EDE8]/60 hover:text-[#F0EDE8] border border-white/[0.1] hover:border-white/[0.2] px-4 py-2 rounded-lg transition-all font-sans"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Xem trước
                  </button>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span className="text-red-400 text-xs font-sans">{formError}</span>
                  </div>
                )}

                {/* Section: Thông tin cơ bản */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/40 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans font-600 uppercase tracking-[0.08em] text-[#F0EDE8]/50 mb-2">Tiêu đề bài viết *</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                        placeholder="Nhập tiêu đề bài viết..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">Danh mục *</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                        >
                          {categories.map((c) => <option key={c} value={c} className="bg-[#0D1410]">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">Tác giả *</label>
                        <input
                          type="text"
                          value={form.author}
                          onChange={(e) => setForm({ ...form, author: e.target.value })}
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                          placeholder="Tên tác giả..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">Trạng thái *</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                        >
                          <option value="draft" className="bg-[#0D1410]">Bản nháp</option>
                          <option value="published" className="bg-[#0D1410]">Đã đăng</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">Tóm tắt</label>
                      <textarea
                        value={form.excerpt}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans resize-none"
                        placeholder="Mô tả ngắn về bài viết (hiển thị ở trang chủ)..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Ảnh bìa */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/40 mb-4">Ảnh bìa (Thumbnail)</h3>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setThumbnailTab('url')}
                      className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all ${thumbnailTab === 'url' ? 'bg-[#1A6B4A]/30 text-[#F0EDE8]' : 'text-[#F0EDE8]/40 hover:text-[#F0EDE8]'}`}
                    >
                      URL ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailTab('upload')}
                      className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all ${thumbnailTab === 'upload' ? 'bg-[#1A6B4A]/30 text-[#F0EDE8]' : 'text-[#F0EDE8]/40 hover:text-[#F0EDE8]'}`}
                    >
                      Tải ảnh lên
                    </button>
                  </div>

                  {thumbnailTab === 'url' ? (
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                    />
                  ) : (
                    <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-all ${thumbnailUploading ? 'border-[#1A6B4A]/40 bg-[#1A6B4A]/5' : 'border-white/[0.1] hover:border-[#1A6B4A]/40 hover:bg-white/[0.02]'}`}>
                      {thumbnailUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin text-[#1A6B4A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          <span className="text-xs text-[#F0EDE8]/40 font-sans">Đang tải lên...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#F0EDE8]/30">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <span className="text-xs text-[#F0EDE8]/40 font-sans">Nhấn để chọn ảnh (JPG, PNG, WebP — tối đa 5MB)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnailUpload(f); e.target.value = ''; }}
                      />
                    </label>
                  )}

                  {form.image && (
                    <div className="mt-3 flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="Ảnh bìa" className="w-24 h-16 object-cover rounded-lg border border-white/[0.1]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#F0EDE8]/50 font-sans truncate">{form.image}</div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="text-xs text-red-400/60 hover:text-red-400 font-sans mt-1 transition-colors"
                        >
                          Xoá ảnh
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Nội dung */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/40 mb-4">Nội dung bài viết</h3>
                  <RichTextEditor
                    value={form.content}
                    onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                    onImageInsert={uploadImage}
                    placeholder="Viết nội dung bài viết tại đây... Dùng toolbar để định dạng văn bản và chèn ảnh."
                  />
                  <div className="mt-2 text-xs text-[#F0EDE8]/25 font-sans">
                    Hỗ trợ: tiêu đề, in đậm, in nghiêng, danh sách, trích dẫn, liên kết, chèn ảnh
                  </div>
                </div>

                {/* Section: SEO */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/40">SEO & Metadata</h3>
                    <span className="text-xs text-[#F0EDE8]/20 font-sans">(tuỳ chọn)</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">
                        Meta Title
                        <span className={`ml-2 font-normal normal-case tracking-normal ${form.meta_title.length > 60 ? 'text-[#F5A623]' : 'text-[#F0EDE8]/25'}`}>
                          {form.meta_title.length}/60
                        </span>
                      </label>
                      <input
                        type="text"
                        value={form.meta_title}
                        onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                        maxLength={80}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                        placeholder="Tiêu đề hiển thị trên Google (mặc định dùng tiêu đề bài viết)..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">
                        Meta Description
                        <span className={`ml-2 font-normal normal-case tracking-normal ${form.meta_description.length > 160 ? 'text-[#F5A623]' : 'text-[#F0EDE8]/25'}`}>
                          {form.meta_description.length}/160
                        </span>
                      </label>
                      <textarea
                        value={form.meta_description}
                        onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                        rows={2}
                        maxLength={200}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans resize-none"
                        placeholder="Mô tả hiển thị trên Google (mặc định dùng tóm tắt bài viết)..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/50 mb-2">Slug (URL)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#F0EDE8]/25 font-sans flex-shrink-0">/bai-viet/</span>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/60 transition-colors font-sans"
                          placeholder="url-bai-viet-cua-ban"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1A6B4A] hover:bg-[#1A6B4A]/80 disabled:opacity-50 text-[#F0EDE8] font-sans font-600 text-sm rounded-lg transition-all"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        {editingId ? 'Cập nhật bài viết' : 'Lưu bài viết'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.2] text-[#F0EDE8]/70 hover:text-[#F0EDE8] font-sans font-600 text-sm rounded-lg transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Xem trước
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-3 text-[#F0EDE8]/40 hover:text-[#F0EDE8]/70 font-sans font-600 text-sm rounded-lg transition-all"
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}