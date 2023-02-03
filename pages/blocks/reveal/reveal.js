export default async function decorate(block) {
  const media = document.createElement('div');
  media.classList.add('reveal-media');
  const copy = document.createElement('div');
  copy.classList.add('reveal-copy');

  [...block.children].forEach((row, i) => {
    const [img, text] = [...row.children];
    let videoMedia = false;
    if (!i) img.setAttribute('data-intersecting', true);
    [...img.children].forEach((child) => {
      if (child.querySelector('a[href]') || (child.nodeName === 'A' && child.href)) {
        videoMedia = true;
        // transform video
        const a = child.querySelector('a[href]') || child;
        const video = document.createElement('p');
        video.className = 'video-wrapper';
        video.innerHTML = `<video autoplay loop muted playsInline>
          <source data-src="${a.href}" type="video/mp4" />
        </video>`;
        child.replaceWith(video);

        const videoObserver = new IntersectionObserver(async (entries) => {
          const observed = entries.find((entry) => entry.isIntersecting);
          if (observed) {
            const source = video.querySelector('source');
            source.src = source.dataset.src;
            video.querySelector('video').load();
            videoObserver.disconnect();
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
    text.setAttribute('data-length', [...text.children].length);
    if (videoMedia) text.classList.add('reveal-video-copy');

    const textObserver = new IntersectionObserver(async (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        [...media.children].forEach((child, j) => {
          if (i === j) {
            child.setAttribute('data-intersecting', true);
          } else {
            child.removeAttribute('data-intersecting');
          }
        });
      }
    }, { threshold: 0.5 });
    textObserver.observe(text);
    copy.append(text);
  });

  block.innerHTML = '';
  block.append(media, copy);
}
