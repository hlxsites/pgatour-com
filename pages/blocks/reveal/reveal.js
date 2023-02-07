export default async function decorate(block) {
  const media = document.createElement('div');
  media.classList.add('reveal-media');
  const copy = document.createElement('div');
  copy.classList.add('reveal-copy');
  let lastTop = 0;
  let scrollDown = null;

  [...block.children].forEach((row, i) => {
    const [img, text] = [...row.children];
    if (!i) img.setAttribute('data-intersecting', true);
    [...img.children].forEach((child) => {
      if (child.querySelector('a[href]') || (child.nodeName === 'A' && child.href)) {
        // transform video
        const a = child.querySelector('a[href]') || child;
        const video = document.createElement('p');
        video.className = 'video-wrapper';
        video.innerHTML = `<video loop muted playsInline>
          <source data-src="${a.href}" type="video/mp4" />
        </video>`;
        child.replaceWith(video);

        const videoObserver = new IntersectionObserver(async (entries) => {
          const observed = entries.find((entry) => entry.isIntersecting);
          const vid = video.querySelector('video');
          if (observed) {
            const source = video.querySelector('source');
            if (!source.hasAttribute('src')) {
              source.src = source.dataset.src;
              vid.load();
            }
            vid.play();
          } else {
            vid.pause();
          }
        }, { threshold: 0 });
        videoObserver.observe(video);
      }
    });
    img.classList.remove('button-container');
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

  window.addEventListener('scroll', () => {
    const top = window.pageYOffset || document.documentElement.scrollTop;
    scrollDown = top >= lastTop;
    lastTop = top <= 0 ? 0 : top;
  });

  block.innerHTML = '';
  block.append(media, copy);
}
