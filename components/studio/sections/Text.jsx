'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';

export default function Text({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  const ctr = sec.v === 'center';

  const textHead = s.headFont + 'font-size:' + (mob ? 24 : 30) + 'px; line-height:1.15;' + (ctr ? ' text-align:center;' : '');
  const textBody = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.75; margin-top:14px; white-space:pre-wrap; color:color-mix(in oklab, ' + c.fg + ' 84%, ' + c.bg + ');' + (ctr ? ' text-align:center;' : '');

  return (
    <div style={sx(s.padNarrow)}>
      <Editable secId={sec.id} k="head" value={p.head} style={textHead} preview={preview} />
      <Editable secId={sec.id} k="body" value={p.body} style={textBody} multiline preview={preview} />
    </div>
  );
}
