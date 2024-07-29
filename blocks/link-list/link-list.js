/**
 * decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // if there is a list, use it, else find all the links and build a list from those
  let ul = block.querySelector('ul');
  if (!ul) {
    ul = document.createElement('ul');
    block.querySelectorAll('a').forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
  }
  // remove the nested divs
  block.replaceChildren(ul);
}
