async function populateSuggestions(ul) {
  const req = await fetch('/fragments/search-suggestions.json');
  if (req.ok) {
    const { data } = await req.json();
    data.forEach((suggestion) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${suggestion.URL}">${suggestion.name}</a>`;
      ul.append(li);
    });
    ul.closest('div').removeAttribute('style');
  }
}

function registerEventListeners(doc) {
  const search = doc.getElementById('search-modal');
  const suggestions = search.querySelector('.tools-search-suggestions ul');

  // enable form submission
  search.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = [...search.elements][0];
    if (value && value.trim() !== '') {
      window.location.href = `https://www.ups.com/us/en/SearchResults.page?q=${encodeURIComponent(value)}`;
    }
  });

  // enable search form close
  const closeButton = search.querySelector('button#tools-search-close');
  closeButton.addEventListener('click', () => {
    const controls = closeButton.getAttribute('aria-controls');
    const controlled = document.getElementById(controls).previousElementSibling;
    const expanded = controlled.getAttribute('aria-expanded') === 'true';
    controlled.setAttribute('aria-expanded', !expanded);
  });

  populateSuggestions(suggestions);
}

registerEventListeners(document);
