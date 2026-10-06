const SUPABASE_URL='https://saipuhuzotusqfihvjgw.supabase.co';
const SUPABASE_KEY='sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const page=document.querySelector('#food-page');
const slug=new URLSearchParams(location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const cleanText=v=>String(v??'').replace(/\\n/g,'\n').replace(/\r/g,'');
const paragraphs=text=>cleanText(text).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x).replace(/\n/g,'<br>')}</p>`).join('');
const lines=text=>cleanText(text).split(/\n+/).map(x=>x.trim()).filter(Boolean);
const section=(eyebrow,title,body)=>`<section class="food-section"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${body}</section>`;
const list=(items,renderer)=>items.length?`<div class="stack">${items.map(renderer).join('')}</div>`:'<p class="muted">Ainda não há informação publicada nesta seção.</p>';

function splitEntries(text){
  return lines(text);
}
function parseMyths(content){
  const blocks=cleanText(content).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const rows=[];
  let current=null;
  for(const block of blocks){
    const mito=block.match(/^MITO:\s*(.*?)(?:\n|$)([\s\S]*)$/i);
    const verdade=block.match(/^VERDADE:\s*(.*)$/i);
    if(mito){ current={q:mito[1].trim(),a:''}; rows.push(current); if(mito[2].trim()) current.a=mito[2].trim(); continue; }
    if(verdade){ if(current) current.a=verdade[1].trim(); else rows.push({q:'Mito e verdade',a:verdade[1].trim()}); continue; }
    const parts=block.split(/\n(?=VERDADE:\s*)/i);
    if(parts.length>1){
      const q=parts[0].replace(/^MITO:\s*/i,'').trim();
      const a=parts[1].replace(/^VERDADE:\s*/i,'').trim();
      rows.push({q,a});
    }
  }
  if(!rows.length){
    const normalized=cleanText(content).replace(/\s+/g,' ').trim();
    const matches=[...normalized.matchAll(/MITO:\s*(.*?)(?=\s+VERDADE:)|VERDADE:\s*(.*?)(?=\s+MITO:|$)/gi)];
    for(let i=0;i<matches.length;i+=2){
      const q=(matches[i]?.[1]||'').trim();
      const a=(matches[i+1]?.[2]||'').trim();
      if(q||a) rows.push({q,a});
    }
  }
  return rows;
}
function parseFaq(content){
  const blocks=cleanText(content).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  return blocks.map(block=>{
    const m=block.match(/^(.+?\?)\s*(?:—|-|:)?\s*([\s\S]*)$/);
    return m?{q:m[1].trim(),a:m[2].trim()||'Resposta ainda não publicada.'}:{q:block,a:'Resposta ainda não publicada.'};
  });
}
function parseCuriosities(content){
  const normalized=cleanText(content).replace(/\r/g,'').trim();
  const matches=[...normalized.matchAll(/(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=(?:\n\s*\d+\.\s+)|$)/g)];
  return matches.map(m=>({n:m[1],text:m[2].trim()}));
}
function editorialBody(type,content){
  if(type==='varieties'){
    const rows=splitEntries(content).map(line=>{const p=line.split(/\s[—–-]\s/);return [p[0].replace(/:$/,''),p.slice(1).join(' — ')||line.replace(/^.*?:\s*/,'')];});
    return `<div class="variety-table"><div class="variety-head"><span>Variedade / corte</span><span>Perfil e uso</span></div>${rows.map(r=>`<div class="variety-row"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div>`).join('')}</div>`;
  }
  if(type==='myths'||type==='faq'){
    const rows=type==='myths'?parseMyths(content):parseFaq(content);
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
  document.title=`${food.name} | Tem Gosto do Q?`;
  const categoryNames=(cats.data||[]).map(x=>x.categories?.name).filter(Boolean);
  const profile=[['Intensidade',food.taste_intensity],['Doçura',food.sweetness],['Acidez',food.acidity],['Amargor',food.bitterness],['Salinidade',food.salinity],['Umami',food.umami],['Gordura percebida',food.perceived_fat],['Aroma',food.aroma_intensity],['Firmeza',food.texture_firmness]];
  const bars=profile.filter(x=>x[1]!=null).map(([name,value])=>`<div class="taste-meter"><div><span>${esc(name)}</span><strong>${esc(value)}/5</strong></div><div class="meter"><i style="width:${Number(value)*20}%"></i></div></div>`).join('');
  const sourceLink=s=>s?.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||'Fonte')}</a>`:'';
  const extra=(editorial.data||[]).filter(x=>!['curiosity','myths','faq'].includes(x.section_type));
  const myths=(editorial.data||[]).find(x=>x.section_type==='myths');
  const faq=(editorial.data||[]).find(x=>x.section_type==='faq');
  const curiositySection=(editorial.data||[]).find(x=>x.section_type==='curiosity');
  const curios=curiositySection?parseCuriosities(curiositySection.content):[];
  page.innerHTML=`
    <section class="food-hero"><div class="food-hero-inner"><p class="eyebrow">${esc(categoryNames.join(' · ')||'Investigação gastronômica')}</p><h1>${esc(food.name)}</h1>${food.scientific_name?`<p class="scientific">${esc(food.scientific_name)}</p>`:''}<div class="answer-card"><span>Tem gosto de quê?</span><strong>${esc(food.short_taste_answer)}</strong><p>${esc(food.editorial_taste_description)}</p></div></div></section>
    <div class="section food-content">
      ${section('O que é?','O que é a '+food.name+'?',`<div class="overview-copy">${paragraphs(food.what_is||food.summary)}</div><div class="fact-grid"><article class="fact-card"><span>Origem</span><strong>${esc(food.origin_summary||'Informação em pesquisa.')}</strong></article><article class="fact-card"><span>Tempo até a colheita / abate / preparo</span><strong>${esc(food.time_to_harvest_or_ready||'Varia conforme o alimento.')}</strong></article><article class="fact-card"><span>Primeiro uso conhecido</span><strong>${esc(food.first_known_use||'Informação em pesquisa.')}</strong></article><article class="fact-card"><span>Quando é colhido / abatido</span><strong>${esc(food.harvest_window||'Varia conforme espécie, região e finalidade.')}</strong></article></div>`)}
      ${section('Perfil de sabor','Como é o sabor?',`<div class="taste-grid">${bars}</div><div class="two-columns"><div><h3>Textura</h3>${paragraphs(food.texture)}</div><div><h3>Aroma</h3>${paragraphs(food.aroma)}</div></div>`)}
      ${section('Relatos reunidos','O que as pessoas dizem?',`<article class="report-narrative">${paragraphs(food.taste_narrative||'Os relatos ainda estão sendo reunidos e comparados.')}</article>`)}
      ${section('Linha do tempo','A história da '+food.name,list(history.data||[],h=>`<article class="timeline-item"><span>${esc(h.period_label)}</span><div><h3>${esc(h.title)}</h3>${paragraphs(h.content)}</div></article>`))}
      ${section('Da origem ao prato','Como '+food.name+' chega à mesa',list(steps.data||[],s=>`<article class="step-card"><span class="step-number">${s.step_order}</span><div><h3>${esc(s.title)}</h3>${paragraphs(s.description)}${s.technique?`<small>${esc(s.technique)}</small>`:''}${s.duration||s.temperature?`<div class="process-meta">${s.duration?`<span>${esc(s.duration)}</span>`:''}${s.temperature?`<span>${esc(s.temperature)}</span>`:''}</div>`:''}</div></article>`))}
      ${section('Preparo','Algumas formas de preparo',list(preps.data||[],p=>`<article class="prep-card"><h3>${esc(p.name)}</h3>${p.region?`<span>${esc(p.region)}</span>`:''}${paragraphs(p.description)}<small>${esc(p.technique)}</small></article>`))}
      ${extra.map(x=>section(x.section_type.replaceAll('_',' '),x.title,editorialBody(x.section_type,x.content))).join('')}
      ${myths?section('Mitos e verdades',myths.title,editorialBody('myths',myths.content)):''}
      ${faq?section('Perguntas frequentes',faq.title,editorialBody('faq',faq.content)):''}
      ${section('Curiosidades','10 curiosidades',curios.length?`<div class="curiosity-list">${curios.map((c,i)=>`<details class="curiosity-item"><summary><span>${String(i+1).padStart(2,'0')}</span>${esc(c.text.split(/\.\s/)[0].replace(/^\d+\.\s*/,''))}</summary><div class="curiosity-answer">${paragraphs(c.text.replace(/^\d+\.\s*/,''))}</div></details>`).join('')}</div>`:'<p class="muted">As curiosidades ainda estão sendo reunidas.</p>')}
      ${section('Receitas','3 receitas com '+food.name,recipes.data?.length?`<div class="recipe-list">${recipes.data.slice(0,3).map((r,i)=>`<article class="recipe-card">${r.image_url?`<img class="recipe-image" src="${esc(r.image_url)}" alt="${esc(r.name)}" loading="lazy">`:''}<div class="recipe-heading"><span>Receita ${i+1}</span><h3>${esc(r.name)}</h3></div>${r.region?`<p class="recipe-meta">${esc(r.region)} · ${esc(r.difficulty||'')}</p>`:''}<div>${paragraphs(r.description)}</div><details><summary>Ingredientes</summary><div>${paragraphs(r.ingredients)}</div></details><details><summary>Modo de preparo</summary><div>${paragraphs(r.instructions)}</div></details><small>${r.servings?`Rendimento: ${esc(r.servings)} · `:''}${r.prep_time?`Preparo: ${esc(r.prep_time)} · `:''}${r.cook_time?`Cozimento: ${esc(r.cook_time)} · `:''}${r.oven_temperature?`Forno: ${esc(r.oven_temperature)}`:''}</small></article>`).join('')}</div>`:'<p class="muted">As receitas ainda estão sendo preparadas.</p>')}
      ${section('Fontes','De onde vieram as informações?',list(sources.data||[],s=>`<article class="source-card"><span>${esc(s.sources?.source_type||'Fonte')}</span>${sourceLink(s.sources)}</article>`))}
    </div>`;
}
load();