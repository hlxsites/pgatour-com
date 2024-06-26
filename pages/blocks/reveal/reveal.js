import { toClassName, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { loadScript, isVideoPlaying, applyAuthorStyles } from '../../scripts/scripts.js';

const videoObserver = new IntersectionObserver(async (entries) => {
  entries.forEach((entry) => {
    const wrapper = entry.target;
    const bcVideo = wrapper.querySelector('video-js');
    if (bcVideo) {
      const isFirstVideo = wrapper.parentElement.querySelector('.video-wrapper') === wrapper;
      if (entry.isIntersecting) {
        if ((isFirstVideo && entry.intersectionRatio >= 0)
          || (!isFirstVideo && entry.intersectionRatio >= 0.5)) {
          // eslint-disable-next-line no-undef
          videojs.getPlayer(bcVideo).ready(function revealBCVideo() {
            const video = bcVideo.querySelector('video');
            bcVideo.setAttribute('data-loaded', true);
            video.setAttribute('data-loaded', true);
            this.play();
          });
        }
      }
    } else {
      const video = wrapper.querySelector('video');
      const source = video.querySelector('source');
      const isFirstVideo = wrapper.parentElement.querySelector('.video-wrapper') === wrapper;
      if (entry.isIntersecting) {
        if ((isFirstVideo && entry.intersectionRatio >= 0)
          || (!isFirstVideo && entry.intersectionRatio >= 0.5)) {
          if (!source.hasAttribute('src')) {
            source.src = source.dataset.src;
            video.load();
            video.addEventListener('loadeddata', () => {
              video.setAttribute('data-loaded', true);
            });
          }
          if (!isVideoPlaying(video)) {
            video.play();
          }
        }
      } else if (isVideoPlaying(video)) {
        video.pause();
      }
    }
  });
}, { threshold: [0, 0.5] });

const videoWrappers = [];
let revealBlocksProcessed = 0;

export default async function decorate(block) {
  const media = document.createElement('div');
  media.classList.add('reveal-media');
  const copy = document.createElement('div');
  copy.classList.add('reveal-copy');
  const rows = [...block.children];
  block.innerHTML = '';
  block.append(media, copy);

  // Audio Setup
  const audioEnabled = block.classList.contains('audio');
  const audioContainer = document.createElement('div');
  audioContainer.classList.add('audio-container');
  const audioButton = document.createElement('button');
  audioButton.innerHTML = '<img class="icon icon-unmute" src="/pages/icons/volume-on.svg" alt="unmute icon">';
  audioButton.classList.add('audio-button');
  audioContainer.appendChild(audioButton);

  const section = block.closest('.section');
  const { sectionId } = section.dataset;
  let lastTop = 0;
  let scrollDown = null;

  rows.forEach((row, i) => {
    const [img, text] = [...row.children];
    img.setAttribute('data-section-media-id', `${sectionId}.${i + 1}`);
    if (!i) {
      img.setAttribute('data-intersecting', true);
    }

    [...img.children].forEach((child) => {
      if (child.querySelector('a[href]') || (child.nodeName === 'A' && child.href)) {
        // transform videos
        const a = child.querySelector('a[href]') || child;
        const brightcoveId = a.textContent.match(/^\d+$/);
        const videoWrapper = document.createElement('p');
        videoWrapper.className = 'video-wrapper';
        if (brightcoveId) {
          videoWrapper.innerHTML = `<video-js data-account="6082840763001"
            data-player="default"
            data-embed="default"
            controls="false"
            muted="true"
            loop="true"
            data-video-id="${brightcoveId}"
            data-playlist-id=""
            data-application-id=""></video-js>`;
        } else {
          videoWrapper.innerHTML = `<video loop muted playsInline>
          <source data-src="${a.href}" type="video/mp4" />
        </video>`;
        }
        child.replaceWith(videoWrapper);
        videoWrappers.push(videoWrapper);
      } else {
        // optimize images
        const images = child.querySelectorAll('img');
        if (images) {
          images.forEach((image) => {
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
          });
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
    const mediaOrientations = ['landscape', 'portrait'];
    // set video orientations
    const allVideos = img.querySelectorAll('video');
    if (allVideos && allVideos.length > 1) {
      allVideos.forEach((video, j) => {
        if (mediaOrientations[j]) video.dataset.orientation = mediaOrientations[j];
      });
    }
    // set image orientations
    const allImgs = img.querySelectorAll('img');
    if (allImgs && allImgs.length > 1) {
      allImgs.forEach((image, j) => {
        if (mediaOrientations[j]) image.dataset.orientation = mediaOrientations[j];
      });
    }
    media.append(img);

    // copy/text setup
    if (!text.children.length && text.innerHTML.length > 0) {
      text.innerHTML = `<p>${text.innerHTML}</p>`;
    }

    const textObserver = new IntersectionObserver(async (entries) => {
      const observed = entries.find((entry) => entry.isIntersecting);
      const mediaSlides = [...media.children];
      const matchingMedia = mediaSlides[i];
      if (observed) {
        mediaSlides.forEach((child) => child.removeAttribute('data-intersecting'));
        matchingMedia.setAttribute('data-intersecting', true);
        if (audioEnabled) {
          block.querySelectorAll('video').forEach((video) => {
            video.muted = true;
          });
          if (!matchingMedia.querySelector('video')) {
            audioButton.style.display = 'none';
          } else audioButton.style.display = 'block';
          audioButton.innerHTML = '<img class="icon icon-unmute" src="/pages/icons/volume-on.svg" alt="unmute icon">';
          audioButton.onclick = () => {
            const video = block.querySelector('div[data-intersecting="true"]').querySelector('video');
            video.muted = !video.muted;
            audioButton.innerHTML = (video.muted)
              ? '<img class="icon icon-unmute" src="/pages/icons/volume-on.svg" alt="unmute icon">'
              : '<img class="icon icon-mute" src="/pages/icons/volume-off.svg" alt="mute icon">';
          };
          matchingMedia.parentElement.parentElement.prepend(audioContainer);
        }
        // leaving the core code here in case we need to add this back
        // if (!sectionRevealLoadedTracker.includes(matchingMedia.dataset.sectionMediaId)) {
        //   sectionRevealLoadedTracker.push(matchingMedia.dataset.sectionMediaId);
        //   sendAnalyticsPageEvent(matchingMedia.dataset.sectionMediaId);
        // }
      } else {
        matchingMedia.removeAttribute('data-intersecting');
        const previousMedia = mediaSlides[i - 1];
        const nextMedia = mediaSlides[i + 1];
        if (scrollDown && nextMedia) {
          nextMedia.setAttribute('data-intersecting', true);
        } else if (!scrollDown && previousMedia) {
          previousMedia.setAttribute('data-intersecting', true);
          if (audioEnabled) {
            matchingMedia.querySelectorAll('video').forEach((video) => {
              video.muted = true;
            });
            if (!previousMedia.querySelector('video')) {
              audioButton.style.display = 'none';
            } else audioButton.style.display = 'block';
            const video = block.querySelector('div[data-intersecting="true"]').querySelector('video');
            audioButton.innerHTML = (video.muted)
              ? '<img class="icon icon-unmute" src="/pages/icons/volume-on.svg" alt="unmute icon">'
              : '<img class="icon icon-mute" src="/pages/icons/volume-off.svg" alt="mute icon">';
          }
        }
      }
    }, { threshold: 0 });
    textObserver.observe(text);
    copy.append(text);
  });

  await applyAuthorStyles(block, copy);

  revealBlocksProcessed += 1;
  if (videoWrappers && (revealBlocksProcessed === document.querySelectorAll('.reveal.block').length)) {
    loadScript('https://players.brightcove.net/6082840763001/default_default/index.min.js', () => {
      videoWrappers.forEach((video) => {
        videoObserver.observe(video);
      });
    });
  }

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
