'use client';
import Editable from '../Editable';
import { baseStyles, sx } from '../theme';

// Announcement bar — static (centered message + underlined link) or marquee variant.
export default function Ann({ sec, ctx }) {
  const { F, padX, preview, isSel } = ctx;
  // p.to = link destination (set in the inspector); p.link stays the visible label
  // Cut 8 (DAKIO_NAVIGATION_PLAN.md §7): while a campaign with banner text is
  // Live, the store read carries it as `campaignBanner` and it takes this bar
  // on the public site — the founder's static message returns when it ends.
  const campaign = ctx.isPublic && ctx.store && ctx.store.campaignBanner && ctx.store.campaignBanner.text ? ctx.store.campaignBanner.text : null;
  const p = campaign ? { ...sec.props, msg: campaign, link: '' } : sec.props;
  const { c } = baseStyles(sec, ctx);

  const annWrap = 'padding:10px ' + padX + 'px; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:12.5px; font-weight:600;';
  const annLink = 'text-decoration:underline; text-underline-offset:3px; font-weight:800; cursor:pointer; white-space:nowrap;';
  const marqStyle = 'display:inline-flex; animation:marquee 16s linear infinite; animation-play-state:' + (isSel ? 'paused' : 'running') + ';';

  const marquee = sec.v === 'marquee';

  return (
    <div style={sx(annWrap)}>
      {!marquee && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Editable secId={sec.id} k="msg" value={p.msg} style={''} preview={preview} tag="span" />
          <Editable
            secId={sec.id} k="link" value={p.link} style={annLink} preview={preview} tag="span"
            onClick={preview ? (ev) => { ev.stopPropagation(); ctx.onLink && ctx.onLink(p.to); } : undefined}
          />
        </div>
      )}
      {marquee && (
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={sx(marqStyle)}>
            <Editable secId={sec.id} k="msg" value={p.msg} style={'padding:0 34px;'} preview={preview} tag="span" />
            <span style={sx('padding:0 34px;')}>{p.msg}</span>
            <span style={sx('padding:0 34px;')}>{p.msg}</span>
            <span style={sx('padding:0 34px;')}>{p.msg}</span>
            <span style={sx('padding:0 34px;')}>{p.msg}</span>
            <span style={sx('padding:0 34px;')}>{p.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
