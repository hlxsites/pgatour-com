function renderVideo(block, source, autoplay) {
  const vid = document.createElement('video');

  if (autoplay) {
    vid.setAttribute('autoplay', '');
  }
  if (block.classList.contains('loop')) {
    vid.setAttribute('loop', '');
  } else {
    vid.setAttribute('controls', '');
  }

  const src = document.createElement('source');
  src.setAttribute('src', source);
  src.setAttribute('type', `video/${source.split('.').pop()}`);

  vid.append(src);
  block.append(vid);
  block.classList.add('video-loaded');
}

export default async function decorate(block) {
  const a = block.querySelector('a');
  if (a) {
    const source = a.href;
    const pic = block.querySelector('picture');
    block.innerHTML = '';
    if (pic) {
      const wrapper = document.createElement('div');
      wrapper.className = 'video-placeholder';
      wrapper.innerHTML = '<div class="video-placeholder-play"><button title="Play"></button></div>';
      wrapper.prepend(pic);
      wrapper.addEventListener('click', () => {
        renderVideo(block, source, true);
      });
      block.append(wrapper);
    } else {
      renderVideo(block, source, false);
    }
  }
}
