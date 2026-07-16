'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';

export default function Faq({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  const [open, setOpen] = useState({});

  return (
    <div style={sx(s.padNarrow)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <div style={{ marginTop: 22 }}>
        {(p.items || []).map((f, fi) => {
          const isOpen = !!open[fi];
          return (
            <div key={fi} style={sx('border-bottom:1px solid ' + c.line + ';')}>
              <div
                onClick={(e) => { e.stopPropagation(); setOpen((o) => ({ ...o, [fi]: !isOpen })); }}
                style={sx('display:flex; align-items:center; justify-content:space-between; gap:16px; cursor:pointer; padding:16px 2px;')}
              >
                <Editable
                  secId={sec.id} k={['items', fi, 'q']} value={f.q} preview={preview}
                  style={'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; font-weight:700; flex:1; min-width:0;'}
                />
                <div style={sx('display:flex; color:' + c.sub + '; transition:transform .2s ease; transform:rotate(' + (isOpen ? 180 : 0) + 'deg); flex-shrink:0;')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
              {isOpen && (
                <Editable
                  secId={sec.id} k={['items', fi, 'a']} value={f.a} multiline preview={preview}
                  style={'padding:0 2px 18px; font-family:' + F.b + '; font-size:13.5px; line-height:1.65; color:' + c.sub + '; white-space:pre-wrap;'}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
