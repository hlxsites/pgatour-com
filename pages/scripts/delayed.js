import { sampleRUM, fetchPlaceholders, getMetadata } from './lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import {
  loadScript,
  sendAnalyticsPageEvent,
  clearDataLayer,
  pushOneTrustConsentGroups,
} from './scripts.js';

const placeholders = await fetchPlaceholders();
const isProd = window.location.hostname.endsWith(placeholders.hostname);

if (!isProd === 'this') {
  // temporary override for analytics testing
  if (!localStorage.getItem('OptIn_PreviousPermissions')) localStorage.setItem('OptIn_PreviousPermissions', '{"aa":true,"mediaaa":true,"target":true,"ecid":true,"adcloud":true,"aam":true,"campaign":true,"livefyre":false}');
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

window.onscroll = () => {
  // we use window.onscroll instead of an intersection observer to avoid the invisible
  // footer triggering the observer which can happen when the user scrolls very fast.
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    sampleRUM('viewfooter', { source: 'footer' });
  }
};

// add more delayed functionality here
window.pgatour = window.pgatour || {};
window.pgatour.tracking = {
  branch: {
    apiKey: 'key_live_nnTvCBCejtgfn40wtbQ6ckiprsemNktJ',
    isWebView: 'false',
  },
  krux: {
    id: '',
  },
  indexExchange: {
    status: false,
  },
};

/* setup cookie preferences */
function getCookie(cookieName) {
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const split = decodedCookie.split(';');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < split.length; i++) {
    let c = split[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return null;
}

async function OptanonWrapper() {
  const geoInfo = window.Optanon.getGeolocationData();
  Object.keys(geoInfo).forEach((key) => {
    const cookieName = `PGAT_${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const cookie = getCookie(cookieName);
    if (!cookie || cookie !== geoInfo[key]) document.cookie = `${cookieName}=${geoInfo[key]}`;
  });

  const OneTrustActiveGroup = () => {
    /* eslint-disable */
    var y = true, n = false;
    var y_y_y = { 'aa': y, 'aam': y, 'ecid': y };
    var n_n_n = { 'aa': n, 'aam': n, 'ecid': n };
    var y_n_y = { 'aa': y, 'aam': n, 'ecid': y };
    var n_y_y = { 'aa': n, 'aam': y, 'ecid': y };

    if (typeof OnetrustActiveGroups !== 'undefined')
      if (OnetrustActiveGroups.includes(',C0002,'))
        return OnetrustActiveGroups.includes(',C0004,') ? y_y_y : y_n_y;
      else
        return OnetrustActiveGroups.includes(',C0004,') ? n_y_y : n_n_n;

    return geoInfo.country == 'US' ? y_y_y : n_n_n;
    /* eslint-enable */
  };
  if (!localStorage.getItem('OptIn_PreviousPermissions')) {
    const adobeSettings = OneTrustActiveGroup();
    adobeSettings.tempImplied = true;
    localStorage.setItem('OptIn_PreviousPermissions', JSON.stringify(adobeSettings));
  }

  clearDataLayer();
  loadScript(`https://assets.adobedtm.com/d17bac9530d5/a14f7717d75d/launch-aa66aad171be${isProd ? '.min' : ''}.js`, () => {
    pushOneTrustConsentGroups();

    loadScript('https://cdns.us1.gigya.com/js/gigya.js?apikey=3_IscKmAoYcuwP8zpTnatC3hXBUm8rPuI-Hg_cZJ-jL-M7LgqCkxmwe-ps1Qy7PoWd', () => {
      // eslint-disable-next-line no-undef
      gigya.accounts.getAccountInfo({
        callback: (response) => {
          window.gigyaAccountInfo = response;
          sendAnalyticsPageEvent();

          // wire up section analytics for stories
          if (document.body.classList.contains('story')) {
            document.querySelector('main').querySelectorAll('.section').forEach((section) => {
              const sectionObserver = new IntersectionObserver(async (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                  sectionObserver.disconnect();
                  sendAnalyticsPageEvent(section.dataset.sectionId);
                }
              }, { threshold: 0 });
              sectionObserver.observe(section);
            });
          }
        },
      });
    });
  });
}

const otId = placeholders.onetrustId;
if (otId) {
  const cookieScript = loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js');
  cookieScript.setAttribute('data-domain-script', `${otId}${isProd ? '' : '-test'}`);
  cookieScript.setAttribute('data-dlayer-name', 'adobeDataLayer');
  cookieScript.setAttribute('data-nscript', 'beforeInteractive');

  window.OptanonWrapper = OptanonWrapper;

  // if (document.querySelector('.ads')) {
  //   const adsBlock = document.querySelector('.ads');
  //   decorateBlock(adsBlock);
  //   loadBlock(adsBlock);
  // }
}

async function loadLiveChat() {
  const liveChat = getMetadata('live-chat');
  if (liveChat && ['yes', 'on', 'true'].includes(liveChat.toLowerCase())) {
    loadScript('//sdk.engage.co/sdk.js', () => { /* noop */ }, {
      'data-company': placeholders.chatCompany,
      'data-widget': placeholders.chatWidget,
    });
  }
}
loadLiveChat();
