// Filters, sorting, and saved-home controls all operate on the same listing cards.
const propertyGrid = document.querySelector('#property-grid');
const propertyCards = Array.from(propertyGrid.querySelectorAll('.property-card'));
const searchForm = document.querySelector('#property-search');
const locationFilter = document.querySelector('#location-filter');
const typeFilter = document.querySelector('#type-filter');
const priceFilter = document.querySelector('#price-filter');
const priceFilterLabel = document.querySelector('#price-filter-label');
const sortFilter = document.querySelector('#sort-filter');
const resultsCount = document.querySelector('#results-count');
const emptyState = document.querySelector('#empty-state');

function updatePriceOptions() {
  const optionsByType = {
    all: [['any', 'Any budget'], ['500000', 'Up to $500k'], ['1000000', 'Up to $1m'], ['2000000', 'Up to $2m']],
    buy: [['any', 'Any price'], ['500000', 'Up to $500k'], ['1000000', 'Up to $1m'], ['2000000', 'Up to $2m']],
    rent: [['any', 'Any monthly rent'], ['2500', 'Up to $2,500/mo'], ['4000', 'Up to $4,000/mo'], ['5000', 'Up to $5,000/mo']]
  };
  const selectedOptions = optionsByType[typeFilter.value];
  const previousValue = priceFilter.value;
  priceFilter.replaceChildren(...selectedOptions.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
  priceFilter.value = selectedOptions.some(([value]) => value === previousValue) ? previousValue : 'any';
  priceFilterLabel.textContent = typeFilter.value === 'rent'
    ? 'Maximum monthly rent'
    : typeFilter.value === 'buy' ? 'Maximum purchase price' : 'Maximum budget';
}

function updateListings() {
  const searchTerm = locationFilter.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const maxPrice = priceFilter.value === 'any' ? Infinity : Number(priceFilter.value);
  const visibleCards = [];

  propertyCards.forEach((card) => {
    const locationMatches = !searchTerm || card.dataset.location.includes(searchTerm);
    const typeMatches = selectedType === 'all' || card.dataset.type === selectedType;
    const priceMatches = Number(card.dataset.price) <= maxPrice;
    const isVisible = locationMatches && typeMatches && priceMatches;
    card.hidden = !isVisible;
    if (isVisible) visibleCards.push(card);
  });

  const sortMode = sortFilter.value;
  visibleCards.sort((first, second) => {
    if (sortMode === 'price-low') return Number(first.dataset.price) - Number(second.dataset.price);
    if (sortMode === 'price-high') return Number(second.dataset.price) - Number(first.dataset.price);
    return Number(first.dataset.order) - Number(second.dataset.order);
  });
  visibleCards.forEach((card) => propertyGrid.append(card));

  const count = visibleCards.length;
  resultsCount.textContent = `Showing ${count} ${count === 1 ? 'considered space' : 'considered spaces'}`;
  emptyState.hidden = count !== 0;
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateListings();
});
typeFilter.addEventListener('change', () => {
  updatePriceOptions();
  updateListings();
});
sortFilter.addEventListener('change', updateListings);
document.querySelector('.clear-search').addEventListener('click', () => {
  searchForm.reset();
  updatePriceOptions();
  sortFilter.value = 'featured';
  updateListings();
});
propertyGrid.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.favorite-button');
  if (!favoriteButton) return;

  const isSaved = favoriteButton.getAttribute('aria-pressed') !== 'true';
  favoriteButton.setAttribute('aria-pressed', String(isSaved));
  favoriteButton.textContent = isSaved ? '♥' : '♡';
  favoriteButton.setAttribute('aria-label', `${isSaved ? 'Remove' : 'Save'} ${favoriteButton.getAttribute('aria-label').replace(/^(Save|Remove) /, '')}`);
});

// Native dialog behavior provides keyboard dismissal and an accessible modal surface.
const propertyDialog = document.querySelector('#property-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogMessage = document.querySelector('.dialog-message');
propertyGrid.addEventListener('click', (event) => {
  const detailsButton = event.target.closest('.details-link');
  if (!detailsButton) return;

  const card = detailsButton.closest('.property-card');
  const price = card.querySelector('.property-price').textContent.trim();
  const location = card.querySelector('.property-location').textContent.trim();
  const features = Array.from(card.querySelectorAll('.property-meta span'), (item) => item.textContent).join(' · ');
  dialogTitle.textContent = detailsButton.dataset.property;
  dialogMessage.textContent = `${price} · ${location} · ${features}. Get in touch and our team will share the full details, arrange a viewing, and answer your questions.`;
  propertyDialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => propertyDialog.close());
document.querySelector('.dialog-contact').addEventListener('click', () => propertyDialog.close());
propertyDialog.addEventListener('click', (event) => {
  if (event.target === propertyDialog) propertyDialog.close();
});

// Without a connected backend, the form validates input and clearly reports its demo-only status.
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Your details are valid. This demo does not send messages yet; connect a form service to receive inquiries.';
  formStatus.classList.add('is-success');
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());

const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('#primary-navigation');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  mainNavigation.classList.toggle('is-open', isOpen);
});
mainNavigation.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mainNavigation.classList.remove('is-open');
});
