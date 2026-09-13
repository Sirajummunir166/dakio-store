import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeRichHtml, htmlToText, isEmptyHtml } from './sanitizeHtml.js'

test('sanitizeRichHtml strips scripts, handlers, javascript: links and non-https images', () => {
  const out = sanitizeRichHtml('<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">l</a><img src="/x.png" onerror="alert(1)"><img src="http://a/b.png">')
  assert.equal(out.includes('script'), false)
  assert.equal(out.includes('onclick'), false)
  assert.equal(out.includes('onerror'), false)
  assert.equal(out.includes('javascript:'), false)
  assert.equal(out.includes('<img'), false)
  assert.ok(out.includes('Hi'))
})

test('sanitizeRichHtml keeps tables, https images, headings, rules and colour', () => {
  const out = sanitizeRichHtml('<h2>Fit</h2><table><tbody><tr><th colspan="2">S</th></tr><tr><td>M</td><td>38</td></tr></tbody></table><img src="https://res.cloudinary.com/a.jpg" alt="c" width="300"><hr><p style="text-align: center; position: absolute"><span style="color: #f00">r</span><a href="https://dakio.io" target="_self" rel="x">s</a></p>')
  assert.ok(out.includes('<h2>Fit</h2>'))
  assert.ok(out.includes('<th colspan="2">'))
  assert.ok(out.includes('<img src="https://res.cloudinary.com/a.jpg" alt="c" width="300">'))
  assert.ok(out.includes('<hr>'))
  assert.ok(out.includes('text-align:center') || out.includes('text-align: center'))
  assert.equal(out.includes('position'), false)
  assert.ok(out.includes('color:#f00') || out.includes('color: #f00'))
  assert.ok(out.includes('target="_blank"') && out.includes('rel="noopener noreferrer"'))
})

test('htmlToText and isEmptyHtml', () => {
  assert.equal(htmlToText('<p>Soft &amp; <b>warm</b>&nbsp;cotton</p>'), 'Soft & warm cotton')
  assert.equal(isEmptyHtml('<p><br></p>'), true)
  assert.equal(isEmptyHtml('<img src="https://a/b.png">'), false)
  assert.equal(isEmptyHtml('plain text'), false)
})
