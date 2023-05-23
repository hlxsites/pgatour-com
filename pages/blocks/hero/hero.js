import { decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';
import { addHeaderSizing, isInIFrame } from '../../scripts/scripts.js';

export default async function decorate(block) {
  addHeaderSizing(block);

  // set image orientations
  const mediaOrientations = ['landscape', 'portrait'];
  const allImgs = block.querySelectorAll('img');
  if (allImgs && allImgs.length > 1) {
    allImgs.forEach((image, i) => {
      if (mediaOrientations[i]) image.dataset.orientation = mediaOrientations[i];
    });
  }

  // decorate buttons
  const btns = block.querySelector('.button-container');
  if (btns) {
    const secondaryBtn = btns.querySelector('.secondary');
    // pull first secondary button out of button container
    if (secondaryBtn) {
      secondaryBtn.classList.add('read-more');
      btns.parentElement.insertBefore(secondaryBtn, btns);
      // if secondary is only button, remove button container
      if (!btns.hasChildNodes()) btns.remove();
    }
  }
  if (btns && btns.hasChildNodes()) block.classList.add('hero-buttons');

  // decorate video
  const video = block.querySelector('.video');
  if (video) {
    block.classList.add('hero-video');
    video.classList.add(`${video.className}-hero`);
    decorateBlock(video);
    await loadBlock(video);
  }

  // decorate caption
  const em = block.querySelector('em');
  if (em) {
    const caption = document.createElement('div');
    caption.className = 'section';
    caption.innerHTML = `<p class="hero-caption">
      ${em.innerHTML}
    </p>`;
    em.remove();
    block.parentNode.append(caption);
  }

  if (isInIFrame) {
    block.querySelectorAll('a').forEach(async (link) => {
      link.setAttribute('target', '_parent');
    });
  }
}
