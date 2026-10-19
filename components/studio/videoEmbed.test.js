import test from 'node:test';
import assert from 'node:assert/strict';
import { videoEmbed } from './videoEmbed.js';

test('YouTube links of every shape become a no-cookie player', () => {
  for (const u of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ?t=3', 'https://youtube.com/shorts/dQw4w9WgXcQ', 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share']) {
    assert.equal(videoEmbed(u)?.src, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&playsinline=1', u);
  }
});

test('Vimeo and Facebook embed; anything else, or a bad link, does not', () => {
  assert.equal(videoEmbed('https://vimeo.com/76979871').src, 'https://player.vimeo.com/video/76979871?autoplay=1');
  assert.equal(videoEmbed('https://www.facebook.com/dakio/videos/123456789/').provider, 'facebook');
  assert.equal(videoEmbed('https://example.com/video.mp4'), null);
  assert.equal(videoEmbed('javascript:alert(1)'), null);
  assert.equal(videoEmbed('https://youtube.com/watch?v=<script>'), null);
  assert.equal(videoEmbed(''), null);
});
