'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';

export default function Footer({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, padX, preview, theme, menus, assets, onGoPage } = ctx;
  const p = sec.props;
  const cols = sec.v !== 'min';

  const footWrap = 'padding:' + (mob ? 44 : 68) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + (mob ? 26 : 34) + 'px; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + ';';
  const footTop = 'display:flex; gap:' + (mob ? 36 : 48) + 'px; justify-content:space-between; flex-wrap:wrap;' + (cols ? '' : ' justify-content:center; text-align:center;');
  const footBrand = 'font-family:' + F.h + '; font-weight:' + F.hw + '; font-size:30px; letter-spacing:' + F.ls + ';';
  const footTag = 'margin-top:12px; font-size:13.5px; line-height:1.6; color:' + c.sub + '; max-width:300px; white-space:pre-wrap;' + (cols ? '' : ' margin-left:auto; margin-right:auto;');
  const footColH = 'font-size:10.5px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + ';';
  const footLink = 'font-size:13px; cursor:pointer; opacity:0.88;';
  const footBottom = 'margin-top:' + (mob ? 38 : 56) + 'px; padding-top:20px; border-top:1px solid ' + c.line + '; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; font-size:12px; color:' + c.sub + ';';
  const payChip = 'padding:5px 10px; border:1px solid ' + c.line + '; border-radius:6px; font-size:10.5px; font-weight:700; letter-spacing:0.4px; color:' + c.sub + ';';
  const fLinks = (menus && menus.footer) || [];
  const footGrid = 'margin-top:14px; display:grid; grid-auto-flow:column; grid-template-rows:repeat(' + Math.max(1, Math.ceil(fLinks.length / 2)) + ', auto); gap:9px ' + (mob ? 40 : 64) + 'px;';
  const brandText = (theme.brandMode ?? 'text') !== 'image';

  return (
    <div style={sx(footWrap)}>
      <div style={sx(footTop)}>
        <div style={{ minWidth: 0, maxWidth: 340 }}>
          {brandText ? (
            <Editable secId="__brand" k="brand" value={theme.brandName ?? 'Shahrqee'} style={footBrand} preview={preview} />
          ) : (
            <div style={{ height: 40, width: 170, maxWidth: '100%', position: 'relative' }}>
              <ImageSlot slotId="st-brand-logo" assets={assets} fit="contain" placeholder="Logo" preview={preview} />
            </div>
          )}
          <Editable secId={sec.id} k="tag" value={p.tag} style={footTag} multiline preview={preview} />
        </div>
        {cols && (
          <div style={{ minWidth: 0 }}>
            <div style={sx(footColH)}>Browse</div>
            <div style={sx(footGrid)}>
              {fLinks.map((it, i) => (
                <div
                  key={it.id ?? i}
                  style={sx(footLink)}
                  onClick={(e) => {
                    if (preview && it.link.t === 'page') { e.stopPropagation(); onGoPage(it.link.ref); }
                  }}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={sx(footBottom)}>
        <Editable secId={sec.id} k="note" value={p.note} style={'min-width:0;'} preview={preview} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['bKash', 'Nagad', 'VISA', 'COD'].map((n) => (
            <div key={n} style={sx(payChip)}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
