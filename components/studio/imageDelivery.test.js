import test from 'node:test';
import assert from 'node:assert/strict';
import { cldAt, optImg, optSrcSet, sizedAt, SRC_WIDTHS } from './imageDelivery.js';

const CLD = 'https://res.cloudinary.com/dakio/image/upload/v1712/dakio/products/t1/abc.jpg';

test('a Cloudinary photo gets format, quality, no-upscale and width', () => {
  assert.equal(cldAt(CLD, 540), 'https://res.cloudinary.com/dakio/image/upload/f_auto,q_auto,c_limit,w_540/v1712/dakio/products/t1/abc.jpg');
});

test('other hosts, data URLs and already-transformed URLs pass through', () => {
  assert.equal(cldAt('https://cdn.shopify.com/x.jpg', 540), 'https://cdn.shopify.com/x.jpg');
  assert.equal(cldAt('data:image/png;base64,AAA', 540), 'data:image/png;base64,AAA');
  const done = 'https://res.cloudinary.com/dakio/image/upload/w_300/v1/a.jpg';
  assert.equal(cldAt(done, 540), done);
  assert.equal(optSrcSet(done, {}), undefined);
  assert.equal(cldAt('https://res.cloudinary.com/dakio/video/upload/v1/a.mp4', 540), 'https://res.cloudinary.com/dakio/video/upload/v1/a.mp4');
});

test('srcset lists every width; the store switch turns it all off', () => {
  const set = optSrcSet(CLD, {});
  assert.equal(set.split(', ').length, SRC_WIDTHS.length);
  assert.match(set, /w_360\/v1712\/dakio\/products\/t1\/abc\.jpg 360w/);
  assert.equal(optSrcSet(CLD, { compress: false }), undefined);
  assert.equal(optImg(CLD, { compress: false }, 540), CLD);
  assert.match(optImg(CLD, undefined), /w_1200\//);
});

test('Pexels and Unsplash photos are sized through their own URL options', () => {
  const px = sizedAt('https://images.pexels.com/photos/1/pexels-photo-1.jpeg?auto=compress&cs=tinysrgb&h=1200&dpr=2', 540);
  const u = new URL(px);
  assert.equal(u.searchParams.get('w'), '540');
  assert.equal(u.searchParams.get('h'), null, 'height dropped so the shape is kept');
  assert.equal(u.searchParams.get('dpr'), null);
  assert.equal(u.searchParams.get('auto'), 'compress');
  const us = new URL(sizedAt('https://images.unsplash.com/photo-1?ixid=x', 720));
  assert.equal(us.searchParams.get('w'), '720');
  assert.equal(us.searchParams.get('auto'), 'format');
  assert.equal(us.searchParams.get('fit'), 'max');
  assert.equal(optSrcSet('https://images.pexels.com/photos/1/a.jpeg', {}).split(', ').length, SRC_WIDTHS.length);
  assert.equal(sizedAt('https://cdn.shopify.com/a.jpg', 540), 'https://cdn.shopify.com/a.jpg');
});
