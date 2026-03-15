'use client';
import { useEffect } from 'react';

export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    });
  }, [articleId]);

  return null;
}
