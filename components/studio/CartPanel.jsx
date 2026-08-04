'use client';
// Cart preview panel (Phase 8/10 follow-up) — the slide-in drawer shared by
// the header cart icon and every "Add to cart" action across Store Studio
// system pages. Themed by the storefront's own tokens (co/btnColors/sx from
// theme.js), not a fixed theme package's CSS, and reuses the exact bag/total
// math CartPage and CheckoutPage already use so the numbers never drift.
import { useEffect } from 'react';
import { co, btnColors, sx } from './theme';
import { fmtPr } from './catalog';
import { setQty } from './cartStore';
import { useBag, bagTotals, FREE_DLV_OVER } from './system/CommercePages';
import ImageSlot from './ImageSlot';

export default function CartPanel({ ctx, open, onClose }) {
  const { P, F, C, mob } = ctx;
  const c = co('card', P);
  const B = btnColors('base', P);
  const bag = useBag(ctx);
  const { sub, dlv, total } = bagTotals(bag);
  const count = bag.reduce((n, l) => n + l.qty, 0);
  const remaining = Math.max(0, FREE_DLV_OVER - sub);
  const progress = Math.min(100, (sub / FREE_DLV_OVER) * 100);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const change = (l, d) => { if (ctx.storeSlug) setQty(ctx.storeSlug, l.pid, l.size, l.qty + d); };
  const remove = (l) => { if (ctx.storeSlug) setQty(ctx.storeSlug, l.pid, l.size, 0); };
  const goProduct = (l) => { onClose(); ctx.onProduct && ctx.onProduct(l.p); };
  const goCheckout = () => { onClose(); ctx.onCheckout && ctx.onCheckout(); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,11,8,0.45)', animation: 'cpFade .2s ease both' }} />
      <aside style={sx('position:absolute; top:0; right:0; bottom:0; width:' + (mob ? '100%' : '420px') + '; max-width:100%; background:' + c.bg + '; color:' + c.fg + '; display:flex; flex-direction:column; box-shadow:-30px 0 70px rgba(15,16,10,0.25); animation:cpSlide .25s cubic-bezier(.16,1,.3,1) both;')}>
        <div style={sx('display:flex; align-items:center; justify-content:space-between; padding:' + (mob ? '18px 20px' : '22px 26px') + '; border-bottom:1px solid ' + c.line + ';')}>
          <div style={sx('font-family:' + F.h + '; font-weight:' + F.hw + '; font-size:19px;')}>Your Cart{count > 0 ? ' (' + count + ')' : ''}</div>
          <div onClick={onClose} style={sx('width:32px; height:32px; border-radius:99px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:' + c.card + ';')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </div>
        </div>

        {bag.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, marginBottom: 16 }}><path d="M6 7h12l1 14H5L6 7zM9 10V6a3 3 0 016 0v4" /></svg>
            <div style={sx('font-family:' + F.h + '; font-weight:' + F.hw + '; font-size:17px;')}>Your cart is empty</div>
            <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px; line-height:1.6;')}>Add something you love — free delivery over {fmtPr(FREE_DLV_OVER)}.</div>
            <div onClick={onClose} style={sx('margin-top:20px; padding:12px 24px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer;')}>Continue shopping</div>
          </div>
        ) : (
          <>
            <div style={sx('padding:' + (mob ? '14px 20px' : '16px 26px') + ';')}>
              {dlv === 0 ? (
                <div style={sx('display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:' + P.accent + ';')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  You qualify for free delivery
                </div>
              ) : (
                <>
                  <div style={sx('height:5px; border-radius:99px; background:' + c.line + '; overflow:hidden;')}>
                    <div style={sx('height:100%; border-radius:99px; background:' + P.accent + '; width:' + progress + '%; transition:width .3s ease;')} />
                  </div>
                  <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + c.sub + '; margin-top:9px;')}>Add {fmtPr(remaining)} more for <b style={{ color: c.fg }}>free delivery</b></div>
                </>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '0 20px' : '0 26px' }}>
              {bag.map((l, i) => (
                <div key={l.pid + ':' + (l.size || '')} style={sx('display:flex; gap:12px; padding:16px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                  <div onClick={() => goProduct(l)} style={sx('width:64px; height:80px; flex-shrink:0; border-radius:' + Math.min(C.rs, 12) + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;')}>
                    <ImageSlot slotId={'st-prod-' + l.p.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + l.p.id]: (ctx.assets || {})['st-prod-' + l.p.id] || l.p.img }} fit="cover" placeholder="" preview />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div onClick={() => goProduct(l)} style={sx('font-family:' + F.b + '; font-size:13.5px; font-weight:700; cursor:pointer;')}>{l.p.n}</div>
                    {l.size && <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:3px;')}>Size {l.size}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div onClick={() => change(l, -1)} style={sx('width:24px; height:24px; border-radius:7px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:12px;')}>−</div>
                        <div style={{ minWidth: 16, textAlign: 'center', fontSize: 12.5, fontWeight: 800 }}>{l.qty}</div>
                        <div onClick={() => change(l, 1)} style={sx('width:24px; height:24px; border-radius:7px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:12px;')}>+</div>
                      </div>
                      <div style={sx('font-family:' + F.b + '; font-size:13.5px; font-weight:800; font-variant-numeric:tabular-nums;')}>{fmtPr(l.p.pr * l.qty)}</div>
                    </div>
                  </div>
                  <div onClick={() => remove(l)} style={sx('flex-shrink:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:' + c.sub + ';')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </div>
                </div>
              ))}
            </div>

            <div style={sx('padding:' + (mob ? '18px 20px' : '20px 26px') + '; border-top:1px solid ' + c.line + ';')}>
              <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-bottom:6px;')}>
                <span>Subtotal</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(sub)}</span>
              </div>
              <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-bottom:12px;')}>
                <span>Shipping</span><span>{dlv === 0 ? 'Free' : fmtPr(dlv)}</span>
              </div>
              <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:16px; font-weight:800; padding-top:12px; border-top:1px solid ' + c.line + '; margin-bottom:16px;')}>
                <span>Total</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(total)}</span>
              </div>
              <div onClick={goCheckout} style={sx('display:flex; align-items:center; justify-content:center; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14.5px; cursor:pointer;')}>Checkout</div>
              <div style={sx('text-align:center; margin-top:12px; font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + ';')}>bKash · Nagad · Cash on Delivery</div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
