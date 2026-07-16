'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';

export default function Contact({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, C, mob, preview } = ctx;
  const p = sec.props;
  const split = sec.v !== 'center';

  const contactGrid = 'display:grid; grid-template-columns:' + ((mob || sec.v === 'center') ? '1fr' : '1.15fr 0.85fr') + '; gap:' + (mob ? 30 : 64) + 'px; align-items:start;' + (sec.v === 'center' ? ' max-width:560px; margin:0 auto;' : '');
  const contactSub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:12px; max-width:420px; white-space:pre-wrap;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';
  const cFake = inp + 'height:96px; color:' + c.sub + '; opacity:0.75; cursor:text;';
  const contactCard = 'padding:26px 24px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';';
  const cLbl = 'font-family:' + F.b + '; font-size:10px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + ';';
  const cLbl2 = cLbl + 'margin-top:18px;';
  const cVal = 'font-family:' + F.b + '; font-size:14.5px; font-weight:600; margin-top:6px; white-space:pre-wrap;';
  const waChip = 'margin-top:22px; display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:' + C.btn + '; background:' + P.accent + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer;';

  return (
    <div style={sx(s.pad)}>
      <div style={sx(contactGrid)}>
        <div style={{ minWidth: 0 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
          <Editable secId={sec.id} k="sub" value={p.sub} style={contactSub} multiline preview={preview} />
          <div style={sx('margin-top:26px; display:flex; flex-direction:column; gap:10px; max-width:440px;')}>
            <input placeholder="Your name" style={sx(inp)} onClick={(e) => e.stopPropagation()} />
            <input placeholder="Mobile number" style={sx(inp)} onClick={(e) => e.stopPropagation()} />
            <div style={sx(cFake)}>How can we help?</div>
            <div style={{ marginTop: 4, display: 'flex' }}>
              <div style={sx(s.btn)}>
                <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
              </div>
            </div>
          </div>
        </div>
        {split && (
          <div style={sx(contactCard)}>
            <div style={sx(cLbl)}>VISIT</div>
            <Editable secId={sec.id} k="addr" value={p.addr} style={cVal} multiline preview={preview} />
            <div style={sx(cLbl2)}>CALL / WHATSAPP</div>
            <Editable secId={sec.id} k="phone" value={p.phone} style={cVal} preview={preview} />
            <div style={sx(cLbl2)}>HOURS</div>
            <Editable secId={sec.id} k="hours" value={p.hours} style={cVal} preview={preview} />
            <div style={sx(waChip)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4v9z" /></svg>
              Chat on WhatsApp
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
