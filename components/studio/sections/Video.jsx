'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import { videoEmbed } from '../videoEmbed';
import { siteText } from '../siteText';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';

export default function Video({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, C, mob, preview, assets } = ctx;
  const p = sec.props;

  const videoBox = 'position:relative; margin:26px auto 0; aspect-ratio:16/9; border-radius:' + C.r + 'px; overflow:hidden; background:' + c.card + ';' + (sec.v === 'inset' ? ' max-width:860px;' : '');
  const playBtn = 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:' + (mob ? 54 : 68) + 'px; height:' + (mob ? 54 : 68) + 'px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; display:flex; align-items:center; justify-content:center; box-shadow:0 14px 40px rgba(10,11,8,0.35); pointer-events:none; z-index:2;';
  const videoCap = 'text-align:center; margin-top:16px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';';

  // The video plays in place (W0) when the section has a YouTube, Vimeo or
  // Facebook link (props.url); another link opens in a new tab; none = a poster.
  const tx = siteText(ctx.theme?.lang);
  const embed = videoEmbed(p.url);
  const [playing, setPlaying] = useState(false);
  const canPlay = preview && !!p.url;
  const play = (e) => {
    if (!canPlay) return;
    e.stopPropagation();
    if (embed) setPlaying(true);
    else window.open(p.url, '_blank', 'noopener');
  };

  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2Center} preview={preview} />
      <div style={{ ...sx(videoBox), ...(canPlay ? { cursor: 'pointer' } : {}) }} onClick={play} role={canPlay ? 'button' : undefined} aria-label={canPlay ? tx('video.play') : undefined} tabIndex={canPlay ? 0 : undefined} onKeyDown={(e) => { if (canPlay && (e.key === 'Enter' || e.key === ' ')) play(e); }}>
        {playing && embed ? (
          <iframe src={embed.src} title={p.head || tx('video.play')} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, zIndex: 3 }} />
        ) : null}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImageSlot slotId={'st-video-' + sec.id} assets={assets} placeholder={tx('video.poster')} fit="cover" preview={preview} aspect="16/9" hint="Widescreen, ~1600×900px — the thumbnail shown before play." />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,11,8,0.25)', pointerEvents: 'none' }} />
        <div style={sx(playBtn)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}><path d="M8 5.5v13l11-6.5L8 5.5z" /></svg>
        </div>
      </div>
      <Editable secId={sec.id} k="cap" value={p.cap} style={videoCap} preview={preview} />
    </div>
  );
}
