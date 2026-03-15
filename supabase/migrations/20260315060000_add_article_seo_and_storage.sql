-- Add SEO fields to articles table and create article-images storage bucket

-- 1. Add SEO columns to articles
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT '';

-- 2. Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

-- 3. Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS policies
DROP POLICY IF EXISTS "public_read_article_images" ON storage.objects;
CREATE POLICY "public_read_article_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "admin_upload_article_images" ON storage.objects;
CREATE POLICY "admin_upload_article_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_article_images" ON storage.objects;
CREATE POLICY "admin_delete_article_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND public.is_admin());
