import {
  sampleRUM,
  buildBlock,
  loadBlock,
  createOptimizedPicture,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateBlock,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  toClassName,
} from './lib-franklin.js';

const LCP_BLOCKS = ['carousel', 'hero']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

/**
 * Add dynamic font sizing CSS class names to headings
 *
 * The CSS class names are determined by character counts.
 * @param {Element} block The container element
 * @param {string} classPrefix Prefix in CSS class names before "-long", "-very-long", "-x-long".
 * Default is "heading".
 * @param {string} selector CSS selector to select the target heading tags. Default is "h1, h2".
 */
export function addHeaderSizing(block, classPrefix = 'heading', selector = 'h1, h2') {
  const headings = block.querySelectorAll(selector);
  const sizes = [
    { name: 'long', threshold: 30 },
    { name: 'very-long', threshold: 40 },
    { name: 'x-long', threshold: 50 },
  ];
  headings.forEach((h) => {
    const { length } = h.textContent;
    sizes.forEach((size) => {
      if (length >= size.threshold) h.classList.add(`${classPrefix}-${size.name}`);
    });
  });
}

function buildHeroBlock(main) {
  if (main.querySelector('.hero')) return;
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    const elems = [];
    const currentSection = h1.closest('main > div');
    if (!currentSection.previousElementSibling) {
      [...currentSection.children].forEach((child) => { elems.push(child); });
    } else {
      elems.push(picture);
      elems.push(h1);
    }

    section.append(buildBlock('hero', { elems }));
    main.prepend(section);
    const sibling = section.nextElementSibling;
    if (sibling) { // remove empty sibling if exists
      if (!sibling.textContent.trim().length) sibling.remove();
    }
  }
}

export function linkPicture(picture) {
  const nextSib = picture.parentNode.nextElementSibling;
  if (nextSib) {
    const a = nextSib.querySelector('a');
    if (a && a.textContent.startsWith('https://')) {
      a.innerHTML = '';
      a.className = '';
      a.appendChild(picture);
    }
  }
}

export function decorateLinkedPictures(main) {
  /* thanks to word online */
  main.querySelectorAll('picture').forEach((picture) => {
    if (!picture.closest('div.block')) {
      linkPicture(picture);
    }
  });
}

export function loadScript(url, callback, attributes) {
  const head = document.querySelector('head');
  if (!head.querySelector(`script[src="${url}"]`)) {
    const script = document.createElement('script');
    script.src = url;

    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        script.setAttribute(key, attributes[key]);
      });
    }

    head.append(script);
    script.onload = callback;
    return script;
  }
  return head.querySelector(`script[src="${url}"]`);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinkedPictures(main);

  const sections = [...main.querySelectorAll('.section')];
  sections.forEach((section) => {
    const bg = section.dataset.background;
    if (bg) {
      const picture = createOptimizedPicture(bg);
      picture.classList.add('section-background');
      section.prepend(picture);
    }
  });
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const theme = getMetadata('theme');
  if (theme && (toClassName(theme) === 'story' || toClassName(theme) === 'info')) {
    loadCSS(`${window.hlx.codeBasePath}/themes/${toClassName(theme)}.css`);
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * @returns the pgatour domain from which to load content
 */
export function getPgaTourDomain() {
  const isProd = window.location.host.includes('pgatour.com');
  const pgaTourProdUrl = 'https://www.pgatour.com';
  const pgaTourStagingUrl = 'https://pgatour-uat.dev.pgatourstaging.com';

  return isProd ? pgaTourProdUrl : pgaTourStagingUrl;
}

function convertDivsToUlLi(containerElement) {
  const quickLinksContainer = containerElement.querySelector('.css-rklm6r > .css-tb1hh0');

  const linksDivContainer = quickLinksContainer.querySelector('.css-0');

  const ul = document.createElement('ul');
  ul.className = 'css-l0v55i';

  const linkDivs = Array.from(linksDivContainer.getElementsByClassName('css-y3756o'));

  linkDivs.forEach((div) => {
    const li = document.createElement('li');
    while (div.firstChild) {
      div.firstChild.classList.add('quickLink');
      li.appendChild(div.firstChild);
    }
    ul.appendChild(li);
  });

  if (linksDivContainer.parentNode === quickLinksContainer) {
    quickLinksContainer.replaceChild(ul, linksDivContainer);
  } else {
    // eslint-disable-next-line no-console
    console.error('The div to be replaced is not a direct child of the target container');
  }
}

export function isVideoPlaying(video) {
  return video.currentTime > 0 && !video.paused && !video.ended
  && video.readyState > video.HAVE_CURRENT_DATA;
}

/**
 * load the header and footer content from pgatour.com
 * @param {*} header the header element
 * @param {*} footer the footer element
 */
async function loadHeaderFooterContent(header, footer) {
  const pgaTourContentUrl = getPgaTourDomain();
  const workerPrefix = 'https://little-forest-58aa.david8603.workers.dev/?url=';
  const fetchUrl = `${workerPrefix}${encodeURIComponent(pgaTourContentUrl)}`;
  const resp = await fetch(fetchUrl);
  if (resp.ok) {
    const syntheticDiv = document.createElement('div');
    const markup = await resp.text();
    syntheticDiv.innerHTML = markup;
    syntheticDiv.querySelectorAll('style').forEach((style) => {
      style.remove();
    });

    syntheticDiv.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (src.startsWith('/')) {
        img.src = `${pgaTourContentUrl}${src}`;
      }
    });

    syntheticDiv.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href.startsWith('/')) {
        link.href = `${pgaTourContentUrl}${href}`;
      }
    });

    const headerBlock = document.createElement('div');
    headerBlock.classList.add('header', 'block');
    headerBlock.append(syntheticDiv.querySelector('#__next > div'));
    header.append(headerBlock);

    const footerBlock = document.createElement('div');
    footerBlock.classList.add('footer', 'block');
    footerBlock.append(...syntheticDiv.querySelector('#__next footer').children);
    convertDivsToUlLi(footerBlock);
    footer.append(footerBlock);
  }
}

