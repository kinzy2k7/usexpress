import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    if (!articleId) return NextResponse.json({ error: 'Missing articleId' }, { status: 400 });

    // Check cookie để chống đếm trùng — mỗi bài 1 lần/24h
    const cookieName = `viewed_${articleId}`;
    const alreadyViewed = request.cookies.get(cookieName);
    if (alreadyViewed) {
      return NextResponse.json({ skipped: true });
    }

    const supabase = await createClient();

    // Lấy views hiện tại
    const { data: article } = await supabase
      .from('articles')
      .select('views')
      .eq('id', articleId)
      .single();

    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    // Tăng views
    const { error } = await supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', articleId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Set cookie 24h
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieName, '1', {
      maxAge: 60 * 60 * 24, // 24 giờ
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
