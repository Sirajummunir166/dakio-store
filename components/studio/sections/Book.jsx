'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import BookingFlow from '../booking/BookingFlow';

// The Booking section (DAKIO_SERVICES_WEBSITE_PLAN.md W2): booking inline on
// any page — the same flow as the /book page. `props.svc` starts it on one
// service (its id), else the client picks.

export default function Book({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const sub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; max-width:560px; white-space:pre-wrap;';
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head ?? tx('book.title')} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub ?? tx('book.sub')} style={sub} multiline preview={preview} />
      <div style={{ marginTop: mob ? 22 : 30 }}>
        <BookingFlow ctx={ctx} c={c} s={s} initialService={p.svc && p.svc !== 'any' ? p.svc : null} />
      </div>
    </div>
  );
}
