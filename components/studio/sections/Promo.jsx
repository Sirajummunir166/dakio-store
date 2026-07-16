'use client';
import { useEffect, useRef, useState } from 'react';
import Editable from '../Editable';
import { baseStyles, sx } from '../theme';

// Promo banner — band or card variant with code chip and live countdown.
export default function Promo({ sec, ctx }) {
  const { P, F, C, mob, padX, preview } = ctx;
  const p = sec.props;
  const { c, headFont } = baseStyles(sec, ctx);

  const cdOn = p.cd !== false;

  // Countdown target: the merchant's "Offer ends" moment (p.ends) when set,
  // otherwise a demo offset counting down from mount. The demo path tracks
  // elapsed-time-since-mount so SSR and the client's first render match; the
  // real-end path reads the clock, so its digits carry suppressHydrationWarning
  // (server vs client can differ by a second).
  const CD_OFFSET = (2 * 24 * 3600 + 14 * 3600 + 22 * 60) * 1000;
  const endsMs = (() => {
    if (!p.ends) return null;
    const t = new Date(p.ends).getTime();
    return isNaN(t) ? null : t;
  })();
  const startRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!cdOn) return;
    if (startRef.current === null) startRef.current = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(iv);
  }, [cdOn]);

  const inner = 'background:' + c.bg + '; color:' + c.fg + '; text-align:center;';
  let promoOuter, promoInner;
  if (sec.v === 'card') {
    promoOuter = 'padding:' + (mob ? 24 : 40) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)); background:' + P.bg + ';';
    promoInner = inner + 'padding:' + (mob ? 36 : 52) + 'px 28px; border-radius:' + C.r + 'px;';
  } else {
    promoOuter = '';
    promoInner = inner + 'padding:' + (mob ? 40 : 60) + 'px ' + padX + 'px;';
  }
  const promoHead = headFont + 'font-size:' + (mob ? 28 : 42) + 'px; line-height:1.08;';
  const promoSub = 'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 15) + 'px; color:' + c.sub + '; margin-top:12px; white-space:pre-wrap;';
  const codeChip = 'padding:11px 18px; border:1.5px dashed ' + c.sub + '; border-radius:' + C.btn + '; font-family:' + F.b + '; font-size:13.5px; font-weight:600; letter-spacing:0.4px;';
  const cdBox = 'min-width:' + (mob ? 52 : 62) + 'px; padding:10px 8px 8px; background:color-mix(in oklab, ' + c.fg + ' 10%, ' + c.bg + '); border-radius:' + C.rs + 'px; text-align:center;';
  const cdNum = 'font-family:' + F.b + '; font-weight:800; font-size:' + (mob ? 18 : 21) + 'px; font-variant-numeric:tabular-nums; line-height:1;';
  const cdLbl = 'font-family:' + F.b + '; font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:' + c.sub + '; margin-top:4px;';

  const diff = endsMs != null
    ? Math.max(0, endsMs - ((startRef.current ?? Date.now()) + elapsed))
    : Math.max(0, CD_OFFSET - elapsed);
  const z = (x) => String(x).padStart(2, '0');
  const boxes = [
    [z(Math.floor(diff / 86400000)), 'days'],
    [z(Math.floor(diff / 3600000) % 24), 'hrs'],
    [z(Math.floor(diff / 60000) % 60), 'min'],
    [z(Math.floor(diff / 1000) % 60), 'sec'],
  ];

  return (
    <div style={sx(promoOuter)}>
      <div style={sx(promoInner)}>
        <Editable secId={sec.id} k="head" value={p.head} style={promoHead} preview={preview} />
        <Editable secId={sec.id} k="sub" value={p.sub} style={promoSub} multiline preview={preview} />
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={sx(codeChip)}>
            Code: <Editable secId={sec.id} k="code" value={p.code} style={'font-weight:800;'} preview={preview} tag="span" />
          </div>
          {cdOn && (
            <div style={{ display: 'flex', gap: 7 }}>
              {boxes.map(([num, lbl]) => (
                <div key={lbl} style={sx(cdBox)}>
                  <div style={sx(cdNum)} suppressHydrationWarning>{num}</div>
                  <div style={sx(cdLbl)}>{lbl}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
