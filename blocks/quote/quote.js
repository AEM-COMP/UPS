/**
 * decorate the quote block
 * @param {Element} block the block element
 */
export default async function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    const wrappingJobsBlock = block.closest('.block.jobs');
    if (!wrappingJobsBlock) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        wrappingJobsBlock.classList.add('hide-hero-img');
      } else {
        wrappingJobsBlock.classList.remove('hide-hero-img');
      }
    });
  });
  observer.observe(block);
}
