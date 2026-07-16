'use client';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx } from '../theme';

// Image + text — 50/50 grid; 'right' variant flips the image to the right on desktop.
export default function Story({ sec, ctx }) {
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;
  const { c, pad, h2, btnGhost } = baseStyles(sec, ctx);

  const storyGrid = 'display:grid; grid-template-columns:' + (mob ? '1fr' : '1fr 1fr') + '; gap:' + (mob ? 26 : 60) + 'px; align-items:center;';
  const storyImgWrap = 'aspect-ratio:4/3.4; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + (sec.v === 'right' && !mob ? ' order:2;' : '');
  const storyBody = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15.5) + 'px; line-height:1.7; color:' + c.sub + '; margin-top:16px; white-space:pre-wrap;';

  return (
    <div style={sx(pad)}>
      <div style={sx(storyGrid)}>
        <div style={sx(storyImgWrap)}>
          <ImageSlot slotId={'st-story-' + sec.id} assets={assets} fit="cover" placeholder="Story image — workshop, founder, fabric detail" preview={preview} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={h2} preview={preview} />
          <Editable secId={sec.id} k="body" value={p.body} style={storyBody} multiline preview={preview} />
          <div style={{ marginTop: 22, display: 'flex' }}>
            <div style={sx(btnGhost)}>
              <Editable secId={sec.id} k="cta" value={p.cta} style={''} preview={preview} tag="span" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
