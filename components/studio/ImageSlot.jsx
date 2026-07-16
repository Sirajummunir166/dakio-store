'use client';
import { useRef } from 'react';
import { send } from './bridge';

// Image slot — stable slotId keyed into doc.assets (shared ids stay in sync, e.g. st-brand-logo).
// Click opens a file picker in edit mode; the image travels to the chrome as a data URL and
// comes back through the doc. Absolute-fills its positioned parent.
export default function ImageSlot({ slotId, assets, placeholder = '', fit = 'cover', preview = false }) {
  const inputRef = useRef(null);
  const src = assets && assets[slotId];

  const pick = (e) => {
    if (preview) return;
    e.stopPropagation();
    inputRef.current && inputRef.current.click();
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => send('img', { slotId, dataUrl: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      onClick={pick}
      style={{ position: 'absolute', inset: 0, cursor: preview ? 'default' : 'pointer' }}
      title={preview ? undefined : 'Click to swap image'}
    >
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 18px', textAlign: 'center', fontFamily: "'Hanken Grotesk',sans-serif",
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.2px', color: 'currentColor', opacity: 0.45,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.06) 10px, rgba(128,128,128,0.06) 20px)',
        }}>
          {placeholder}
        </div>
      )}
      {!preview && (
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={onFile} onClick={(e) => e.stopPropagation()} />
      )}
    </div>
  );
}
