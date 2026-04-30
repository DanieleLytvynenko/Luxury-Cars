/* =============================================
   LUXURY.CAR — app.js
   ============================================= */

// ---- STATE ----
let allCars = [];
let currentFilter = '';

// ---- DOM ----
const carsGrid = document.getElementById('carsGrid');
const loader = document.getElementById('loader');
const errorState = document.getElementById('errorState');
const retryBtn = document.getElementById('retryBtn');
const carSelect = document.getElementById('carInput');
const orderForm = document.getElementById('orderForm');
const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
const header = document.querySelector('.header');
const footerYear = document.getElementById('footerYear');

// ---- DYNAMIC YEAR ----
footerYear.textContent = new Date().getFullYear();

// ---- HEADER SCROLL ----
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---- BURGER MENU ----
burgerBtn.addEventListener('click', () => {
  burgerBtn.classList.toggle('open');
  mainNav.classList.toggle('mobile-open');
  document.body.style.overflow = mainNav.classList.contains('mobile-open') ? 'hidden' : '';
});

// Close nav on link click
mainNav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    burgerBtn.classList.remove('open');
    mainNav.classList.remove('mobile-open');
    document.body.style.overflow = '';
  });
});

// ---- FILTER BUTTONS ----
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    currentFilter = btn.dataset.filter;
    renderCars(filterCars(currentFilter));
    document.getElementById('carsTop').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---- FILTER LOGIC ----
function filterCars(brand) {
  if (!brand) return allCars;
  return allCars.filter(car => car.brand === brand);
}

// ---- LOAD CARS ----
async function loadCars() {
  showLoader(true);
  errorState.style.display = 'none';
  carsGrid.style.display = 'none';

  try {
    const res = await fetch('cars.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cars = await res.json();
    allCars = Array.isArray(cars) ? cars : [];
    renderCars(filterCars(currentFilter));
    populateCarSelect(allCars);
  } catch (err) {
    console.error('Failed to load cars:', err);
    showLoader(false);
    errorState.style.display = 'flex';
  }
}

// ---- RENDER CARS ----
function renderCars(cars) {
  showLoader(false);
  carsGrid.style.display = 'grid';
  carsGrid.innerHTML = '';

  if (!cars.length) {
    carsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; color: var(--gray)">
        <p style="font-size:1rem">No cars found</p>
      </div>`;
    return;
  }

  cars.forEach((car, i) => {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.style.animationDelay = `${i * 0.07}s`;

    card.innerHTML = `
      <div class="car-card__img-wrap">
        <img class="car-card__img" src="${escHtml(car.image || '')}" alt="${escHtml(car.title || 'Автомобиль')}" loading="lazy">
      </div>
      <div class="car-card__body">
        <h3 class="car-card__title">${escHtml(car.title || '')}</h3>
        <p class="car-card__desc">${escHtml(car.text || '')}</p>
        <div class="car-card__cta">
          <button class="car-card__book" data-car="${escHtml(car.title || '')}" aria-label="Book ${escHtml(car.title || 'car')}">
            Book Now
          </button>
        </div>
      </div>`;

    card.querySelector('.car-card__book').addEventListener('click', () => {
      bookCar(car.title);
    });

    carsGrid.appendChild(card);
  });
}

// ---- POPULATE SELECT ----
function populateCarSelect(cars) {
  carSelect.innerHTML = '<option value="">— Select a car —</option>';
  cars.forEach(car => {
    const opt = document.createElement('option');
    opt.value = car.title || '';
    opt.textContent = car.title || '';
    carSelect.appendChild(opt);
  });
}

// ---- BOOK A CAR ----
function bookCar(title) {
  carSelect.value = title;
  clearError(carSelect, document.getElementById('carError'));
  const orderSection = document.getElementById('order');
  orderSection.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.getElementById('nameInput').focus();
  }, 600);
}

// ---- ORDER FORM ----
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoader = document.getElementById('submitLoader');

  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitLoader.style.display = 'inline';

  // Simulate sending (no external API dependency)
  setTimeout(() => {
    openModal();
    orderForm.reset();
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitLoader.style.display = 'none';
  }, 1200);
});

// ---- RETRY BUTTON ----
retryBtn.addEventListener('click', () => {
  loadCars();
});

// ---- VALIDATION ----
function validateForm() {
  let valid = true;

  const carVal = document.getElementById('carInput').value;
  const carErr = document.getElementById('carError');
  if (!carVal) {
    showError(document.getElementById('carInput'), carErr);
    valid = false;
  } else {
    clearError(document.getElementById('carInput'), carErr);
  }

  const nameVal = document.getElementById('nameInput').value.trim();
  const nameErr = document.getElementById('nameError');
  if (!nameVal || nameVal.length < 2) {
    showError(document.getElementById('nameInput'), nameErr);
    valid = false;
  } else {
    clearError(document.getElementById('nameInput'), nameErr);
  }

  const phoneVal = document.getElementById('phoneInput').value.trim();
  const phoneErr = document.getElementById('phoneError');
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/;
  if (!phoneVal || !phoneRegex.test(phoneVal.replace(/\s/g, ''))) {
    showError(document.getElementById('phoneInput'), phoneErr);
    valid = false;
  } else {
    clearError(document.getElementById('phoneInput'), phoneErr);
  }

  return valid;
}

function showError(input, errEl) {
  input.classList.add('error');
  errEl.classList.add('visible');
}

function clearError(input, errEl) {
  input.classList.remove('error');
  errEl.classList.remove('visible');
}

// Clear errors on input
['carInput', 'nameInput', 'phoneInput'].forEach(id => {
  const el = document.getElementById(id);
  const errId = id.replace('Input', 'Error');
  const errEl = document.getElementById(errId);
  if (el && errEl) {
    el.addEventListener('input', () => clearError(el, errEl));
    el.addEventListener('change', () => clearError(el, errEl));
  }
});

// ---- MODAL ----
function openModal() {
  successModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  successModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ---- LOADER ----
function showLoader(show) {
  loader.style.display = show ? 'flex' : 'none';
}

// ---- UTIL ----
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- INIT ----
loadCars();
