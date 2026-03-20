'use client';
import { useEffect } from 'react';

export default function AdterraBanner() {
  useEffect(() => {
    const atOptions = {
      key: 'b41cc3efe529fef7b58fa621f726e5f1',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };
    // @ts-expect-error adterra global
    if (typeof window !== 'undefined') window.atOptions = atOptions;

    const script = document.createElement('script');
    script.src = '//pl28947740.profitablecpmratenetwork.com/b41cc3efe529fef7b58fa621f726e5f1/invoke.js';
    script.async = true;
    document.getElementById('adterra-banner-320x50')?.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center w-full py-2 bg-transparent">
      <div id="adterra-banner-320x50" style={{ width: 320, height: 50 }} />
    </div>
  );
}
