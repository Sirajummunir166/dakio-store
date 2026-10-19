'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { priceWords, durationWords, groupServices } from '../servicesText';

// The live Services list (DAKIO_SERVICES_WEBSITE_PLAN.md W1). It reads the
// store's Services (ctx.cat.services) — a price changed on the Services page
// changes the website; nothing is copied into the site document.
// Variants: cards (with a picture), list, menu (a price board). The button
// books the service once booking is on (W2), else opens its page.

export default function Svc({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const all = (ctx.cat && ctx.cat.services) || [];
  const v = sec.v || 'cards';
  const groups = p.cats !== false ? groupServices(all) : [{ name: null, items: all }];
  const showGroups = groups.length > 1 || (groups[0] && groups[0].name);
  const btnLabel = p.btn || tx('svc.book');
  const open = (sv) => (e) => { e.stopPropagation(); if (ctx.onService) ctx.onService(sv); };
  const act = (sv) => (e) => { e.stopPropagation(); if (ctx.onServiceAction) ctx.onServiceAction(sv); else if (ctx.onService) ctx.onService(sv); };

  const sub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; max-width:620px; white-space:pre-wrap;';
  const groupHead = 'font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + '; margin:30px 0 12px;';
  const name = s.headFont + 'font-size:' + s.hz(mob ? 17 : 19) + 'px; line-height:1.25; cursor:pointer;';
  const meta = 'font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + '; margin-top:4px;';
  const price = 'font-family:' + F.b + '; font-size:15px; font-weight:700; white-space:nowrap; font-variant-numeric:tabular-nums;';
  const desc = 'font-family:' + F.b + '; font-size:13.5px; line-height:1.55; color:' + c.sub + '; margin-top:8px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;';
  const smallBtn = 'display:inline-flex; align-items:center; padding:9px 18px; border-radius:' + C.btn + '; background:' + s.B.bg + '; color:' + s.B.fg + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap;';

  const priceLine = (sv) => [p.price !== false ? priceWords(sv, tx) : null, p.time !== false ? durationWords(sv.durationMin, tx) : null].filter(Boolean).join(' · ');

  const renderItem = (sv) => {
    if (v === 'menu') {
      return (
        <div key={sv.id} data-service={sv.slug} style={sx('display:flex; align-items:baseline; gap:12px; padding:14px 0; border-bottom:1px dashed ' + c.line + ';')}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div onClick={open(sv)} style={sx(name)}>{sv.name}</div>
            {p.time !== false && sv.durationMin ? <div style={sx(meta)}>{durationWords(sv.durationMin, tx)}</div> : null}
          </div>
          {p.price !== false ? <div style={sx(price)}>{priceWords(sv, tx)}</div> : null}
          <div onClick={act(sv)} style={sx(smallBtn)}>{btnLabel}</div>
        </div>
      );
    }
    if (v === 'list') {
      return (
        <div key={sv.id} data-service={sv.slug} style={sx('display:flex; gap:16px; align-items:' + (mob ? 'flex-start' : 'center') + '; padding:18px 0; border-top:1px solid ' + c.line + ';' + (mob ? 'flex-direction:column;' : ''))}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div onClick={open(sv)} style={sx(name)}>{sv.name}</div>
            <div style={sx(meta)}>{priceLine(sv)}</div>
            {sv.description ? <div style={sx(desc)}>{sv.description}</div> : null}
          </div>
          <div onClick={act(sv)} style={sx(smallBtn)}>{btnLabel}</div>
        </div>
      );
    }
    return (
      <div key={sv.id} data-service={sv.slug} style={sx('display:flex; flex-direction:column; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; overflow:hidden;' + s.sh)}>
        {sv.imageUrl ? <img src={ctx.optImg ? ctx.optImg(sv.imageUrl) : sv.imageUrl} alt={sv.name} loading="lazy" onClick={open(sv)} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', cursor: 'pointer' }} /> : null}
        <div style={sx('padding:18px; display:flex; flex-direction:column; gap:4px; flex:1;')}>
          <div onClick={open(sv)} style={sx(name)}>{sv.name}</div>
          <div style={sx(meta)}>{priceLine(sv)}</div>
          {sv.description ? <div style={sx(desc)}>{sv.description}</div> : null}
          <div style={{ flex: 1 }} />
          <div style={{ marginTop: 14, display: 'flex' }}><div onClick={act(sv)} style={sx(smallBtn)}>{btnLabel}</div></div>
        </div>
      </div>
    );
  };

  if (!all.length && ctx.isPublic) return null;
  const grid = v === 'cards' ? 'display:grid; grid-template-columns:' + (mob ? '1fr' : 'repeat(3, 1fr)') + '; gap:' + (mob ? 14 : 18) + 'px;' : '';

  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      {p.sub ? <Editable secId={sec.id} k="sub" value={p.sub} style={sub} multiline preview={preview} /> : null}
      {!all.length ? (
        <div style={sx('margin-top:22px; padding:22px; border-radius:' + C.r + 'px; border:1.5px dashed ' + c.line + '; font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + ';')}>{tx('svc.empty')}</div>
      ) : groups.map((g, i) => (
        <div key={g.name || 'all-' + i} style={{ marginTop: showGroups && g.name ? 0 : 22 }}>
          {showGroups && g.name ? <div style={sx(groupHead)}>{g.name}</div> : null}
          <div style={sx(grid)}>{g.items.map(renderItem)}</div>
        </div>
      ))}
    </div>
  );
}
