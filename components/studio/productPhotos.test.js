import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePhotoList, productPhotos, photoSlotId, MAX_PHOTOS } from './productPhotos.js';
import { toStudioCatalog, optImg } from './publicCatalog.js';

const A = 'https://res.cloudinary.com/x/image/upload/v1/a.jpg';
const B = 'https://res.cloudinary.com/x/image/upload/v1/b.jpg';
const C = 'https://res.cloudinary.com/x/image/upload/v1/c.jpg';

test('Product.images as the API sends it (a JSON string) gives every photo', () => {
  assert.deepEqual(parsePhotoList(JSON.stringify([A, B, C]), A), [A, B, C]);
});

test('arrays, { url } objects, repeats and blanks', () => {
  assert.deepEqual(parsePhotoList([A, { url: B }, A, '', null, '  '], null), [A, B]);
});

test('imageUrl is only the fallback when there are no images', () => {
  assert.deepEqual(parsePhotoList('[]', C), [C]);
  assert.deepEqual(parsePhotoList(null, C), [C]);
  assert.deepEqual(parsePhotoList('not json', C), [C]);
  assert.deepEqual(parsePhotoList(JSON.stringify([A]), C), [A]);
  assert.deepEqual(parsePhotoList(null, null), []);
});

test('productPhotos puts img first, drops repeats and caps the gallery', () => {
  assert.deepEqual(productPhotos({ img: A, imgs: [A, B, C] }), [A, B, C]);
  assert.deepEqual(productPhotos({ img: A }), [A]);
  assert.deepEqual(productPhotos(null), []);
  const many = Array.from({ length: 12 }, (_, i) => `https://x/${i}.jpg`);
  assert.equal(productPhotos({ img: many[0], imgs: many }).length, MAX_PHOTOS);
});

test('photo 0 keeps the main slot, the rest get their own', () => {
  assert.equal(photoSlotId('st-prod-p1', 'p1', 0), 'st-prod-p1');
  assert.equal(photoSlotId('st-prod-p1', 'p1', 2), 'st-pimg-p1-2');
});

test('the public catalog carries every photo on the product page (Salt, 2026-11-09)', () => {
  const p = { id: 'p1', name: 'Tee', sellingPrice: 500, slug: 'tee', images: JSON.stringify([A, B, C]), imageUrl: B };
  const one = toStudioCatalog([p]).products[0];
  assert.equal(one.img, A, 'the first photo, as the builder shows it');
  assert.deepEqual(one.imgs, [A, B, C]);
  const listed = toStudioCatalog([p], [], { list: true }).products[0];
  assert.equal(listed.img, A);
  assert.equal(listed.imgs, undefined, 'lists ship the first photo only');
});

test('optImg takes a width for thumbnails', () => {
  assert.equal(optImg(A, {}), 'https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_1200/v1/a.jpg');
  assert.equal(optImg(A, {}, 360), 'https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_360/v1/a.jpg');
  assert.equal(optImg(A, { compress: false }, 360), A);
});
