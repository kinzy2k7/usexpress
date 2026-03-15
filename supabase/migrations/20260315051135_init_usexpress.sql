-- UsExpress: Initial schema migration
-- Creates user_profiles, articles tables, RLS policies, and admin mock user

-- 1. Types
DROP TYPE IF EXISTS public.article_status CASCADE;
CREATE TYPE public.article_status AS ENUM ('published', 'draft');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Destinations',
    author TEXT NOT NULL DEFAULT '',
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    image TEXT DEFAULT '',
    status public.article_status DEFAULT 'draft'::public.article_status,
    views INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_by ON public.articles(created_by);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- 4. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
)
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_all_user_profiles" ON public.user_profiles;
CREATE POLICY "admin_manage_all_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Articles: public read, admin write
DROP POLICY IF EXISTS "public_read_articles" ON public.articles;
CREATE POLICY "public_read_articles"
ON public.articles
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_articles" ON public.articles;
CREATE POLICY "admin_manage_articles"
ON public.articles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 8. Mock Data: Admin user (adminUsExpress / adminKinzy)
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'adminUsExpress@usexpress.local',
        crypt('adminKinzy', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        jsonb_build_object('full_name', 'Admin UsExpress', 'role', 'admin'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert sample articles
    INSERT INTO public.articles (id, title, category, author, excerpt, content, image, status, views, created_by)
    VALUES
        (gen_random_uuid(), 'Top 10 Hidden Gems in Southeast Asia You Must Visit', 'Destinations', 'Sarah Chen',
         'Discover the most breathtaking hidden destinations across Southeast Asia.',
         'Full article content here...', 'https://images.unsplash.com/photo-1649087897570-9a9eae3d9995',
         'published'::public.article_status, 4821, admin_uuid),
        (gen_random_uuid(), 'Budget Travel Guide: Europe Under $50 a Day', 'Tips & News', 'Marco Rossi',
         'Travel Europe on a shoestring budget with these expert tips.',
         'Full article content here...', 'https://images.unsplash.com/photo-1636925983994-3c5594966785',
         'published'::public.article_status, 3102, admin_uuid),
        (gen_random_uuid(), 'The Ultimate Packing List for Long-Haul Flights', 'Tips & News', 'Aiko Tanaka',
         'Everything you need for a comfortable long-haul flight.',
         'Full article content here...', 'https://images.unsplash.com/photo-1625435489507-261d5baab0f8',
         'draft'::public.article_status, 0, admin_uuid),
        (gen_random_uuid(), 'Exploring the Ancient Temples of Kyoto in Autumn', 'Destinations', 'Sarah Chen',
         'A journey through Kyoto''s most stunning autumn temple landscapes.',
         'Full article content here...', 'https://images.unsplash.com/photo-1667899099407-5f5bc8c6be3c',
         'published'::public.article_status, 6540, admin_uuid),
        (gen_random_uuid(), 'Best Deals on Flights to South America This Summer', 'Deals & Bookings', 'Carlos Mendez',
         'Find the best flight deals to South America before they sell out.',
         'Full article content here...', 'https://images.unsplash.com/photo-1645878639250-6f33e94924ba',
         'draft'::public.article_status, 0, admin_uuid)
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
