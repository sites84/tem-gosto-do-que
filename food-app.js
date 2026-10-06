const SUPABASE_URL='https://saipuhuzotusqfihvjgw.supabase.co';
const SUPABASE_KEY='sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const page=document.querySelector('#food-page');
const slug=new URLSearchParams(location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const cleanText=v=>String(v??'').replace(/\\n/g,'\n').replace(/\r/g,'');
const paragraphs=text=>cleanText(text).split(/\n\s*\n|\n(?=\d+\.\s)/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('');
const lines=text=>cleanText(text).split(/\n+/).map(x=>x.trim()).filter(Boolean);
const section=(eyebrow,title,body)=>`<section class="food-section"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${body}</section>`;
const list=(items,renderer)=>items.length?`<div class="stack">${items.map(renderer).join('')}</div>`:'<p class="muted">Ainda não há informação publicada nesta seção.</p>';

function splitEntries(text){
  const normalized=cleanText(text).replace(/\s+/g,' ').trim();
  let result=lines(text);
  if(result.length>1)return result;
  return normalized.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][^:]{0,45}:)/).map(x=>x.trim()).filter(Boolean);
}
function editorialBody(type,content){
  if(type==='varieties'){
    const rows=splitEntries(content).map(line=>{const p=line.split(/\s[—–-]\s/);return [p[0].replace(/:$/,''),p.slice(1).join(' — ')||line.replace(/^.*?:\s*/,'')];});
    return `<div class="variety-table"><div class="variety-head"><span>Variedade / corte</span><span>Perfil e uso</span></div>${rows.map(r=>`<div class="variety-row"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div>`).join('')}</div>`;
  }
  if(type==='myths'||type==='faq'){
    let rows=splitEntries(content);
    if(type==='myths') rows=cleanText(content).split(/\s+(?=MITO:)/i).map(x=>x.trim()).filter(Boolean);
    if(type==='faq') rows=cleanText(content).split(/\s+(?=[^?]{3,100}\?)/).map(x=>x.trim()).filter(Boolean);
    return `<div class="editorial-list">${rows.map((r,i)=>{let parts=r.split(/\s+[—–]\s+|\s+(?=VERDADE:)/i);let q=parts[0].trim();let a=parts.slice(1).join(' — ').trim();if(type==='faq'){const m=r.match(/^(.+?\?)\s*(.*)$/s);q=m?m[1]:r;a=m?m[2]:'';}return `<details class="editorial-toggle"><summary>${esc(q)}</summary><div class="toggle-answer">${paragraphs(a||r)}</div></details>`}).join('')}</div>`;
  }
  return `<div class="editorial-card">${paragraphs(content)}</div>`;
}

