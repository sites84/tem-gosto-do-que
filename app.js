const SUPABASE_URL = 'https://saipuhuzotusqfihvjgw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const categoryList = document.querySelector('#category-list');
const featuredGrid = document.querySelector('#featured-grid');
const foodCount = document.querySelector('#food-count');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const resultSection = document.querySelector('#resultado');
const resultsGrid = document.querySelector('#results-grid');
const clearSearch = document.querySelector('#clear-search');

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function foodCard(food, index=0) {
  const number = String(index + 1).padStart(2, '0');
  return `<a class="food-card featured-food-card" href="food.html?slug=${encodeURIComponent(food.slug)}">
    <span class="food-card-number">${number}</span>
    <div class="food-card-body">
      <p class="food-card-label">Tem gosto de quê?</p>
      <strong>${escapeHtml(food.name)}</strong>
      <span>${escapeHtml(food.short_taste_answer || food.summary || 'Ver investigação completa')}</span>
    </div>
    <span class="food-card-arrow" aria-hidden="true">↗</span>
  </a>`;
}

async function loadFoods() {
  featuredGrid.innerHTML = '<p class="loading">Carregando investigações...</p>';
  const { data, error } = await db.from('foods')
    .select('id,name,slug,summary,short_taste_answer,main_image_url,status,updated_at')
    .eq('status','published')
    .order('updated_at', { ascending: false });

  if (error) {
    featuredGrid.innerHTML = '<p class="loading">Não foi possível carregar os alimentos agora.</p>';
    console.error(error);
    return;
  }

  foodCount.textContent = `${data.length} investigação${data.length === 1 ? '' : 'ões'}`;
  featuredGrid.innerHTML = data.length
    ? data.map((food, index) => foodCard(food, index)).join('')
    : '<p class="loading">As primeiras investigações estão sendo preparadas.</p>';
}

async function loadCategories() {
  const { data: categories, error } = await db.from('categories').select('id,name,slug').order('name');
  if (error) {
    categoryList.innerHTML = '<p class="loading">Não foi possível carregar as categorias agora.</p>';
    console.error(error);
    return;
  }

  const { data: relations } = await db.from('food_categories').select('category_id,food_id');
  const counts = {};
  (relations || []).forEach(row => { counts[row.category_id] = (counts[row.category_id] || 0) + 1; });

  categoryList.innerHTML = categories.map(category => `<button class="category-card" type="button" data-category="${escapeHtml(category.slug)}" data-category-id="${category.id}">
    <strong>${escapeHtml(category.name)}</strong>
    <span>${counts[category.id] || 0} ${counts[category.id] === 1 ? 'investigação' : 'investigações'}</span>
  </button>`).join('');

  categoryList.querySelectorAll('[data-category-id]').forEach(button => {
    button.addEventListener('click', () => filterByCategory(button.dataset.categoryId, button.textContent.trim().split('\n')[0]));
  });
}

async function filterByCategory(categoryId, categoryName) {
  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsGrid.innerHTML = '<p class="loading">Filtrando...</p>';

  const { data: links, error: linkError } = await db.from('food_categories').select('food_id').eq('category_id', categoryId);
  if (linkError) {
    resultsGrid.innerHTML = '<p class="loading">Não foi possível filtrar esta categoria.</p>';
    return;
  }
  const ids = (links || []).map(item => item.food_id);
  if (!ids.length) {
    resultsGrid.innerHTML = `<p class="loading">Ainda não há investigações em ${escapeHtml(categoryName)}.</p>`;
    return;
  }

  const { data, error } = await db.from('foods').select('id,name,slug,summary,short_taste_answer').in('id', ids).eq('status','published').order('name');
  if (error) {
    resultsGrid.innerHTML = '<p class="loading">Não foi possível carregar esta categoria.</p>';
    return;
  }
  resultsGrid.innerHTML = data.map(food => foodCard(food)).join('');
}

async function searchFoods(term) {
  const clean = term.trim();
  if (!clean) return;
  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsGrid.innerHTML = '<p class="loading">Pesquisando...</p>';
  const { data, error } = await db.from('foods')
    .select('id,name,slug,summary,short_taste_answer,main_image_url')
    .eq('status','published')
    .or(`name.ilike.%${clean}%,summary.ilike.%${clean}%,short_taste_answer.ilike.%${clean}%`)
    .order('name').limit(24);

  if (error) {
    resultsGrid.innerHTML = '<p class="loading">Não foi possível realizar a pesquisa agora.</p>';
    console.error(error);
    return;
  }
  if (!data.length) {
    resultsGrid.innerHTML = `<p class="loading">Nenhum alimento publicado encontrado para “${escapeHtml(clean)}”.</p>`;
    return;
  }
  resultsGrid.innerHTML = data.map(food => foodCard(food)).join('');
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchFoods(searchInput.value);
});

document.querySelectorAll('[data-search]').forEach(button => {
  button.addEventListener('click', () => {
    searchInput.value = button.dataset.search;
    searchFoods(button.dataset.search);
  });
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  resultSection.classList.add('hidden');
  resultsGrid.innerHTML = '';
  searchInput.focus();
});

loadFoods();
loadCategories();
