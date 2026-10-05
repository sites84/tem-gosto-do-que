const SUPABASE_URL = 'https://saipuhuzotusqfihvjgw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const categoryList = document.querySelector('#category-list');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const resultSection = document.querySelector('#resultado');
const resultsGrid = document.querySelector('#results-grid');
const clearSearch = document.querySelector('#clear-search');

function escapeHtml(value='') {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

async function loadCategories() {
  const { data, error } = await db.from('categories').select('id,name,slug').order('name');
  if (error) {
    categoryList.innerHTML = '<p class="loading">Não foi possível carregar as categorias agora.</p>';
    console.error(error);
    return;
  }
  if (!data.length) {
    categoryList.innerHTML = '<p class="loading">As categorias serão preenchidas na próxima etapa.</p>';
    return;
  }
  categoryList.innerHTML = data.map(category => `<a class="category-card" href="#"><strong>${escapeHtml(category.name)}</strong><span>Explorar</span></a>`).join('');
}

async function searchFoods(term) {
  const clean = term.trim();
  if (!clean) return;
  resultSection.classList.remove('hidden');
  resultsGrid.innerHTML = '<p class="loading">Pesquisando...</p>';
  const { data, error } = await db.from('foods').select('id,name,slug,summary,short_taste_answer,main_image_url').eq('status','published').ilike('name', `%${clean}%`).order('name').limit(24);
  if (error) {
    resultsGrid.innerHTML = '<p class="loading">Não foi possível realizar a pesquisa agora.</p>';
    console.error(error);
    return;
  }
  if (!data.length) {
    resultsGrid.innerHTML = `<p class="loading">Nenhum alimento publicado encontrado para “${escapeHtml(clean)}”.</p>`;
    return;
  }
  resultsGrid.innerHTML = data.map(food => `<a class="food-card" href="food.html?slug=${encodeURIComponent(food.slug)}"><strong>${escapeHtml(food.name)}</strong><span>${escapeHtml(food.short_taste_answer || food.summary || 'Ver investigação')}</span></a>`).join('');
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchFoods(searchInput.value);
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  resultSection.classList.add('hidden');
  resultsGrid.innerHTML = '';
  searchInput.focus();
});

loadCategories();
