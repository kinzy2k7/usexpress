'use client';
import React, { useRef, useCallback, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageInsert?: (file: File) => Promise<string>;
  placeholder?: string;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  title: string;
}

export default function RichTextEditor({ value, onChange, onImageInsert, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync value → editor (only when external value changes)
  useEffect(() => {
    if (editorRef.current && !isUpdating.current) {
      const current = editorRef.current.innerHTML;
      if (current !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdating.current = true;
      onChange(editorRef.current.innerHTML);
      isUpdating.current = false;
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const insertImageAtCursor = useCallback((src: string, alt: string = '') => {
    editorRef.current?.focus();
    restoreSelection();
    const img = `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;" />`;
    document.execCommand('insertHTML', false, img);
    handleInput();
  }, [handleInput]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageInsert) return;
    setUploadingImage(true);
    try {
      const url = await onImageInsert(file);
      insertImageAtCursor(url, file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  }, [onImageInsert, insertImageAtCursor]);

  const handleInsertImageUrl = () => {
    if (!imageUrl.trim()) return;
    insertImageAtCursor(imageUrl.trim());
    setImageUrl('');
    setShowUrlInput(false);
  };

  const formatBlock = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  const toolbarGroups: ToolbarButton[][] = [
    [
      {
        label: 'H1', icon: <span className="font-bold text-xs">H1</span>,
        action: () => formatBlock('h1'), title: 'Tiêu đề 1'
      },
      {
        label: 'H2', icon: <span className="font-bold text-xs">H2</span>,
        action: () => formatBlock('h2'), title: 'Tiêu đề 2'
      },
      {
        label: 'H3', icon: <span className="font-bold text-xs">H3</span>,
        action: () => formatBlock('h3'), title: 'Tiêu đề 3'
      },
      {
        label: 'P', icon: <span className="text-xs">¶</span>,
        action: () => formatBlock('p'), title: 'Đoạn văn'
      },
    ],
    [
      {
        label: 'Bold', icon: <span className="font-bold text-xs">B</span>,
        action: () => execCommand('bold'), title: 'In đậm (Ctrl+B)'
      },
      {
        label: 'Italic', icon: <span className="italic text-xs">I</span>,
        action: () => execCommand('italic'), title: 'In nghiêng (Ctrl+I)'
      },
      {
        label: 'Underline', icon: <span className="underline text-xs">U</span>,
        action: () => execCommand('underline'), title: 'Gạch chân (Ctrl+U)'
      },
      {
        label: 'Strike', icon: <span className="line-through text-xs">S</span>,
        action: () => execCommand('strikeThrough'), title: 'Gạch ngang'
      },
    ],
    [
      {
        label: 'UL', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/>
            <line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        ),
        action: () => execCommand('insertUnorderedList'), title: 'Danh sách gạch đầu dòng'
      },
      {
        label: 'OL', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/>
            <line x1="10" y1="18" x2="21" y2="18"/>
            <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text>
            <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text>
            <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text>
          </svg>
        ),
        action: () => execCommand('insertOrderedList'), title: 'Danh sách đánh số'
      },
      {
        label: 'Quote', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        ),
        action: () => formatBlock('blockquote'), title: 'Trích dẫn'
      },
      {
        label: 'HR', icon: <span className="text-xs">—</span>,
        action: () => { execCommand('insertHorizontalRule'); }, title: 'Đường kẻ ngang'
      },
    ],
    [
      {
        label: 'AlignL', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        ),
        action: () => execCommand('justifyLeft'), title: 'Căn trái'
      },
      {
        label: 'AlignC', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        ),
        action: () => execCommand('justifyCenter'), title: 'Căn giữa'
      },
      {
        label: 'AlignR', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/>
            <line x1="6" y1="18" x2="21" y2="18"/>
          </svg>
        ),
        action: () => execCommand('justifyRight'), title: 'Căn phải'
      },
    ],
    [
      {
        label: 'Link', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        ),
        action: () => {
          const url = prompt('Nhập URL liên kết:');
          if (url) execCommand('createLink', url);
        },
        title: 'Chèn liên kết'
      },
      {
        label: 'Unlink', icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/>
            <path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/>
            <line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/>
            <line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/>
          </svg>
        ),
        action: () => execCommand('unlink'), title: 'Xoá liên kết'
      },
    ],
  ];

  return (
    <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-white/[0.02] focus-within:border-[#1A6B4A]/60 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/[0.08] bg-white/[0.03]">
        {toolbarGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="w-px h-5 bg-white/[0.12] mx-1" />}
            {group.map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.title}
                onMouseDown={(e) => { e.preventDefault(); saveSelection(); btn.action(); }}
                className="w-7 h-7 flex items-center justify-center rounded text-[#F0EDE8]/60 hover:text-[#F0EDE8] hover:bg-white/[0.08] transition-all"
              >
                {btn.icon}
              </button>
            ))}
          </React.Fragment>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.12] mx-1" />

        {/* Image Upload */}
        <button
          type="button"
          title="Tải ảnh lên"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); imageInputRef.current?.click(); }}
          disabled={uploadingImage}
          className="w-7 h-7 flex items-center justify-center rounded text-[#F0EDE8]/60 hover:text-[#F0EDE8] hover:bg-white/[0.08] transition-all disabled:opacity-40"
        >
          {uploadingImage ? (
            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
        </button>

        {/* Image URL */}
        <button
          type="button"
          title="Chèn ảnh từ URL"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowUrlInput((v) => !v); }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-all ${showUrlInput ? 'bg-[#1A6B4A]/30 text-[#F0EDE8]' : 'text-[#F0EDE8]/60 hover:text-[#F0EDE8] hover:bg-white/[0.08]'}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.08] bg-[#1A6B4A]/5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F0EDE8]/40 flex-shrink-0">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <input
            ref={urlInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInsertImageUrl(); } }}
            placeholder="Dán URL ảnh vào đây và nhấn Enter..."
            className="flex-1 bg-transparent text-xs text-[#F0EDE8] placeholder-[#F0EDE8]/30 focus:outline-none font-sans"
            autoFocus
          />
          <button
            type="button"
            onClick={handleInsertImageUrl}
            className="text-xs text-[#1A6B4A] hover:text-[#F0EDE8] font-sans font-600 transition-colors px-2 py-1 rounded hover:bg-[#1A6B4A]/20"
          >
            Chèn
          </button>
          <button
            type="button"
            onClick={() => { setShowUrlInput(false); setImageUrl(''); }}
            className="text-[#F0EDE8]/30 hover:text-[#F0EDE8]/60 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || 'Viết nội dung bài viết tại đây...'}
        className="min-h-[320px] max-h-[600px] overflow-y-auto p-4 text-sm text-[#F0EDE8] font-sans focus:outline-none rich-editor"
        style={{ lineHeight: '1.75' }}
      />

      <style jsx global>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: rgba(240,237,232,0.25);
          pointer-events: none;
        }
        .rich-editor h1 { font-size: 1.6em; font-weight: 700; margin: 0.75em 0 0.4em; font-family: Georgia, serif; color: #F0EDE8; }
        .rich-editor h2 { font-size: 1.35em; font-weight: 700; margin: 0.7em 0 0.35em; font-family: Georgia, serif; color: #F0EDE8; }
        .rich-editor h3 { font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; color: #F0EDE8; }
        .rich-editor p { margin: 0.5em 0; }
        .rich-editor strong, .rich-editor b { font-weight: 700; color: #F0EDE8; }
        .rich-editor em, .rich-editor i { font-style: italic; }
        .rich-editor u { text-decoration: underline; }
        .rich-editor s { text-decoration: line-through; }
        .rich-editor ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .rich-editor li { margin: 0.25em 0; }
        .rich-editor blockquote { border-left: 3px solid #1A6B4A; padding: 0.5em 1em; margin: 0.75em 0; color: rgba(240,237,232,0.7); font-style: italic; background: rgba(26,107,74,0.08); border-radius: 0 6px 6px 0; }
        .rich-editor a { color: #1A6B4A; text-decoration: underline; }
        .rich-editor hr { border: none; border-top: 1px solid rgba(240,237,232,0.15); margin: 1em 0; }
        .rich-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block; }
      `}</style>
    </div>
  );
}
