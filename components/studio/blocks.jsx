'use client';
import Editable from './Editable';
import { sx, blockStyles } from './theme';

// Phase 3 blocks — badge chip, second (ghost) button and trust row.
// Toggled per-section via props.badgeOn / cta2On / trustOn; all inline-editable
// and theme-aware. Rendered by hero/story/promo/mail.

export function BadgeChip({ sec, ctx, base }) {
  if (!sec.props.badgeOn) return null;
  const bs = blockStyles(sec, ctx, base);
  return (
    <div style={sx(bs.badgeRow)}>
      <Editable secId={sec.id} k="badge" value={sec.props.badge} style={bs.badge} preview={ctx.preview} tag="span" />
    </div>
  );
}

// The quieter second action beside the primary CTA. Caller renders it inside the
// same flex row as the primary button; style = the section's ghost button.
export function Cta2Btn({ sec, ctx, base, style }) {
  if (!sec.props.cta2On) return null;
  const p = sec.props;
  return (
    <div
      style={sx(style || base.btnGhost)}
      onClick={ctx.preview ? (ev) => { ev.stopPropagation(); ctx.onLink && ctx.onLink(p.to2); } : undefined}
    >
      <Editable secId={sec.id} k="cta2" value={p.cta2} style={''} preview={ctx.preview} tag="span" />
    </div>
  );
}

export function TrustRow({ sec, ctx, base }) {
  if (!sec.props.trustOn) return null;
  const bs = blockStyles(sec, ctx, base);
  const items = sec.props.trust || [];
  return (
    <div style={sx(bs.trustRow)}>
      {items.map((t, i) => (
        <div key={i} style={sx(bs.trustItem)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={bs.trustTick} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <Editable secId={sec.id} k={['trust', i]} value={t} style={''} preview={ctx.preview} tag="span" />
        </div>
      ))}
    </div>
  );
}
