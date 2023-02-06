export default async function decorate(block) {
  const media = document.createElement('div');
  media.classList.add('reveal-media');
  const copy = document.createElement('div');
  copy.classList.add('reveal-copy');

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
        const previousMedia = mediaSlides[i - 1];
        if (previousMedia) previousMedia.setAttribute('data-intersecting', true);
        matchingMedia.removeAttribute('data-intersecting');
      }
    }, { threshold: 0 });
    textObserver.observe(text);
    window.addEventListener('scroll', () => {
      textObserver.observe(text);
    });
    copy.append(text);
  });

  block.innerHTML = '';
  block.append(media, copy);
}
