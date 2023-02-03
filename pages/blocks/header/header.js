import { getPgaTourDomain } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function closeDialog(dlg) {
  dlg.classList.add('hide');
  const hasAnimation = window.getComputedStyle(dlg, null).getPropertyValue('animation-name') !== 'none';
  if (hasAnimation) {
    dlg.addEventListener('animationend', () => {
      if (dlg.classList.contains('hide')) {
        dlg.classList.remove('hide');
        dlg.close();
      }
    });
  } else {
    dlg.classList.remove('hide');
    dlg.close();
  }
}

function buildSignInDialog() {
  const dialog = document.createElement('dialog');
  dialog.id = 'sign-in-dialog';
  dialog.className = 'sign-in-dialog';

  return dialog;
}

function buildSignUpDialog() {
  const dialog = document.createElement('dialog');
  dialog.id = 'sign-up-dialog';
  dialog.className = 'sign-up-dialog';

  return dialog;
}

function buildMoreLinks(moreLink) {
  const moreLi = document.createElement('li');
  moreLi.classList.add('more');
  moreLi.append(moreLink);

  moreLink.addEventListener('click', (e) => {
    e.preventDefault();
    let docListener;
    const open = moreLi.classList.contains('open');
    if (!open) {
      moreLi.classList.add('open');
      docListener = document.addEventListener('click', (evt) => {
        if (!moreLi.contains(evt.target) && moreLi.classList.contains('open')) {
          moreLi.classList.remove('open');
          if (docListener) {
            document.removeEventListener('click', docListener);
          }
        }
      });
    } else {
      moreLi.classList.remove('open');
      if (docListener) {
        document.removeEventListener('click', docListener);
      }
    }
  });

  const domain = getPgaTourDomain();

  moreLi.insertAdjacentHTML('beforeend', '<span class="icon icon-arrow-down"><span>');
  // TODO this is hardcoded for now, but probably shouldn't be
  moreLi.insertAdjacentHTML('beforeend', `
  <div>
    <ul>
      <li><a href="${domain}/comcast">Comcast Business TOUR TOP 10</a></li>
      <li><a href="${domain}/tickets">Tickets</a></li>
      <li><a href="${domain}/shop">Shop</a></li>
    </ul>
    </div>
  `);

  return moreLi;
}

function decorateLogo(logo, container) {
  const logoDiv = document.createElement('div');
  logoDiv.classList.add('brand');

  const logoLink = logo.closest('a');
  const anchor = document.createElement('a');

  anchor.href = logoLink.href;
  const img = document.createElement('img');
  img.src = logo.src;
  img.setAttribute('alt', logo.getAttribute('alt'));

  anchor.append(img);
  logoDiv.append(anchor);
  container.append(logoDiv);
}

function decorateNav(navLinks, moreLink, container) {
  const nav = document.createElement('nav');
  nav.classList.add('primary-navigation');

  const ul = document.createElement('ul');
  ul.classList.add('navigation-list', 'primary-navigation-list');

  navLinks.forEach((link) => {
    const li = document.createElement('li');
    li.append(link);
    ul.append(li);
  });

  ul.append(moreLink);

  nav.append(ul);

  container.append(nav);
}

function executeSearch(searchTerm) {
  const domain = getPgaTourDomain();
  window.location = `${domain}/search/${encodeURIComponent(searchTerm)}`;
}

