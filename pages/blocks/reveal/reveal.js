import { toClassName, createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const media = document.createElement('div');
  media.classList.add('reveal-media');
  const copy = document.createElement('div');
  copy.classList.add('reveal-copy');
  const rows = [...block.children];
  block.innerHTML = '';
  block.append(media, copy);

  let lastTop = 0;
  let scrollDown = null;

  rows.forEach((row, i) => {
    const [img, text] = [...row.children];
    if (!i) img.setAttribute('data-intersecting', true);
    [...img.children].forEach((child) => {
      if (child.querySelector('a[href]') || (child.nodeName === 'A' && child.href)) {
        // transform videos
        const a = child.querySelector('a[href]') || child;
        const videoWrapper = document.createElement('p');
        videoWrapper.className = 'video-wrapper';
        videoWrapper.innerHTML = `<video loop muted playsInline>
          <source data-src="${a.href}" type="video/mp4" />
        </video>`;
        child.replaceWith(videoWrapper);
        const video = videoWrapper.querySelector('video');
        const source = videoWrapper.querySelector('source');
        const videoObserver = new IntersectionObserver(async (entries) => {
          const observed = entries.find((entry) => entry.isIntersecting);
          if (observed) {
            if (!source.hasAttribute('src')) {
              source.src = source.dataset.src;
              video.load();
              video.addEventListener('loadeddata', () => {
                video.setAttribute('data-loaded', true);
              });
            }
            video.play();
          } else {
            video.pause();
          }
        }, { threshold: 0 });
        videoObserver.observe(videoWrapper);
      } else {
        // optimize images
        const image = child.querySelector('img');
        if (image) {
          // first image should be loaded eager
          const optimized = createOptimizedPicture(image.src, image.alt, false, [{ width: '2000' }]);
          image.closest('picture').replaceWith(optimized);
          const imageObserver = new IntersectionObserver(async (entries) => {
            const observed = entries.find((entry) => entry.isIntersecting);
            if (observed) {
              imageObserver.disconnect();
              const observedImg = optimized.querySelector('img');
              if (!observedImg.complete) observedImg.setAttribute('loading', 'eager');
            }
          }, { threshold: 0 });
          imageObserver.observe(optimized);
        }
      }
      // apply focus direction
      if (child.querySelector('strong')) {
        const strong = child.querySelector('strong');
        const direction = toClassName(strong.textContent);
        img.classList.add(`focus-${direction}`);
        if (strong.parentElement.nodeName === 'P') strong.parentElement.remove();
        else strong.remove();
      }
    });
    img.classList.remove('button-container');
    // set video orientations
    const allVideos = img.querySelectorAll('video');
    if (allVideos && allVideos.length > 1) {
      const videoTypes = ['landscape', 'portrait'];
      allVideos.forEach((video, j) => {
        if (videoTypes[j]) video.dataset.orientation = videoTypes[j];
      });
    }
    media.append(img);

    // copy/text setup
    if (!text.children.length) {
      text.innerHTML = `<p>${text.innerHTML}</p>`;
    }

    const textObserver = new IntersectionObserver(async (entries) => {
      const observed = entries.find((entry) => entry.isIntersecting);
      const mediaSlides = [...media.children];
      const matchingMedia = mediaSlides[i];
      if (observed) {
        mediaSlides.forEach((child) => child.removeAttribute('data-intersecting'));
        matchingMedia.setAttribute('data-intersecting', true);
      } else {
        matchingMedia.removeAttribute('data-intersecting');
        const previousMedia = mediaSlides[i - 1];
        const nextMedia = mediaSlides[i + 1];
        if (scrollDown && nextMedia) {
          nextMedia.setAttribute('data-intersecting', true);
        } else if (!scrollDown && previousMedia) {
          previousMedia.setAttribute('data-intersecting', true);
        }
      }
    }, { threshold: 0 });
    textObserver.observe(text);
    copy.append(text);
  });

  setTimeout(() => {
    block.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.setAttribute('loading', 'eager');
    });
  }, 4000);

  window.addEventListener('scroll', () => {
    const top = window.pageYOffset || document.documentElement.scrollTop;
    scrollDown = top >= lastTop;
    lastTop = top <= 0 ? 0 : top;
  });
}
