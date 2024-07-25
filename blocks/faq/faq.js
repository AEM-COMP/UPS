/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
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
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';

    const accordionContent = document.createElement('div');
    accordionContent.className = 'accordion-item-content';
    accordionContent.append(...body.childNodes);
    body.append(accordionContent);

    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
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
