'use client';
import { baseStyles, sx } from '../theme';
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

  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2Center} preview={preview} />
      <div style={sx(videoBox)}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImageSlot slotId={'st-video-' + sec.id} assets={assets} placeholder="Video poster frame" fit="cover" preview={preview} />
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
