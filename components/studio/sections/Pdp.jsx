'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';

export default function Pdp({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c, B } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;

  const pdpGrid = 'display:grid; grid-template-columns:' + (mob ? '1fr' : '1.02fr 0.98fr') + '; gap:' + (mob ? 26 : 64) + 'px; align-items:start;';
  const pdpMain = 'aspect-ratio:4/5; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';';
  const pdpThumb = 'flex:1; aspect-ratio:1/1; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;';
  const pdpName = s.headFont + 'font-size:' + (mob ? 30 : 40) + 'px; line-height:1.08; min-width:0; overflow-wrap:break-word;';
  const pdpPrice = 'font-family:' + F.b + '; font-size:' + (mob ? 20 : 23) + 'px; font-weight:800; font-variant-numeric:tabular-nums;';
  const pdpWas = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; color:' + c.sub + '; text-decoration:line-through; font-variant-numeric:tabular-nums;';
  const pdpDesc = 'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; line-height:1.7; color:' + c.sub + '; margin-top:16px; white-space:pre-wrap;';
  const pdpLbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:24px;';
  const sizes = ['S', 'M', 'L', 'XL'].map((z, zi) => ({
    n: z,
    style: 'min-width:44px; padding:10px 0; text-align:center; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (zi === 1 ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;' + (zi === 1 ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''),
  }));
  const qtyBox = 'display:flex; align-items:center; gap:14px; padding:0 16px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:14px; user-select:none; cursor:pointer;';
  const pdpBtn = 'flex:1; display:flex; align-items:center; justify-content:center; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:14.5px; cursor:pointer; white-space:nowrap;';
  const pdpNote = 'margin-top:14px; display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';';
  const pdpRows = 'margin-top:26px; border-top:1px solid ' + c.line + ';';
  const pdpRow = 'padding:15px 2px; border-bottom:1px solid ' + c.line + '; display:flex; align-items:center; justify-content:space-between; font-family:' + F.b + '; font-size:13.5px; font-weight:700; cursor:pointer;';

  const chev = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
  );

  return (
    <div style={sx(s.pad)}>
      <div style={sx(pdpGrid)}>
        <div style={{ minWidth: 0 }}>
          <div style={sx(pdpMain)}>
            <ImageSlot slotId={'st-pdp-' + sec.id} assets={assets} placeholder="Main product photo" fit="cover" preview={preview} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[0, 1, 2].map((ti) => (
              <div key={ti} style={sx(pdpThumb)}>
                <ImageSlot slotId={'st-pdpt-' + ti} assets={assets} placeholder="Alt view" fit="cover" preview={preview} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <Editable secId={sec.id} k="name" value={p.name} style={pdpName} preview={preview} />
          <div style={sx('display:flex; align-items:baseline; gap:12px; margin-top:12px;')}>
            <Editable secId={sec.id} k="price" value={p.price} style={pdpPrice} preview={preview} />
            <Editable secId={sec.id} k="was" value={p.was} style={pdpWas} preview={preview} />
          </div>
          <Editable secId={sec.id} k="desc" value={p.desc} style={pdpDesc} multiline preview={preview} />
          <div style={sx(pdpLbl)}>SIZE</div>
          <div style={sx('display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;')}>
            {sizes.map((z) => (
              <div key={z.n} style={sx(z.style)}>{z.n}</div>
            ))}
          </div>
          <div style={sx('display:flex; gap:10px; margin-top:24px; align-items:stretch;')}>
            <div style={sx(qtyBox)}><span>−</span><span style={{ fontWeight: 800 }}>1</span><span>+</span></div>
            <div style={sx(pdpBtn)}>
              <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
            </div>
          </div>
          <div style={sx(pdpNote)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5h13v11H1zM14 9h4l3 3v4h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
            <Editable secId={sec.id} k="note" value={p.note} style={''} tag="span" preview={preview} />
          </div>
          <div style={sx(pdpRows)}>
            <div style={sx(pdpRow)}>Fabric &amp; care{chev}</div>
            <div style={sx(pdpRow)}>Delivery &amp; returns{chev}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
