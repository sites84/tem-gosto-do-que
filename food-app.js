const SUPABASE_URL='https://saipuhuzotusqfihvjgw.supabase.co';
const SUPABASE_KEY='sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const page=document.querySelector('#food-page');
const slug=new URLSearchParams(location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const cleanText=v=>String(v??'').replace(/\\+n/g,'\n').replace(/\r/g,'');
const paragraphs=text=>cleanText(text).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x).replace(/\n/g,'<br>')}</p>`).join('');
const lines=text=>cleanText(text).split(/\n+/).map(x=>x.trim()).filter(Boolean);
const section=(eyebrow,title,body)=>`<section class="food-section"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${body}</section>`;
// Carne de baleia ainda não tem uma capa própria aprovada; o post é gerado sem imagem até existir o arquivo 16:9.
const coverImages = { 'azeitona':'images/azeitona%20capa.webp', 'carne-de-macaco':'images/carne%20de%20macaco%20capa.webp', 'escorpiao':'images/escorpi%C3%A3o%20capa.webp', 'trufas':'images/trufas%20capa.webp', 'carne-de-jacare':'images/jacar%C3%A9%20capa.webp', 'caviar':'images/caviar%20capa.webp', 'carne-de-porco':'images/porco%20capa.webp', 'carne-de-elefante':'images/elefante%20capa.webp', 'durian':'images/durian%20capa.webp', 'gafanhoto':'images/gafanhoto%20capa.webp', 'cobra':'images/cobra%20capa.webp', 'carne-de-cobra':'images/cobra%20capa.webp', 'aspargos':'images/aspargos%20capa.webp' };
const list=(items,renderer)=>items.length?`<div class="stack">${items.map(renderer).join('')}</div>`:'';

function parseMyths(content){
  const raw=cleanText(content).trim();
  try{
    const data=JSON.parse(raw);
    if(Array.isArray(data)) return data.map(x=>({q:String(x.myth||x.q||'').trim(),a:String(x.truth||x.a||'').trim()})).filter(x=>x.q&&x.a);
  }catch(e){}
  return cleanText(content).split(/\n\s*\n/).map(block=>{
    const q=(block.match(/^MITO\s*[:—-]\s*([^\n]+)$/im)||[])[1]||'';
    const a=(block.match(/^VERDADE\s*[:—-]\s*([\s\S]*)$/im)||[])[1]||'';
    return {q:q.trim(),a:a.trim()};
  }).filter(x=>x.q&&x.a);
}
function parseFaq(content){
  const raw=cleanText(content).trim();
  try{
    const data=JSON.parse(raw);
    if(Array.isArray(data)) return data.map(x=>Array.isArray(x)?({q:String(x[0]||'').trim(),a:String(x[1]||'').trim()}):({q:String(x.question||x.q||'').trim(),a:String(x.answer||x.a||'').trim()})).filter(x=>x.q&&x.a);
  }catch(e){}
  const blocks=cleanText(content).split(/\n\s*\n/).filter(Boolean);
  const explicit=blocks.map(block=>{
    const q=(block.match(/^PERGUNTA\s*[:—-]\s*([^\n]+)$/im)||[])[1]||'';
    const a=(block.match(/^RESPOSTA\s*[:—-]\s*([\s\S]*)$/im)||[])[1]||'';
    return q&&a?{q:q.trim(),a:a.trim()}:null;
  }).filter(Boolean);
  if(explicit.length) return explicit;
  const text=cleanText(content).trim();
  const matches=[...text.matchAll(/(?:^|\n)\s*(.+?\?)\s*(?:—|:)\s*([\s\S]*?)(?=\n\s*.+?\?\s*(?:—|:)|$)/g)];
  return matches.map(m=>({q:m[1].trim(),a:m[2].trim()})).filter(x=>x.q&&x.a);
}
function parseIngredients(content){
  const raw=cleanText(content).trim();
  try{
    const data=JSON.parse(raw);
    if(Array.isArray(data)) return data.map(x=>({item:String(x.item||'').trim(),quantity:String(x.quantity||'').trim()})).filter(x=>x.item);
  }catch(e){}
  return [];
}
function renderIngredients(content){
  const items=parseIngredients(content);
  if(items.length) return `<ul class="recipe-ingredients">${items.map(x=>`<li><span>${esc(x.item)}</span><strong>${esc(x.quantity)}</strong></li>`).join('')}</ul>`;
  return paragraphs(content);
}
function parseCuriosities(content){
  const raw=cleanText(content).trim();
  try{
    const data=JSON.parse(raw);
    if(Array.isArray(data)) return data.map((x,i)=>({n:String(x.n||i+1),title:String(x.title||'').trim(),text:String(x.content||x.text||'').trim()})).filter(x=>x.title&&x.text);
  }catch(e){}
  return lines(content).map(line=>{
    const m=line.match(/^(\d+)\.\s*(.*)$/);
    if(!m)return null;
    const n=m[1], rest=m[2].trim();
    const parts=rest.split(/\s+[—–-]\s+/,2);
    return {n,title:(parts[0]||'').trim(),text:(parts[1]||'').trim()};
  }).filter(x=>x&&x.title&&x.text);
}
function editorialBody(type,content){
  if(type==='varieties'){
    const rows=lines(content).map(line=>{const p=line.split(/\s[—–-]\s/);return [p[0].replace(/:$/,''),p.slice(1).join(' — ')||line.replace(/^.*?:\s*/,'')];});
    if(!rows.length)return '';
    return `<div class="variety-table"><div class="variety-head"><span>Variedade / tipo</span><span>Perfil e uso</span></div>${rows.map(r=>`<div class="variety-row"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div>`).join('')}</div>`;
  }
  if(type==='myths'||type==='faq'){
    const rows=type==='myths'?parseMyths(content):parseFaq(content);
    if(!rows.length)return '<p class="muted">Esta seção ainda está sendo preparada.</p>';
    return `<div class="editorial-list">${rows.map(r=>`<details class="editorial-toggle"><summary>${esc(r.q)}</summary><div class="toggle-answer">${paragraphs(r.a)}</div></details>`).join('')}</div>`;
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
  const { data: relatedPosts } = await db.from('foods').select('id,name,slug,summary,short_taste_answer,status,updated_at').eq('status','published').neq('id',food.id).order('updated_at',{ascending:false}).limit(6);
  document.title=`${food.name}: tem gosto de quê? | Tem Gosto do Q?`;
  const cover = coverImages[food.slug];
  const categoryNames=(cats.data||[]).map(x=>x.categories?.name).filter(Boolean);
  const profile=[['Intensidade',food.taste_intensity],['Doçura',food.sweetness],['Acidez',food.acidity],['Amargor',food.bitterness],['Salinidade',food.salinity],['Umami',food.umami],['Gordura percebida',food.perceived_fat],['Aroma',food.aroma_intensity],['Firmeza',food.texture_firmness]];
  const bars=profile.filter(x=>x[1]!=null).map(([name,value])=>`<div class="taste-meter"><div><span>${esc(name)}</span><strong>${esc(value)}/5</strong></div><div class="meter"><i style="width:${Number(value)*20}%"></i></div></div>`).join('');
  const availableProfileCount=profile.filter(x=>x[1]!=null).length;
  const profileNote=availableProfileCount===0?'<p class="muted sensory-note">Não há dados suficientes para apresentar notas sensoriais sem especulação.</p>':availableProfileCount<profile.length?'<p class="muted sensory-note">Perfil parcial: são exibidas apenas as notas com informação disponível. Os campos sem base suficiente não recebem pontuação.</p>':'<p class="muted sensory-note">Escala editorial de 1 a 5; as notas sintetizam descrições disponíveis e não representam medições laboratoriais.</p>';
  function foodCardRelated(food,index=0){
  const cover=coverImages[food.slug];
  return '<a class="related-post-card" href="posts/'+encodeURIComponent(food.slug)+'/">'+
    (cover?'<img src="'+cover+'" alt="Capa de '+esc(food.name)+'" loading="lazy">':'')+
    '<div class="related-post-body"><span>Tem gosto de quê?</span><strong>'+esc(food.name)+'</strong><p>'+esc(food.short_taste_answer||food.summary||'Ver investigação completa')+'</p></div><b aria-hidden="true">↗</b></a>';
}
const sourceLink=s=>s?.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||'Fonte')}</a>`:'';
  const extra=(editorial.data||[]).filter(x=>!['curiosity','myths','faq'].includes(x.section_type) && !['O que é?','O que as pessoas dizem'].includes(x.title.trim()));
  const myths=(editorial.data||[]).find(x=>x.section_type==='myths');
  const faq=(editorial.data||[]).find(x=>x.section_type==='faq');
  const curiositySections=(editorial.data||[]).filter(x=>x.section_type==='curiosity');
  const curios=curiositySections.map((x,i)=>({n:String(i+1),title:String(x.title||'').trim(),text:cleanText(x.content).trim()})).filter(x=>x.title&&x.text);
  const historyBlock=(history.data||[]).length?section('Linha do tempo','A história de '+food.name,list(history.data||[],h=>`<article class="timeline-item"><span>${esc(h.period_label)}</span><div><h3>${esc(h.title)}</h3>${paragraphs(h.content)}</div></article>`)):'';
  const stepsBlock=(steps.data||[]).length?section('Da origem ao prato','Como chega à mesa',`<div class="stack">${steps.data.map(s=>`<article class="step-card"><span class="step-number">${s.step_order}</span><div><h3>${esc(s.title)}</h3>${paragraphs(s.description)}${s.technique?`<small>${esc(s.technique)}</small>`:''}${s.duration||s.temperature?`<div class="process-meta">${s.duration?`<span>${esc(s.duration)}</span>`:''}${s.temperature?`<span>${esc(s.temperature)}</span>`:''}</div>`:''}</div></article>`).join('')}</div>`):'';
  const prepBlock=(preps.data||[]).length?section('Preparo','Algumas formas de preparo',`<div class="stack">${preps.data.map(p=>`<article class="prep-card"><h3>${esc(p.name)}</h3>${p.region?`<span>${esc(p.region)}</span>`:''}${paragraphs(p.description)}${p.technique?`<small>${esc(p.technique)}</small>`:''}</article>`).join('')}</div>`):'';
  page.innerHTML=`
    <section class="food-hero">${cover?`<img class="food-hero-cover" src="${cover}" alt="Capa de ${esc(food.name)}">`:''}<div class="food-hero-inner"><p class="eyebrow">${esc(categoryNames.join(' · ')||'Investigação gastronômica')}</p><h1>${esc(food.name)}</h1>${food.scientific_name?`<p class="scientific">${esc(food.scientific_name)}</p>`:''}<div class="answer-card"><strong>${esc(food.short_taste_answer)}</strong><p>${esc(food.editorial_taste_description)}</p></div></div></section>
    <div class="section food-content">
      ${section('O que é?','O que é?',`<div class="overview-copy">${paragraphs(food.what_is||food.summary)}</div><div class="fact-grid"><article class="fact-card"><span>Origem</span><strong>${esc(food.origin_summary||'Não há informação suficientemente confirmada nas fontes consultadas.')}</strong></article><article class="fact-card"><span>${food.slug==='balut'?'Tempo de incubação e preparo':'Tempo até a colheita / abate / preparo'}</span><strong>${esc(food.time_to_harvest_or_ready||'Não há informação suficientemente confirmada nas fontes consultadas.')}</strong></article><article class="fact-card"><span>Primeiro uso conhecido</span><strong>${esc(food.first_known_use||'Não há uma data de primeiro uso confirmada nas fontes consultadas.')}</strong></article><article class="fact-card"><span>${food.slug==='balut'?'Quando é produzido':'Quando é colhido / abatido'}</span><strong>${esc(food.harvest_window||'Não há uma época universal confirmada nas fontes consultadas.')}</strong></article></div>`)}
      ${section('Perfil de sabor','Como é o sabor?',`${bars?`<div class="taste-grid">${bars}</div>`:''}${profileNote}<div class="two-columns"><div><h3>Textura</h3>${paragraphs(food.texture||'Não há descrição de textura suficientemente sustentada nas fontes reunidas.')}</div><div><h3>Aroma</h3>${paragraphs(food.aroma||'Não há descrição de aroma suficientemente sustentada nas fontes reunidas.')}</div></div>`)}
      ${section('Relatos reunidos','O que as pessoas dizem?',`<article class="report-narrative">${paragraphs(food.taste_narrative||'Os relatos ainda estão sendo reunidos e comparados.')}</article>`)}
      ${historyBlock}
      ${stepsBlock}
      ${prepBlock}
      ${extra.map(x=>section(x.section_type.replaceAll('_',' '),x.title,editorialBody(x.section_type,x.content))).join('')}
      ${myths?section('Mitos e verdades','Mitos e verdades',editorialBody('myths',myths.content)):''}
      ${faq?section('Perguntas frequentes','Perguntas frequentes',editorialBody('faq',faq.content)):''}
      ${section('Curiosidades',curios.length?`${curios.length} curiosidades`:'Curiosidades',curios.length?`<div class="curiosity-list">${curios.map(c=>`<details class="curiosity-item"><summary><span>${String(c.n).padStart(2,'0')}</span><strong>${esc(c.title)}</strong></summary><div class="curiosity-answer">${paragraphs(c.text)}</div></details>`).join('')}</div>`:'<p class="muted">As curiosidades ainda estão sendo reunidas.</p>')}
      ${section('Receitas','Receitas',recipes.data?.length?`<div class="recipe-list">${recipes.data.slice(0,3).map((r,i)=>`<article class="recipe-card">${r.image_url?`<img class="recipe-image" src="${esc(r.image_url)}" alt="${esc(r.name)}" loading="lazy">`:''}<div class="recipe-heading"><span>Receita ${i+1}</span><h3>${esc(r.name)}</h3></div>${r.region?`<p class="recipe-meta">${esc(r.region)} · ${esc(r.difficulty||'')}</p>`:''}<div>${paragraphs(r.description)}</div><details><summary>Ingredientes</summary><div>${renderIngredients(r.ingredients)}</div></details><details><summary>Modo de preparo</summary><div>${paragraphs(r.instructions)}</div></details><small>${r.servings?`Rendimento: ${esc(r.servings)} · `:''}${r.prep_time?`Preparo: ${esc(r.prep_time)} · `:''}${r.cook_time?`Cozimento: ${esc(r.cook_time)} · `:''}${r.oven_temperature?`Forno: ${esc(r.oven_temperature)}`:''}</small></article>`).join('')}</div>`:'<p class="muted">Não há receitas publicadas para este alimento.</p>')}
      ${section('Posts relacionados','Posts relacionados',relatedPosts?.length?'<div class="related-posts-grid">'+relatedPosts.map((p,i)=>foodCardRelated(p,i)).join('')+'</div>':'<p class="muted">Ainda não há posts relacionados.</p>')}
      ${section('Fontes','De onde vieram as informações?',list(sources.data||[],s=>`<article class="source-card"><span>${esc(s.sources?.source_type||'Fonte')}</span>${sourceLink(s.sources)}</article>`))}
    </div>`;
}
load();