'use client';
// The services system pages (DAKIO_SERVICES_WEBSITE_PLAN.md W1): /services —
// every service, live — and /s/<slug> — one service with its price, time,
// picture, description and the main button. Rendered by the public site and
// the Studio canvas. The words are the site's (siteText); the content is the
// store's own Services.
import Svc from '../sections/Svc';
import { baseStyles, sx } from '../theme';
import { siteText } from '../siteText';
import { priceWords, durationWords } from '../servicesText';

export const SERVICES_DEFAULTS = { v: 'list', price: true, time: true, cats: true, bg: 'base', sp: 'normal' };

/** /services: the Services section as a page, its words from doc.sys.services or the site's defaults. */
export function ServicesPage({ ctx, sys }) {
  const tx = siteText(ctx.theme?.lang);
  const props = { ...SERVICES_DEFAULTS, head: tx('svc.title'), sub: '', btn: '', ...((sys || {}).services || {}) };
  return <Svc sec={{ id: 'sys-services', type: 'svc', v: props.v, props }} ctx={ctx} />;
}

/** /s/<slug>: one service. */
export function ServicePage({ ctx, service }) {
  const tx = siteText(ctx.theme?.lang);
  const sec = { id: 'sys-service', type: 'svc', props: { bg: 'base', sp: 'normal' } };
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob } = ctx;
  if (!service) {
    return <div style={sx(s.pad + 'font-family:' + F.b + '; color:' + c.sub + ';')}>{tx('svc.gone')}</div>;
  }
  const time = durationWords(service.durationMin, tx);
  const fact = (label, value) => (value ? (
    <div style={sx('padding:14px 0; border-top:1px solid ' + c.line + '; display:flex; justify-content:space-between; gap:12px; font-family:' + F.b + '; font-size:14.5px;')}>
      <span style={{ color: c.sub }}>{label}</span><span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  ) : null);
  return (
    <div data-service-page={service.slug} style={sx(s.pad)}>
      <div onClick={() => ctx.onServices && ctx.onServices()} style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; cursor:pointer; margin-bottom:18px;')}>← {tx('svc.all')}</div>
      <div style={sx('display:grid; grid-template-columns:' + (mob || !service.imageUrl ? '1fr' : '1.05fr 0.95fr') + '; gap:' + (mob ? 22 : 48) + 'px; align-items:start;')}>
        {service.imageUrl ? <img src={ctx.optImg ? ctx.optImg(service.imageUrl) : service.imageUrl} alt={service.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: C.r, display: 'block' }} /> : null}
        <div style={{ minWidth: 0, maxWidth: 620 }}>
          {service.category ? <div style={sx('font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + '; margin-bottom:10px;')}>{service.category}</div> : null}
          <h1 style={sx(s.h2 + 'margin:0;')}>{service.name}</h1>
          <div style={sx('margin-top:18px;')}>
            {fact(tx('svc.price'), priceWords(service, tx))}
            {fact(tx('svc.time'), time)}
          </div>
          {service.description ? <div style={sx('margin-top:18px; font-family:' + F.b + '; font-size:15px; line-height:1.65; white-space:pre-wrap;')}>{service.description}</div> : null}
          <div style={{ marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div onClick={() => ctx.onServiceAction && ctx.onServiceAction(service, { fromPage: true })} style={sx(s.btn)}>{ctx.serviceActionLabel ? ctx.serviceActionLabel(service) : tx('svc.ask')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
