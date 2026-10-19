'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { headerWords } from '../SiteHeaderParts';
import { hoursRows } from '../hoursText';
import { subStyle } from './kit';

// Hours & location (W3): the opening hours — live from the store's booking
// hours when it has them, so the website never disagrees with what Nova
// books — the address with a map, and Call / Directions.

export default function Hours({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const lang = ctx.theme?.lang;
  const tx = siteText(lang);
  const live = hoursRows(ctx.business && ctx.business.hours, tx, lang);
  const addr = String(p.addr || '').trim();
  const phone = String(p.phone || '').replace(/\D/g, '');
  const tel = phone ? (phone.startsWith('0') ? '+88' + phone : '+' + phone) : null;
  const mapOn = p.map !== false && addr;
  const lbl = 'font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + ';';
  const val = 'font-family:' + F.b + '; font-size:14.5px; line-height:1.55; white-space:pre-wrap;';
  const link = (href, children, primary) => (preview
    ? <a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener" onClick={(e) => e.stopPropagation()} style={sx((primary ? s.btn : s.btnGhost) + 'text-decoration:none;')}>{children}</a>
    : <span style={sx(primary ? s.btn : s.btnGhost)}>{children}</span>);
  return (
    <div style={sx(s.pad)}>
      <div style={sx('display:grid; gap:' + (mob ? 26 : 56) + 'px; grid-template-columns:' + (mob || !mapOn ? '1fr' : '0.9fr 1.1fr') + '; align-items:start;')}>
        <div style={{ minWidth: 0 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
          {(p.sub || !preview) ? <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} /> : null}
          <div style={sx(lbl + 'margin-top:26px;')}>{tx('hours.hours')}</div>
          {live.length ? (
            <div data-hours-live style={{ marginTop: 8 }}>
              {live.map((r) => (
                <div key={r.label} style={sx('display:flex; justify-content:space-between; gap:14px; padding:9px 0; border-bottom:1px solid ' + c.line + '; font-family:' + F.b + '; font-size:14px;')}>
                  <span style={{ color: c.sub }}>{r.label}</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{r.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <Editable secId={sec.id} k="hoursText" value={p.hoursText} style={val + 'margin-top:8px;'} multiline preview={preview} />
          )}
          <div style={sx(lbl + 'margin-top:22px;')}>{tx('hours.where')}</div>
          <Editable secId={sec.id} k="addr" value={p.addr} style={val + 'margin-top:8px;'} multiline preview={preview} />
          {(p.phone || !preview) ? <Editable secId={sec.id} k="phone" value={p.phone} style={val + 'margin-top:6px; font-weight:600;'} preview={preview} /> : null}
          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tel ? link('tel:' + tel, headerWords(lang).call, true) : null}
            {addr ? link('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr), tx('hours.directions'), !tel) : null}
          </div>
        </div>
        {mapOn ? (
          <div style={{ position: 'relative', aspectRatio: mob ? '4/3' : '5/4', borderRadius: C.r, overflow: 'hidden', background: c.card, border: '1px solid ' + c.line }}>
            <iframe title={addr} src={'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed'} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: preview ? 'auto' : 'none' }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