/**
 * checks is search param 'view' is set to 'app'
 */
function isAppView() {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'app';
}

/**
 * check if the page is inside an iframe.
 */
export function isInIFrame() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * A custom verison of loadHeader, different than what is found in lib-franklin
 * only loads and decorates the block based on content loaded in loadHeaderFooterContent
 */
async function loadHeaderEx(header) {
  const headerBlock = header.querySelector('.block');
  decorateBlock(headerBlock);
  await loadBlock(headerBlock);
}

/**
 * A custom verison of loadFooter, different than what is found in lib-franklin
 * only loads and decorates the block based on content loaded in loadHeaderFooterContent
 */
async function loadFooterEx(footer) {
  const footerBlock = footer.querySelector('.block');
  decorateBlock(footerBlock);
  await loadBlock(footerBlock);
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  if (isAppView() || isInIFrame()) {
    doc.querySelector('header').remove();
    doc.querySelector('footer').remove();
  } else {
    await loadHeaderFooterContent(doc.querySelector('header'), doc.querySelector('footer'));
    loadHeaderEx(doc.querySelector('header'));
    loadFooterEx(doc.querySelector('footer'));
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  if (!isInIFrame()) {
    // eslint-disable-next-line import/no-cycle
    window.setTimeout(() => import('./delayed.js'), 4000);
    // load anything that can be postponed to the latest here
  }
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// just avoids some weird issues with page load during tests
if (!window.inTest) {
  loadPage();
}

async function getJsonStyles() {
  let styles;
  const promise = new Promise((resolve, reject) => {
    try {
      fetch('/pages/styles.json')
        .then((resp) => resp.json())
        .then((json) => {
          styles = json.data;
          resolve();
        });
    } catch (error) {
      reject();
    }
  });
  await promise;
  return styles;
}

export async function applyAuthorStyles(block, containerToApply) {
  const excelStyles = await getJsonStyles();
  const getAuthorStyle = block.className.split(' ').filter((string) => string.includes('-'));

  if (getAuthorStyle && getAuthorStyle.length >= 1) {
    const styles = getAuthorStyle.map((style) => {
      const split = style.split('-');
      // needs to be two, area-variant.
      if (split.length === 2) {
        const area = split[0];
        const variant = split[1];
        // eslint-disable-next-line max-len
        const matchingStyleFromExcel = excelStyles.find((excel) => excel.Variant === variant && excel.Area === area);
        if (matchingStyleFromExcel) {
          const { Hex, Area } = matchingStyleFromExcel;
          if (Area === 'text') {
            return `color:${Hex};`;
          }
          return `${split[0]}:${Hex}`;
        }
      }
      return '';
    });
    if (containerToApply && styles.length) {
      containerToApply.querySelectorAll('p').forEach((element) => {
        element.setAttribute('style', styles.join(';'));
      });
    }
  }
}
