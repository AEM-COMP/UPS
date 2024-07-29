import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  // decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toClassName,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function buildLinkLists(main) {
  main.querySelectorAll('.section > .default-content-wrapper > ul').forEach((ul) => {
    const allFlatLinks = [...ul.querySelectorAll('li')].every((li) => li.childElementCount === 1 && li.firstElementChild.tagName === 'A');
    if (!allFlatLinks) return;

    const defaultContentWrapper = ul.parentElement;
    const listWrapper = document.createElement('div');
    defaultContentWrapper.after(listWrapper);
    if (ul.nextElementSibling) {
      const afterListWrapper = document.createElement('div');
      afterListWrapper.className = 'default-content-wrapper';
      listWrapper.after(afterListWrapper);
      while (ul.nextElementSibling) afterListWrapper.append(ul.nextElementSibling);
    }

    const linkListBlock = buildBlock('link-list', [[ul]]);
    listWrapper.append(linkListBlock);
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildLinkLists(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates links with appropriate classes to style them as buttons
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    // identify standalone links
    if (a.href !== a.textContent && p.textContent === a.textContent) {
      a.className = 'button';
      const strong = a.closest('strong');
      const em = a.closest('em');
      const double = !!strong && !!em;
      if (double) a.classList.add('accent');
      else if (strong) a.classList.add('emphasis');
      else if (em) a.classList.add('outline');
      p.className = 'button-wrapper';
      p.replaceChildren(a);
    }
  });
}

const iconLoadingPromises = {};
async function loadIconSvg(icon, doc = document) {
  if (!icon) return;

  let svgSprite = doc.getElementById('svg-sprite');
  if (!svgSprite) {
    const div = document.createElement('div');
    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="svg-sprite" style="display: none"></svg>';
    svgSprite = div.firstElementChild;
    doc.body.append(svgSprite);
  }

  const { iconName } = icon.dataset;
  if (!iconLoadingPromises[iconName]) {
    iconLoadingPromises[iconName] = (async () => {
      const resp = await fetch(icon.src);
      const temp = document.createElement('div');
      temp.innerHTML = await resp.text();
      const svg = temp.querySelector('svg');

      const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
      symbol.id = `icons-sprite-${iconName}`;
      symbol.setAttribute('viewBox', svg.getAttribute('viewBox'));
      while (svg.firstElementChild) symbol.append(svg.firstElementChild);
      svgSprite.append(symbol);
    })();
  }
  await iconLoadingPromises[iconName];

  const temp = document.createElement('div');
  temp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-${iconName}"/></svg>`;
  icon.replaceWith(temp.firstElementChild);
}

/**
 * Observes an icon span and loads the SVG when it becomes visible
 * @param {Element} iconSpan the span element for the given icon
 */
export function useSvgForIcon(iconSpan) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadIconSvg(entry.target.querySelector('img'));
        observer.disconnect();
      }
    });
  });
  observer.observe(iconSpan);
}

/**
 * create keylines from heading elements
 * @param {Element} heading the heading element
 */
export function createKeyLine(heading) {
  const u = heading.querySelector('u') || document.createElement('u');
  heading.classList.add('keyline');
  u.textContent = heading.textContent;
  heading.replaceChildren(u);
}

function decorateHeadings(main) {
  [...main.querySelectorAll('.default-content-wrapper > h2')].forEach((h2) => {
    const defaultContentWrapper = h2.parentElement;
    const subsequentBlockWrapper = defaultContentWrapper.nextElementSibling;
    if (!subsequentBlockWrapper) return;

    createKeyLine(h2);
    const headingFor = subsequentBlockWrapper.className.replace('-wrapper', '');
    defaultContentWrapper.classList.add('block-heading', `${headingFor}-block-heading`);
  });

  [...main.querySelectorAll('.default-content-wrapper > :where(h3, h4, h5, h6)')]
    .filter((h) => !!h.querySelector('u'))
    .forEach(createKeyLine);
}

function decorateLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href);
    // protect against maito: links or other weirdness
    const isHttp = url.protocol === 'https:' || url.protocol === 'http:';
    if (!isHttp) return;

    const knownDomains = ['www.ups.com', 'hlx.page', 'hlx.live', 'aem.page', 'aem.live'];
    if (!url.hostname.includes('localhost') && !knownDomains.some((host) => url.hostname.includes(host))) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const newWindowIcon = document.createElement('span');
      newWindowIcon.className = 'icon icon-new-window';
      a.append(newWindowIcon);
      a.classList.add('external-link');
      useSvgForIcon(newWindowIcon);
    }
  });
}

function decorateImages(main) {
  main.querySelectorAll('p img').forEach((img) => {
    const p = img.closest('p');
    p.className = 'img-wrapper';
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateSections(main);
  buildAutoBlocks(main);
  decorateBlocks(main);
  decorateHeadings(main);
  decorateLinks(main);
  decorateButtons(main);
  decorateImages(main);
  decorateIcons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * build a symbol element
 * @param {String} name the symbol name
 * @returns {Element} the symbol
 */
export function buildSymbol(name) {
  const icon = document.createElement('i');
  icon.className = `symbol symbol-${toClassName(name)}`;
  return icon;
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
