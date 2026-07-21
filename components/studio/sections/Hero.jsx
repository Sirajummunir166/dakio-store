'use client';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx } from '../theme';
import { BadgeChip, Cta2Btn, TrustRow } from '../blocks';

// Hero — split (text + image), bleed (full-bleed image with scrim) or min (centered) variants.
export default function Hero({ sec, ctx }) {
  const { F, C, mob, padX, preview, assets } = ctx;
  const p = sec.props;
  const base = baseStyles(sec, ctx);
  const { c, headFont, accCol, btn: baseBtn, padCenter, hz, sh, denM } = base;

  const split = sec.v === 'split';
  const bleed = sec.v === 'bleed';
  const min = sec.v === 'min';
  const imgId = 'st-hero-' + sec.id;

  const pad = 'padding:' + Math.round((mob ? 46 : 84) * denM) + 'px max(' + padX + 'px, calc((100% - 1120px)/2));';
  const heroGrid = 'display:grid; grid-template-columns:' + (mob ? '1fr' : '1.05fr 1fr') + '; gap:' + (mob ? 30 : 60) + 'px; align-items:center;';
  const eyebrow = 'font-family:' + F.b + '; font-size:11.5px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:' + accCol + ';';
  const heroHead = headFont + 'font-size:' + hz(mob ? 38 : 58) + 'px; line-height:1.04; margin-top:14px; min-width:0; overflow-wrap:break-word;';
  const heroSub = 'font-family:' + F.b + '; font-size:' + (mob ? 14.5 : 16.5) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:16px; max-width:460px; white-space:pre-wrap;';
  const heroImgWrap = 'aspect-ratio:' + (mob ? '4/3' : '4/5') + '; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + sh;
  const bleedWrap = 'position:relative; height:' + (mob ? 460 : 580) + 'px; overflow:hidden;';
  const bleedText = 'position:absolute; left:' + padX + 'px; right:' + padX + 'px; bottom:' + (mob ? 36 : 56) + 'px; z-index:2; max-width:640px;';
  const bleedEyebrow = 'font-family:' + F.b + '; font-size:11.5px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.8);';
  const bleedHead = headFont + 'font-size:' + hz(mob ? 36 : 58) + 'px; line-height:1.04; margin-top:12px; color:#FFFFFF;';
  const btn = bleed
    ? 'display:inline-flex; align-items:center; padding:' + (mob ? '12px 22px' : '14px 28px') + '; border-radius:' + C.btn + '; background:rgba(255,255,255,0.96); color:#17180F; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13.5 : 14.5) + 'px; cursor:pointer;'
    : baseBtn;
  const cta2Bleed = 'display:inline-flex; align-items:center; padding:' + (mob ? '11px 20px' : '13px 26px') + '; border-radius:' + C.btn + '; border:1.5px solid rgba(255,255,255,0.65); color:#FFFFFF; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13 : 14) + 'px; cursor:pointer;';
  const minHead = headFont + 'font-size:' + hz(mob ? 40 : 68) + 'px; line-height:1.03; margin-top:14px; overflow-wrap:break-word;';
  const minSub = 'font-family:' + F.b + '; font-size:' + (mob ? 14.5 : 17) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:18px; max-width:520px; margin-left:auto; margin-right:auto; white-space:pre-wrap;';

  const ctaRow = (mt, center) => ({ marginTop: mt, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', ...(center ? { justifyContent: 'center' } : {}) });

  return (
    <>
      {split && (
        <div style={sx(pad)}>
          <div style={sx(heroGrid)}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <BadgeChip sec={sec} ctx={ctx} base={base} />
              <Editable secId={sec.id} k="eyebrow" value={p.eyebrow} style={eyebrow} preview={preview} />
              <Editable secId={sec.id} k="head" value={p.head} style={heroHead} preview={preview} />
              <Editable secId={sec.id} k="sub" value={p.sub} style={heroSub} multiline preview={preview} />
              <div style={ctaRow(26)}>
                <div style={sx(btn)} onClick={preview ? (ev) => { ev.stopPropagation(); ctx.onLink && ctx.onLink(p.to); } : undefined}>
                  <Editable secId={sec.id} k="cta" value={p.cta} style={''} preview={preview} tag="span" />
                </div>
                <Cta2Btn sec={sec} ctx={ctx} base={base} />
              </div>
              <TrustRow sec={sec} ctx={ctx} base={base} />
            </div>
            <div style={sx(heroImgWrap)}>
              <ImageSlot slotId={imgId} assets={assets} fit="cover" placeholder="Hero image — your best product shot" preview={preview} />
            </div>
          </div>
        </div>
      )}
      {bleed && (
        <div style={sx(bleedWrap)}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <ImageSlot slotId={imgId} assets={assets} fit="cover" placeholder="Full-bleed hero image" preview={preview} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,13,9,0.72), rgba(12,13,9,0.08) 60%)', pointerEvents: 'none' }} />
          <div style={sx(bleedText)}>
            <BadgeChip sec={sec} ctx={ctx} base={base} />
            <Editable secId={sec.id} k="eyebrow" value={p.eyebrow} style={bleedEyebrow} preview={preview} />
            <Editable secId={sec.id} k="head" value={p.head} style={bleedHead} preview={preview} />
            <div style={ctaRow(20)}>
              <div style={sx(btn)} onClick={preview ? (ev) => { ev.stopPropagation(); ctx.onLink && ctx.onLink(p.to); } : undefined}>
                <Editable secId={sec.id} k="cta" value={p.cta} style={''} preview={preview} tag="span" />
              </div>
              <Cta2Btn sec={sec} ctx={ctx} base={base} style={cta2Bleed} />
            </div>
            <TrustRow sec={sec} ctx={ctx} base={{ ...base, c: { ...c, sub: 'rgba(255,255,255,0.85)' }, accCol: 'rgba(255,255,255,0.9)' }} />
          </div>
        </div>
      )}
      {min && (
        <div style={sx(padCenter)}>
          {p.badgeOn && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <BadgeChip sec={sec} ctx={ctx} base={base} />
            </div>
          )}
          <Editable secId={sec.id} k="eyebrow" value={p.eyebrow} style={eyebrow} preview={preview} />
          <Editable secId={sec.id} k="head" value={p.head} style={minHead} preview={preview} />
          <Editable secId={sec.id} k="sub" value={p.sub} style={minSub} multiline preview={preview} />
          <div style={ctaRow(28, true)}>
            <div style={sx(btn)} onClick={preview ? (ev) => { ev.stopPropagation(); ctx.onLink && ctx.onLink(p.to); } : undefined}>
              <Editable secId={sec.id} k="cta" value={p.cta} style={''} preview={preview} tag="span" />
            </div>
            <Cta2Btn sec={sec} ctx={ctx} base={base} />
          </div>
          {p.trustOn && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TrustRow sec={sec} ctx={ctx} base={base} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
