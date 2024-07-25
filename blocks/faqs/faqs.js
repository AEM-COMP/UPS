/*
 * faqs Block
 * Recreate an faqs
 * https://www.hlx.live/developer/block-collection/faqs
 */
function toggleState(details, forceExpanded = null) {
  const open = forceExpanded !== null ? forceExpanded : !details.open;
  if (open) {
    details.setAttribute('open', '');
    window.requestAnimationFrame(() => {
      details.classList.add('open');
    });
  } else {
    details.classList.remove('open');
    details.addEventListener('transitionend', () => {
      details.removeAttribute('open');
    }, { once: true });
  }
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate faqs item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'faqs-item-label';
    summary.append(...label.childNodes);

    // decorate faqs item body
    const body = row.children[1];
    body.className = 'faqs-item-body';

    const faqsContent = document.createElement('div');
    faqsContent.className = 'faqs-item-content';
    faqsContent.append(...body.childNodes);
    body.append(faqsContent);

    // decorate faqs item
    const details = document.createElement('details');
    details.className = 'faqs-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  if (block.classList.contains('open')) {
    toggleState(block.querySelector('details'), true);
  }

  block.querySelectorAll('details').forEach((details) => {
    details.addEventListener('click', (e) => {
      e.preventDefault();
      if (block.classList.contains('single')) {
        block.querySelectorAll('details[open]').forEach((d) => {
          if (d !== details) toggleState(d, false);
        });
      }
      toggleState(details);
    });
  });
}
