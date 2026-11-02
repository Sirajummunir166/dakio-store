'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';

// "@shop.name" or a pasted profile link → the profile URL; anything else → null.
export function instaProfileUrl(handle) {
  const h = String(handle || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? 'https://www.instagram.com/' + h + '/' : null;
}

export default function Insta({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;

  const instaHandle = 'font-family:' + F.b + '; font-size:13.5px; font-weight:800; color:' + s.accCol + '; cursor:pointer; white-space:nowrap;';
  const instaGrid = 'margin-top:26px; display:grid; grid-template-columns:repeat(' + (mob ? 3 : 6) + ',1fr); gap:' + (mob ? 6 : 10) + 'px;';
  const tile = 'aspect-ratio:1/1; border-radius:' + Math.min(C.rs, 10) + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;';

  // On the live store the handle and the tiles open the store's Instagram
  // profile — they were pictures of links (Store Studio audit SST-55).
  const profile = preview ? instaProfileUrl(p.handle) : null;
  const Tile = profile ? 'a' : 'div';
  const tileLink = profile ? { href: profile, target: '_blank', rel: 'noopener', 'aria-label': p.handle } : {};

  return (
    <div style={sx(s.pad)}>
      <div style={sx('display:flex; align-items:baseline; justify-content:space-between; gap:16px;')}>
        <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
        {profile ? (
          <a href={profile} target="_blank" rel="noopener" style={{ ...sx(instaHandle), textDecoration: 'none' }}>{p.handle}</a>
        ) : (
          <Editable secId={sec.id} k="handle" value={p.handle} style={instaHandle} preview={preview} />
        )}
      </div>
      <div style={sx(instaGrid)}>
        {[0, 1, 2, 3, 4, 5].map((gi) => (
          <Tile key={gi} style={{ ...sx(tile), display: 'block' }} {...tileLink}>
            <ImageSlot slotId={'st-ig-' + gi} assets={assets} placeholder="IG post" fit="cover" preview={preview} aspect="1/1" hint="Square, ~1080×1080px." />
          </Tile>
        ))}
      </div>
    </div>
  );
}
