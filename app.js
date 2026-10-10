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
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

const coverImages = {
  'azeitona': '/tem-gosto-do-que/images/azeitona%20capa.webp',
  'carne-de-macaco': '/tem-gosto-do-que/images/carne%20de%20macaco%20capa.webp',
  'escorpiao': '/tem-gosto-do-que/images/escorpi%C3%A3o%20capa.webp',
  'trufas': '/tem-gosto-do-que/images/trufas%20capa.webp',
  'carne-de-jacare': '/tem-gosto-do-que/images/jacar%C3%A9%20capa.webp',
  'caviar': '/tem-gosto-do-que/images/caviar%20capa.webp',
  'carne-de-porco': '/tem-gosto-do-que/images/porco%20capa.webp',
  'carne-de-elefante': '/tem-gosto-do-que/images/elefante%20capa.webp',
  'durian': '/tem-gosto-do-que/images/durian%20capa.webp',
  'gafanhoto': '/tem-gosto-do-que/images/gafanhoto%20capa.webp',
  'cobra': '/tem-gosto-do-que/images/cobra%20capa.webp',
  'carne-de-cobra': '/tem-gosto-do-que/images/cobra%20capa.webp',
  'aspargos': '/tem-gosto-do-que/images/aspargos%20capa.webp',
  'pepino-do-mar': '/tem-gosto-do-que/images/Pepino%20do%20mar%20capa.webp',
  'kimchi': '/tem-gosto-do-que/images/Kimchi.webp',
  'foie-gras': '/tem-gosto-do-que/images/Foie%20gras%20capa.webp',
  'avestruz': '/tem-gosto-do-que/images/Avestruz%20capa.webp',
  'carne-de-avestruz': '/tem-gosto-do-que/images/Avestruz%20capa.webp',
  'carne-de-baleia': '/tem-gosto-do-que/images/Baleia%20capa.webp',
  'balut': '/tem-gosto-do-que/images/Balut%20capa.webp'
};

function foodCard(food, index=0) {
  const number = String(index + 1).padStart(2, '0');
  const cover = coverImages[food.slug];
  return `<a class="food-card featured-food-card${cover ? ' has-cover' : ''}" href="posts/${encodeURIComponent(food.slug) + "/"}">
    ${cover ? `<img class="food-card-cover" src="${cover}" alt="Capa de ${escapeHtml(food.name)}" loading="lazy">` : ''}
    <span class="food-card-number">${number}</span>
    <div class="food-card-body">
      <p class="food-card-label">Tem gosto de quê?</p>
      <strong>${escapeHtml(food.name)}</strong>
      <span>${escapeHtml(food.short_taste_answer || food.summary || 'Ver investigação completa')}</span>
    </div>
    <span class="food-card-arrow" aria-hidden="true">↗</span>
  </a>`;
}

async function loadRecentPosts() {
  const recentList = document.querySelector('#recent-list');
  if (!recentList) return;
  recentList.innerHTML = '<p class="loading">Carregando posts recentes...</p>';
  const { data, error } = await db.from('foods').select('id,name,slug,summary,short_taste_answer,status,updated_at').eq('status','published').order('updated_at',{ascending:false}).limit(8);
  if (error) { recentList.innerHTML = '<p class="loading">Não foi possível carregar os posts recentes.</p>'; return; }
  recentList.innerHTML = (data||[]).map(foodCard).join('') || '<p class="loading">Ainda não há posts publicados.</p>';
}

async function loadCategories() {
  categoryList.innerHTML = '<p class="loading">Carregando categorias...</p>';
  const [{ data: categories, error: ce }, { data: relations, error: re }] = await Promise.all([
    db.from('categories').select('id,name,slug,created_at').order('created_at',{ascending:false}),
    db.from('food_categories').select('category_id,food_id')
  ]);
  if (ce || re) { categoryList.innerHTML = '<p class="loading">Não foi possível carregar as categorias agora.</p>'; return; }
  const { data: foods, error: fe } = await db.from('foods').select('id,name,slug,summary,short_taste_answer,status,updated_at').eq('status','published').order('updated_at',{ascending:false});
  if (fe) { categoryList.innerHTML = '<p class="loading">Não foi possível carregar os posts agora.</p>'; return; }
  const byId = Object.fromEntries((foods||[]).map(f=>[f.id,f]));
  const byCat = {};
  (relations||[]).forEach(r=>{ if(!byCat[r.category_id]) byCat[r.category_id]=[]; if(byId[r.food_id]) byCat[r.category_id].push(byId[r.food_id]); });
  categoryList.innerHTML = categories.map(c => {
    const items = byCat[c.id] || [];
    return '<section class="category-showcase"><div class="category-showcase-heading"><div><p class="eyebrow">CATEGORIA</p><h3>'+escapeHtml(c.name)+'</h3></div><span>'+items.length+' '+(items.length===1?'investigação':'investigações')+'</span></div><div class="category-carousel">'+(items.length ? items.map(foodCard).join('') : '<p class="loading">Ainda não há investigações nesta categoria.</p>')+'</div></section>';
  }).join('');
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
  const clean = term.trim().replace(/[\\,()]/g,' ');
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

if (document.documentElement.dataset.homeStatic !== 'true') {
  loadRecentPosts();
  loadCategories();
}