function decorateUserActions(container) {
  const actions = document.createElement('div');
  actions.classList.add('user-actions');

  const tours = document.createElement('button');
  tours.classList.add('tours');
  tours.innerText = 'Tours';
  tours.addEventListener('click', () => {
    const toursDialog = document.querySelector('#tours-navigation');
    toursDialog.showModal();
  });
  actions.append(tours);

  const user = document.createElement('button');
  user.innerHTML = '<span class="icon icon-user"></span>';
  user.classList.add('user');
  // user.addEventListener('click', () => {
  //   const signInDialog = document.querySelector('#sign-in-dialog');
  //   signInDialog.showModal();
  // });
  user.setAttribute('aria-label', 'Profile');
  actions.append(user);

  const searchDialog = document.createElement('dialog');
  searchDialog.classList.add('search-dialog');
  container.append(searchDialog);

  const dialogContainer = document.createElement('div');
  dialogContainer.classList.add('dialog-container');
  searchDialog.append(dialogContainer);

  const input = document.createElement('input');
  input.classList.add('heading-m');
  input.placeholder = 'Search';
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeSearch(input.value);
    }
  });
  dialogContainer.append(input);

  const searchClose = document.createElement('button');
  searchClose.innerHTML = '<span class="icon icon-close"></span>';
  searchClose.classList.add('close', 'close-search');
  searchClose.setAttribute('aria-label', 'Close Search');
  searchClose.addEventListener('click', () => {
    searchDialog.classList.remove('active');
    input.value = '';
    searchDialog.close();
  });
  dialogContainer.append(searchClose);

  const search = document.createElement('button');
  search.innerHTML = '<span class="icon icon-search"></span>';
  search.classList.add('search');
  search.addEventListener('click', () => {
    const active = searchDialog.classList.contains('active');
    if (!active) {
      searchDialog.show();
      input.focus();
      searchDialog.classList.add('active');
    }
  });
  search.setAttribute('aria-label', 'Search');
  actions.append(search);

  const searchButton = search.cloneNode(true);
  dialogContainer.prepend(searchButton);
  searchButton.addEventListener('click', () => {
    executeSearch(input.value);
  });

  const hamburger = document.createElement('button');
  hamburger.innerHTML = '<span class="icon icon-menu"></span>';
  hamburger.classList.add('hamburger');
  hamburger.setAttribute('aria-label', 'Menu');

  hamburger.addEventListener('click', () => {
    const dialog = document.querySelector('#primary-navigation');
    document.body.style.overflowY = 'hidden';
    dialog.show();
  });

  actions.append(hamburger);

  container.append(actions);
}

function buildToursDialog(tourLinks) {
  const dialog = document.createElement('dialog');
  dialog.id = 'tours-navigation';
  dialog.classList.add('tours-navigation');

  const container = document.createElement('div');
  container.classList.add('dialog-container');
  dialog.append(container);

  const header = document.createElement('div');
  header.classList.add('dialog-header');
  container.append(header);

  const headerContent = document.createElement('div');
  headerContent.classList.add('dialog-header-content');
  header.append(headerContent);

  const body = document.createElement('div');
  body.classList.add('dialog-body');
  container.append(body);

  headerContent.insertAdjacentHTML('beforeend', '<h4>Tours</h4>');

  const close = document.createElement('button');
  close.innerHTML = '<span class="icon icon-close"></span>';
  close.classList.add('close');
  close.addEventListener('click', () => {
    closeDialog(dialog);
  });
  close.setAttribute('aria-label', 'Close');
  headerContent.append(close);

  const domain = getPgaTourDomain();
  const tourImages = {
    'pga-tour': '/images/Tours/pga_tour.png',
    'pga-tour-champions': '/images/Tours/champions_tour.png',
    'korn-ferry-tour': '/images/Tours/korn_ferry.png',
    'pga-tour-canada': '/images/Tours/latino_america.png',
    'pga-tour-latinoamérica': '/images/Tours/latino_america.png',
    'lpga-tour': '/images/Tours/lpga_tour.png',
    'dp-world-tour': '/images/Tours/dp_world_tour.png',
    'pga-tour-university': '/images/Tours/pga_tour_university.png',
    fallback: '/images/Tours/latino_america.png',
  };

  const ul = document.createElement('ul');
  tourLinks.forEach((link) => {
    const li = document.createElement('li');
    const tourName = link.innerText;
    const tourImage = tourImages[tourName.toLowerCase().trim().replaceAll(' ', '-')];
    const image = tourImage !== undefined ? tourImage : tourImages.fallback;
    li.insertAdjacentHTML('beforeend', `<img alt="${tourName}" src="${domain}${image}">`);
    li.append(link);
    ul.append(li);
  });
  body.append(ul);

  return dialog;
}

