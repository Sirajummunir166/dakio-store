'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';

export default function Mail({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, C, mob, padX, preview } = ctx;
  const p = sec.props;

  const inner = 'background:' + c.bg + '; color:' + c.fg + '; text-align:center;';
  let mailOuter, mailInner;
  if (sec.v === 'card') {
    mailOuter = 'padding:' + (mob ? 24 : 40) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)); background:' + P.bg + ';';
    mailInner = inner + 'padding:' + (mob ? 38 : 56) + 'px 28px; border-radius:' + C.r + 'px;';
  } else {
    mailOuter = '';
    mailInner = inner + 'padding:' + (mob ? 46 : 68) + 'px ' + padX + 'px;';
  }
  const mailHead = s.headFont + 'font-size:' + (mob ? 26 : 36) + 'px; line-height:1.1;';
  const mailSub = 'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; color:' + c.sub + '; margin-top:12px; max-width:440px; margin-left:auto; margin-right:auto; white-space:pre-wrap;';
  const mailRow = 'margin-top:26px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;';
  const mailInput = 'width:min(320px, 100%); padding:14px 18px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:14px; outline:none; box-sizing:border-box;';

  return (
    <div style={sx(mailOuter)}>
      <div style={sx(mailInner)}>
        <Editable secId={sec.id} k="head" value={p.head} style={mailHead} preview={preview} />
        <Editable secId={sec.id} k="sub" value={p.sub} style={mailSub} multiline preview={preview} />
        <div style={sx(mailRow)}>
          <input placeholder="Email or mobile number" style={sx(mailInput)} onClick={(e) => e.stopPropagation()} />
          <div style={sx(s.btn)}>
            <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