async function load(){
  if(!slug){page.innerHTML='<div class="section"><h1>Alimento não encontrado</h1><p>O endereço não contém um alimento.</p></div>';return;}
  const foodResult=await db.from('foods').select('*').eq('slug',slug).eq('status','published').maybeSingle();
  if(foodResult.error||!foodResult.data){page.innerHTML='<div class="section"><h1>Alimento não encontrado</h1><p>Esse alimento ainda não está publicado.</p></div>';return;}
  const food=foodResult.data;
  const [cats,history,steps,preps,editorial,recipes,sources]=await Promise.all([
    db.from('food_categories').select('categories(name,slug)').eq('food_id',food.id),
    db.from('history_sections').select('title,period_label,content').eq('food_id',food.id).eq('status','published').order('display_order'),
    db.from('processing_steps').select('step_order,title,description,technique,duration,temperature').eq('food_id',food.id).eq('status','published').order('step_order'),
    db.from('preparations').select('name,description,region,technique,cultural_context').eq('food_id',food.id).eq('status','published'),
    db.from('editorial_sections').select('title,content,section_type,display_order').eq('food_id',food.id).eq('status','published').order('display_order'),
    db.from('recipes').select('*').eq('food_id',food.id).eq('status','published').order('display_order'),
    db.from('food_sources').select('sources(title,url,source_type)').eq('food_id',food.id)
  ]);
  document.title=`${food.name} | Tem Gosto do Q?`;
  const categoryNames=(cats.data||[]).map(x=>x.categories?.name).filter(Boolean);
  const profile=[['Intensidade',food.taste_intensity],['Doçura',food.sweetness],['Acidez',food.acidity],['Amargor',food.bitterness],['Salinidade',food.salinity],['Umami',food.umami],['Gordura percebida',food.perceived_fat],['Aroma',food.aroma_intensity],['Firmeza',food.texture_firmness]];
  const bars=profile.filter(x=>x[1]!=null).map(([name,value])=>`<div class="taste-meter"><div><span>${esc(name)}</span><strong>${esc(value)}/5</strong></div><div class="meter"><i style="width:${Number(value)*20}%"></i></div></div>`).join('');
  const sourceLink=s=>s?.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||'Fonte')}</a>`:'';
  const extra=(editorial.data||[]).filter(x=>x.section_type!=='curiosity');
  const curios=(editorial.data||[]).filter(x=>x.section_type==='curiosity');
  page.innerHTML=`
    <section class="food-hero"><div class="food-hero-inner"><p class="eyebrow">${esc(categoryNames.join(' · ')||'Investigação gastronômica')}</p><h1>${esc(food.name)}</h1>${food.scientific_name?`<p class="scientific">${esc(food.scientific_name)}</p>`:''}<div class="answer-card"><span>Tem gosto de quê?</span><strong>${esc(food.short_taste_answer)}</strong><p>${esc(food.editorial_taste_description)}</p></div></div></section>
    <div class="section food-content">
      ${section('O que é?','O que é a '+food.name+'?',`<div class="overview-copy">${paragraphs(food.what_is||food.summary)}</div><div class="fact-grid"><article class="fact-card"><span>Origem</span><strong>${esc(food.origin_summary||'Informação em pesquisa.')}</strong></article><article class="fact-card"><span>Tempo até a colheita / abate / preparo</span><strong>${esc(food.time_to_harvest_or_ready||'Varia conforme o alimento.')}</strong></article><article class="fact-card"><span>Primeiro uso conhecido</span><strong>${esc(food.first_known_use||'Informação em pesquisa.')}</strong></article><article class="fact-card"><span>Quando é colhido / abatido</span><strong>${esc(food.harvest_window||'Varia conforme espécie, região e finalidade.')}</strong></article></div>`)}
      ${section('Perfil de sabor','Como é o sabor?',`<div class="taste-grid">${bars}</div><div class="two-columns"><div><h3>Textura</h3>${paragraphs(food.texture)}</div><div><h3>Aroma</h3>${paragraphs(food.aroma)}</div></div>`)}
      ${section('Relatos reunidos','O que as pessoas dizem?',`<article class="report-narrative">${paragraphs(food.taste_narrative||'Os relatos ainda estão sendo reunidos e comparados.')}</article>`)}
      ${section('Linha do tempo','A história da '+food.name,list(history.data||[],h=>`<article class="timeline-item"><span>${esc(h.period_label)}</span><div><h3>${esc(h.title)}</h3>${paragraphs(h.content)}</div></article>`))}
      ${section('Da origem ao prato','Como '+food.name+' chega à mesa',list(steps.data||[],s=>`<article class="step-card"><span class="step-number">${s.step_order}</span><div><h3>${esc(s.title)}</h3>${paragraphs(s.description)}${s.technique?`<small>${esc(s.technique)}</small>`:''}${s.duration||s.temperature?`<div class="process-meta">${s.duration?`<span>${esc(s.duration)}</span>`:''}${s.temperature?`<span>${esc(s.temperature)}</span>`:''}</div>`:''}</div></article>`))}
      ${section('Algumas formas de preparo','Algumas formas de preparo',list(preps.data||[],p=>`<article class="prep-card"><h3>${esc(p.name)}</h3>${p.region?`<span>${esc(p.region)}</span>`:''}${paragraphs(p.description)}<small>${esc(p.technique)}</small></article>`))}
      ${extra.map(x=>section(x.section_type.replaceAll('_',' '),x.title,editorialBody(x.section_type,x.content))).join('')}
      ${section('Curiosidades','10 coisas que você talvez não saiba',curios.length?`<div class="curiosity-list">${curios.map((c,i)=>`<details class="curiosity-item"><summary><span>${String(i+1).padStart(2,'0')}</span>${esc(c.title)}</summary><div class="curiosity-answer">${paragraphs(c.content)}</div></details>`).join('')}</div>`:'<p class="muted">As curiosidades ainda estão sendo reunidas.</p>')}
      ${section('Receitas','3 receitas com '+food.name,recipes.data?.length?`<div class="recipe-list">${recipes.data.slice(0,3).map((r,i)=>`<article class="recipe-card">${r.image_url?`<img class="recipe-image" src="${esc(r.image_url)}" alt="${esc(r.name)}" loading="lazy">`:''}<div class="recipe-heading"><span>Receita ${i+1}</span><h3>${esc(r.name)}</h3></div>${r.region?`<p class="recipe-meta">${esc(r.region)} · ${esc(r.difficulty||'')}</p>`:''}<div>${paragraphs(r.description)}</div><details><summary>Ingredientes</summary><div>${paragraphs(r.ingredients)}</div></details><details><summary>Modo de preparo</summary><div>${paragraphs(r.instructions)}</div></details><small>${r.servings?`Rendimento: ${esc(r.servings)} · `:''}${r.prep_time?`Preparo: ${esc(r.prep_time)} · `:''}${r.cook_time?`Cozimento: ${esc(r.cook_time)} · `:''}${r.oven_temperature?`Forno: ${esc(r.oven_temperature)}`:''}</small></article>`).join('')}</div>`:'<p class="muted">As receitas ainda estão sendo preparadas.</p>')}
      ${section('Fontes','De onde vieram as informações?',list(sources.data||[],s=>`<article class="source-card"><span>${esc(s.sources?.source_type||'Fonte')}</span>${sourceLink(s.sources)}</article>`))}
    </div>`;
}
load();
