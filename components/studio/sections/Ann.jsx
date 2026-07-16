'use client';
import Editable from '../Editable';
import { baseStyles, sx } from '../theme';

// Announcement bar — static (centered message + underlined link) or marquee variant.
export default function Ann({ sec, ctx }) {
  const { F, padX, preview, isSel } = ctx;
  const p = sec.props;
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
          <Editable secId={sec.id} k="link" value={p.link} style={annLink} preview={preview} tag="span" />
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
