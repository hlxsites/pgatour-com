function getTemplate() {
  return `
  <div class="footer-container">
    <div class="brand">
      <a href="<%= logo.href; %>" target="_blank" rel="noopener">
        <img src="<%= logo.src; %>" alt="<%= logo.alt; %>">
      </a>
    </div>
    <nav>
      <ul class="nav-lists">
        <% navLists.forEach((navList) => { %>
        <li class="nav-list">
          <span class="nav-list-heading"><%= navList.heading; %></span>
          <ul class="nav-sublist">
          <% navList.items.forEach((navItem) => { %>
            <li class="nav-item">
              <a href="<%= navItem.href; %>" target="_blank" rel="noopener">
                <%- navItem.image; %>
                <%= navItem.name; %>
              </a>
            </li>
          <% }); %>
          </ul>
        </li>
        <% }); %>
        <li class="nav-list nav-privacy">
          <span class="nav-list-heading">Privacy & Use</span>
          <ul class="nav-sublist">
            <% privacyLinks.forEach((privacyLink) => { %>
            <li class="nav-item">
              <a href="<%= privacyLink.href; %>" target="_blank" rel="noopener"><%= privacyLink.name; %></a>
            </li>
            <% }); %>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="social-links">
      <p class="copyright"><%= copyrightText; %></p>
      <div class="social-container">
        <% socialLinks.forEach((link) => { %>
        <a target="_blank" rel="noopener" href="<%= link.href; %>">
          <%- link.icon; %>
        </a>
        <% }); %>
      </div>
    </div>
    <p class="legal"><%= legalText; %></p>
  </div>
  `;
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

function buildNavList(navHeader, navLinks) {
  const li = document.createElement('li');
  li.classList.add('nav-list');
  li.addEventListener('click', () => {
    li.classList.toggle('active');
  });

  const span = document.createElement('span');
  span.classList.add('nav-list-heading');
  span.textContent = navHeader;
  li.prepend(span);

  const subUl = document.createElement('ul');
  subUl.classList.add('nav-sublist');
  li.append(subUl);

  navLinks.forEach((link) => {
    const subLi = document.createElement('li');
    subLi.classList.add('nav-item');
    const a = document.createElement('a');
    subLi.append(a);
    a.href = link.href;
    a.innerText = link.innerText;
    const linkImg = link.querySelector('img');
    if (linkImg) {
      a.prepend(linkImg);
    }
    subUl.append(subLi);
  });

  return li;
}

function decorateNav(navLists, privacyLinks, container) {
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  ul.classList.add('nav-lists');

  navLists.forEach((navList) => {
    const parent = navList.closest('div');
    const navHeader = parent.querySelector('h3').innerText;

    const navLinks = [...navList.querySelectorAll('li')].map((item) => item.querySelector('a'));
    const li = buildNavList(navHeader, navLinks);
    ul.append(li);
  });

  const privacyLi = buildNavList('Privacy & Use', privacyLinks);
  privacyLi.classList.add('nav-list', 'nav-privacy');
  ul.append(privacyLi);

  nav.append(ul);

  container.append(nav);
}

function decorateSocialLinks(socialLinks, copyRightText, container) {
  const div = document.createElement('div');
  div.classList.add('social-links');

  const copyright = document.createElement('p');
  copyright.classList.add('copyright');
  copyright.innerText = copyRightText.innerText;
  div.append(copyright);

  const socialContainer = document.createElement('div');
  socialContainer.classList.add('social-container');

  socialLinks.forEach((socialLink) => {
    socialContainer.append(socialLink);
  });

  div.append(socialContainer);
  container.append(div);
}

function decorateLegal(trademarksText, container) {
  const legal = document.createElement('p');
  legal.classList.add('legal');
  legal.innerHTML = trademarksText.innerHTML;
  container.append(legal);
}

export default async function decorateEjs(block) {
  const logo = block.querySelector('a > img');
  const navLists = block.querySelectorAll('nav h3 + ul');
  const trademarksText = block.querySelector(':scope > p');
  const copyRightText = block.querySelector(':scope > div > p');
  const socialLinks = copyRightText.closest('div').querySelectorAll('a');
  const privacyLinks = block.querySelectorAll(':scope > div > a');

  const data = {
    logo: {
      href: logo.closest('a').href,
      alt: logo.alt,
      src: logo.src,
    },
    navLists: [...navLists].map((navList) => {
      const parent = navList.closest('div');
      const navHeader = parent.querySelector('h3').innerText;
      const navLinks = [...navList.querySelectorAll('li')].map((item) => {
        const a = item.querySelector('a');
        const linkImg = a.querySelector('img');
        return {
          href: a.href,
          name: a.innerText,
          image: linkImg ? linkImg.outerHTML : '',
        };
      });
      return {
        heading: navHeader,
        items: navLinks,
      };
    }),
    privacyLinks: [...privacyLinks].map((link) => ({
      href: link.href,
      name: link.innerText,
    })),
    socialLinks: [...socialLinks].map((link) => ({
      href: link.href,
      icon: link.querySelector('svg').outerHTML,
    })),
    copyrightText: copyRightText.innerText,
    legalText: trademarksText.innerText,
  };
  block.innerHTML = ejs.render(getTemplate(), data);
  block.classList.add('appear');
}

export async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('footer-container');

  const logo = block.querySelector('a > img');
  const navLists = block.querySelectorAll('nav h3 + ul');
  const trademarksText = block.querySelector(':scope > p');
  const copyRightText = block.querySelector(':scope > div > p');
  const socialLinks = copyRightText.closest('div').querySelectorAll('a');
  const privacyLinks = block.querySelectorAll(':scope > div > a');

  decorateLogo(logo, container);
  decorateNav(navLists, privacyLinks, container);
  decorateSocialLinks(socialLinks, copyRightText, container);
  decorateLegal(trademarksText, container);

  block.innerHTML = '';
  block.append(container);
  block.classList.add('appear');
}