function buildNavDialog(navList) {
  const dialog = document.createElement('dialog');
  dialog.id = 'primary-navigation';
  dialog.classList.add('primary-navigation-dialog');

  const container = document.createElement('div');
  container.classList.add('dialog-container');
  dialog.append(container);

  const dialogHeader = document.createElement('div');
  dialogHeader.classList.add('dialog-header');
  container.append(dialogHeader);

  const headerContent = document.createElement('div');
  headerContent.classList.add('dialog-header-content');
  dialogHeader.append(headerContent);

  const dialogBody = document.createElement('div');
  dialogBody.classList.add('dialog-body');
  container.append(dialogBody);

  const toursButton = document.createElement('button');
  toursButton.classList.add('tours');

  const domain = getPgaTourDomain();
  toursButton.innerHTML = `
    <span class="img-wrap"><img src='${domain}/images/logos/pga-tour-logo-mini.svg'></span>
    <span class="heading-xs">Tours</span>
    <span class="icon icon-arrow-down open-tours"></span>
  `;
  toursButton.addEventListener('click', () => {
    const toursDialog = document.querySelector('#tours-navigation');
    toursDialog.show();
  });
  headerContent.append(toursButton);

  const close = document.createElement('button');
  close.innerHTML = '<span class="icon icon-close"></span>';
  close.classList.add('close');
  close.addEventListener('click', () => {
    document.body.style.overflowY = 'auto';
    const toursDialog = document.querySelector('#tours-navigation[open]');
    if (toursDialog) {
      closeDialog(toursDialog);
    }

    closeDialog(dialog);
  });
  close.setAttribute('aria-label', 'Close');
  headerContent.append(close);

  // when changing from breakpoints, close the dialogs to avoid weird styling issues
  const mediaQuery = window.matchMedia('(min-width:900px)');
  mediaQuery.addEventListener('change', () => {
    const toursDialog = document.querySelector('#tours-navigation');
    if (toursDialog.open) {
      toursDialog.close();
    }

    if (mediaQuery.matches && dialog.open) {
      document.body.style.overflowY = 'auto';
      dialog.close();
    }
  });

  // unroll the more links for mobile nav dialog
  const more = navList.querySelector('.more');
  const moreUl = more.querySelector('ul');
  moreUl.classList.add('navigation-list', 'secondary-navigation-list');
  more.remove();

  dialogBody.append(navList);
  dialogBody.append(moreUl);

  const dialogFooter = document.createElement('div');
  dialogFooter.classList.add('dialog-footer');
  dialogFooter.innerHTML = `
    <img src="${domain}/images/logos/pga-tour-logo.svg" alt="PGA TOUR">
    <h4>Create An Account</h4>
    <p>Track your favorite players, tours, topics and tournaments</p>
    <div class="button-container">
      <button class="button sign-up">Sign Up</button>
      <button class="button secondary sign-in">Sign In</button>
    </div>
  `;
  // dialogFooter.querySelector('.sign-up').addEventListener('click', () => {
  //   document.querySelector('#sign-up-dialog').showModal();
  // });
  // dialogFooter.querySelector('.sign-in').addEventListener('click', () => {
  //   document.querySelector('#sign-in-dialog').showModal();
  // });
  container.append(dialogFooter);

  return dialog;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('header-container');

  const logo = block.querySelector('a > img');
  decorateLogo(logo, container);
  logo.closest('a').remove();

  const remainingNavLinks = block.querySelectorAll('a');

  const navLinks = [];
  let moreLink;
  const tourLinks = [];
  remainingNavLinks.forEach((link) => {
    const linkText = link.innerText;
    if (moreLink === undefined) {
      if (linkText.toLocaleLowerCase() === 'more') {
        moreLink = link;
      } else {
        navLinks.push(link);
      }
    } else {
      tourLinks.push(link);
    }
  });

  block.innerHTML = '';

  const bodyClasses = [...document.body.classList];
  const isGenesis = bodyClasses.includes('genesis');
  if (!isGenesis) {
    const moreLinks = buildMoreLinks(moreLink);
    decorateNav(navLinks, moreLinks, container);
    decorateUserActions(container);
    block.append(buildNavDialog(container.querySelector('.primary-navigation-list').cloneNode(true)));
    block.append(buildToursDialog(tourLinks));
    block.append(buildSignInDialog());
    block.append(buildSignUpDialog());
  }

  block.append(container);

  decorateIcons(block);
  block.classList.add('appear');
}
