'use client';
import { useRef, useEffect } from 'react';
import { send } from './bridge';
import { sx } from './theme';

// Inline contenteditable text — one undo step per focus session (editStart on focus,
// prop commit on blur). Enter blurs unless multiline. In preview mode renders plain.
export default function Editable({ secId, k, value, style, multiline = false, preview = false, tag = 'div', onClick }) {
  const ref = useRef(null);
  const focused = useRef(false);

  useEffect(() => {
    // Sync external value only while not being edited (avoids caret jumps on state round-trips)
    if (ref.current && !focused.current && ref.current.innerText !== String(value ?? '')) {
      ref.current.innerText = String(value ?? '');
    }
  }, [value]);

  const Tag = tag;
  if (preview) {
    return <Tag style={sx(style)} onClick={onClick}>{value}</Tag>;
  }

  const setRef = (el) => {
    ref.current = el;
    if (el && el.innerText !== String(value ?? '') && !focused.current) el.innerText = String(value ?? '');
  };

  return (
    <Tag
      ref={setRef}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      style={sx(style + 'cursor:text;')}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
      onFocus={() => { focused.current = true; send('editStart'); }}
      onBlur={(e) => {
        focused.current = false;
        send('prop', { id: secId, key: k, val: (e.target.innerText || '').replace(/\n+$/, '') });
      }}
      onKeyDown={multiline ? undefined : (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
    />
  );
}
