'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { send } from './bridge';

// Shared image-slot context: crops (slotId → {x,y,z}) applied everywhere the
// slot renders, plus the crop-editor wiring (canvas edit mode only).
// x/y = object-position percentages (0–100), z = zoom (1–4).
export const ImgCtx = createContext({ crops: {}, cropTarget: null, setCropTarget: null, onCrop: null });

export function cropStyle(crop, fit) {
  const c = crop || {};
  const x = typeof c.x === 'number' ? c.x : 50;
  const y = typeof c.y === 'number' ? c.y : 50;
  const z = typeof c.z === 'number' && c.z > 1 ? c.z : 1;
  return {
    width: '100%', height: '100%', objectFit: fit, display: 'block',
    objectPosition: x + '% ' + y + '%',
    ...(z > 1 ? { transform: 'scale(' + z + ')', transformOrigin: x + '% ' + y + '%' } : {}),
  };
}

// Image slot — stable slotId keyed into doc.assets (shared ids stay in sync, e.g. st-brand-logo).
// Click opens a file picker in edit mode; the image travels to the chrome as a data URL and
// comes back through the doc. Double-click a filled slot to set its focus & crop:
// drag to recompose, scroll to zoom, Esc (or Done) to finish. Absolute-fills its parent.
export default function ImageSlot({ slotId, assets, placeholder = '', fit = 'cover', preview = false }) {
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const img = useContext(ImgCtx);
  const src = assets && assets[slotId];
  const crop = (img.crops || {})[slotId];
  const cropping = !preview && img.cropTarget === slotId && !!src;
  const [draft, setDraft] = useState(null);
  const dragRef = useRef(null);

  // Enter/leave crop mode: seed the draft from the saved crop
  useEffect(() => {
    if (cropping) setDraft({ x: crop?.x ?? 50, y: crop?.y ?? 50, z: crop?.z ?? 1.15 });
    else setDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropping]);

  // Esc finishes cropping (commits the draft)
  useEffect(() => {
    if (!cropping) return;
    const kd = (ev) => { if (ev.key === 'Escape') finish(); };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropping, draft]);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const finish = () => {
    if (draft && img.onCrop) img.onCrop(slotId, { x: Math.round(draft.x), y: Math.round(draft.y), z: Math.round(draft.z * 100) / 100 });
    img.setCropTarget && img.setCropTarget(null);
  };

  const pick = (e) => {
    if (preview || cropping) return;
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

  const onDblClick = (e) => {
    if (preview || !src || !img.setCropTarget) return;
    e.stopPropagation();
    img.setCropTarget(slotId);
  };

  const onPointerDown = (e) => {
    if (!cropping) return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, d: { ...draft } };
    const move = (ev) => {
      const d0 = dragRef.current;
      if (!d0 || !boxRef.current) return;
      const r = boxRef.current.getBoundingClientRect();
      const z = d0.d.z || 1;
      setDraft({
        ...d0.d,
        x: clamp(d0.d.x - ((ev.clientX - d0.x) / Math.max(1, r.width)) * (120 / z), 0, 100),
        y: clamp(d0.d.y - ((ev.clientY - d0.y) / Math.max(1, r.height)) * (120 / z), 0, 100),
      });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Wheel-zoom needs preventDefault, and React wheel listeners are passive —
  // attach natively while cropping.
  useEffect(() => {
    if (!cropping || !boxRef.current) return;
    const el = boxRef.current;
    const onWheel = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setDraft((d) => (d ? { ...d, z: clamp(d.z - e.deltaY * 0.0015, 1, 4) } : d));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [cropping]);

  const active = cropping && draft ? draft : crop;

  return (
    <div
      ref={boxRef}
      onClick={cropping ? (e) => e.stopPropagation() : pick}
      onDoubleClick={onDblClick}
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        cursor: cropping ? 'grab' : preview ? 'default' : 'pointer',
        ...(cropping ? { touchAction: 'none' } : {}),
      }}
      title={preview || cropping ? undefined : 'Click to swap image · double-click to set focus & crop'}
    >
      {src ? (
        <img src={src} alt="" draggable={false} style={cropStyle(active, fit)} />
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
      {cropping && (
        <>
          <div style={{ position: 'absolute', inset: 0, outline: '3px solid #C6F035', outlineOffset: -3, pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '33.34% 33.34%' }} />
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, padding: '5px 11px', borderRadius: 99, background: '#1A1D12', color: '#f4f6ec', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.4px', pointerEvents: 'none' }}>
            DRAG TO REFRAME · SCROLL TO ZOOM
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); finish(); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 3, padding: '7px 16px', borderRadius: 99, background: '#C6F035', color: '#1A1D12', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 22px rgba(26,29,18,0.35)' }}
          >
            Done
          </div>
        </>
      )}
      {!preview && (
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={onFile} onClick={(e) => e.stopPropagation()} />
      )}
    </div>
  );
}
