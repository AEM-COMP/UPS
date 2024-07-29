import { createKeyLine } from '../../scripts/scripts.js';
/**
 * decorate the banner block element
 * @param {Element} block the banner block
 */
export default async function decorate(block) {
  const getsKeyline = !block.classList.contains('skinny');
  if (getsKeyline) {
    block.querySelectorAll('h2').forEach(createKeyLine);
  }
}
