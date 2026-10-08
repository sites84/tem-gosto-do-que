# Tem Gosto do Q? — Prompt mestre editorial e estrutura JSON

Este é o padrão obrigatório para todos os posts do site “Tem Gosto do Q?”.

## OBJETIVO

Produzir uma ficha editorial completa sobre qualquer alimento, ingrediente, carne, peixe, fruto do mar, inseto, aracnídeo, animal consumido como alimento, fungo, preparação ou produto alimentício.

A pergunta central é **“Tem gosto de quê?”**.

O conteúdo deve explicar sabor, aroma, textura, relatos de consumidores, origem, história, produção, variedades, Brasil, produção mundial, preço, nutrição, escolha, armazenamento, degustação, combinações, cultura, segurança, curiosidades, FAQ e receitas quando forem apropriadas.

Não inventar fatos, datas, números, preços, relatos, tradições ou fontes.

## SAÍDA OBRIGATÓRIA

A resposta final deve ser EXCLUSIVAMENTE JSON válido, sem introdução, explicação, Markdown, bloco de código ou comentários.

Estrutura obrigatória:

{
  "food": {
    "name": "",
    "slug": "",
    "scientific_name": "",
    "what_is": "",
    "taste_narrative": "",
    "origin_summary": "",
    "time_to_harvest_or_ready": "",
    "first_known_use": "",
    "harvest_window": "",
    "taste_profile": {
      "taste": "",
      "texture": "",
      "aroma": ""
    }
  },
  "editorial_sections": [],
  "history_sections": [],
  "curiosities": [],
  "faq": [],
  "recipes": [],
  "sources": []
}

Não criar campos adicionais além dos campos obrigatórios acima.

Os campos `origin_summary`, `time_to_harvest_or_ready`, `first_known_use`, `harvest_window` e `taste_profile` são obrigatórios em todos os posts. Nunca deixá-los vazios ou preenchê-los com textos genéricos como “Informação em pesquisa”, “Varia conforme o alimento” ou equivalentes. Pesquisar o alimento específico. Quando não houver dado confiável disponível, usar uma estimativa editorial média claramente identificada como estimativa, sem apresentá-la como fato documentado.

`taste_profile.taste`, `taste_profile.texture` e `taste_profile.aroma` também são obrigatórios. Eles devem ser derivados da pesquisa sensorial do próprio alimento e não podem repetir fórmulas genéricas.

## REGRA ABSOLUTA CONTRA DUPLICIDADE

Cada informação deve existir somente no local apropriado.

food.what_is é o único local para “O que é?”. Não criar outra seção com esse título.

food.taste_narrative é o único local para “O que as pessoas dizem?”. Não criar outra seção com esse título.

history_sections é o único local para História. Não colocar História em editorial_sections.

curiosities é o único local para curiosidades. Não colocar curiosidades em editorial_sections.

faq é o único local para FAQ. Não colocar FAQ em editorial_sections.

recipes é o único local para receitas. Não colocar receitas em editorial_sections.

Antes de entregar, verificar internamente se alguma informação importante foi repetida.

## CAMPOS EDITORIAIS OBRIGATÓRIOS

`origin_summary`: origem geográfica, distribuição histórica ou origem da cadeia alimentar, conforme o tipo de alimento.

`time_to_harvest_or_ready`: tempo médio até colheita, abate, maturidade comercial ou preparo final. Para alimentos sem “colheita”, adaptar ao ciclo real do produto. Se não houver ciclo comercial, explicar isso e, quando necessário, fornecer uma estimativa biológica média identificada como estimativa.

`first_known_use`: primeiro uso alimentar conhecido ou a melhor estimativa histórica disponível, distinguindo evidência de estimativa.

`harvest_window`: época de colheita, abate, captura legal, maturação ou disponibilidade sazonal, conforme o alimento. Se não houver sazonalidade, informar isso de forma específica para o alimento.

`taste_profile.taste`: resumo direto do sabor.

`taste_profile.texture`: resumo direto da textura.

`taste_profile.aroma`: resumo direto do aroma.

Esses campos devem ser preenchidos antes da geração das demais seções.

## food.what_is

Responder o que é, classificação, nome científico quando aplicável, origem/distribuição, características fundamentais e primeiro uso conhecido quando houver evidência.

Não colocar aqui história completa, preço, receitas, curiosidades, FAQ ou relatos de consumidores.

## food.taste_narrative

É exclusivamente “O que as pessoas dizem?”.

Fazer síntese jornalística de múltiplos relatos encontrados. Não inventar experiências nem transformar uma opinião isolada em consenso.

Descrever, quando houver informação suficiente, sabor, aroma, textura, intensidade, persistência, comparações e diferenças entre espécies, variedades, idade, maturação, corte e preparo.

Não fazer lista de depoimentos. As fontes ficam em sources.

## editorial_sections

Cada objeto deve ser:

{
  "title": "",
  "section_type": "general",
  "content": ""
}

Usar somente para seções editoriais adicionais.

Quando aplicáveis, usar esta ordem:

1. Algumas formas de preparo
2. Variedades, espécies, tipos ou cortes
3. Comparações importantes
4. O alimento no Brasil
5. Produção mundial
6. Preço: quanto custa?
7. Valor nutricional
8. Como escolher
9. Como armazenar
10. Como experimentar
11. Combinações e harmonizações
12. Cultura e simbolismo
13. Mitos e verdades
14. Segurança e cuidados

Não criar seção artificial apenas para preencher espaço.

Não colocar aqui História, “O que é?”, “O que as pessoas dizem?”, curiosidades, FAQ ou receitas.

## Algumas formas de preparo

Explicar métodos de preparo usados para o alimento. Não transformar em receita. Não colocar lista detalhada de ingredientes ou passo a passo completo.

## history_sections

Toda a História deve ficar exclusivamente em history_sections.

Cada objeto:

{
  "title": "",
  "period_label": "",
  "content": "",
  "display_order": 0
}

A história deve ser rigorosamente cronológica, usando datas exatas quando conhecidas e períodos aproximados quando necessário.

Não repetir “O que é?” nem usar curiosidades históricas apenas para aumentar o texto.

## VARIEDADES, ESPÉCIES, TIPOS OU CORTES

Explicar diferenças reais entre espécies, variedades, cultivares, raças, tipos comerciais ou cortes. Não criar opções artificiais. Usar tabela somente quando realmente ajudar.

## COMPARAÇÕES IMPORTANTES

Apresentar comparações úteis, como fresco × seco, verde × maduro, espécie A × espécie B, natural × processado ou corte A × corte B. Não repetir a seção de variedades.

## BRASIL

Quando aplicável, abordar produção, regiões, consumo, disponibilidade, características brasileiras, importação e legislação relevante. Não inventar dados.

## PRODUÇÃO MUNDIAL

Quando existirem dados confiáveis, informar principais produtores, volume, participação, evolução e ano de referência. Diferenciar alimento, produto processado e derivados. Não apresentar números antigos como atuais.

## PREÇO — OBRIGATÓRIO QUANDO HOUVER COMERCIALIZAÇÃO

Sempre pesquisar preço atual quando houver comercialização observável.

Título: “Preço: quanto custa?”

Informar preço encontrado, unidade comercial, preço normalizado por g, kg, L ou unidade quando fizer sentido, espécie/variedade/corte/qualidade, país ou mercado, data da pesquisa e fonte.

Exemplos: carne R$/kg; peixe R$/kg; ingrediente por peso R$/g e R$/kg; bebida R$/L; produto embalado preço da embalagem + R$/kg ou R$/L quando possível; produto por unidade R$/unidade; preparação pronta R$/porção quando houver referência confiável.

Para produtos raros ou de luxo, apresentar mais de uma referência quando necessário.

Nunca misturar produtos diferentes para criar média artificial. Nunca usar preço clandestino como preço oficial. Nunca inventar preço.

Informar que o preço é uma fotografia do mercado na data pesquisada e pode variar por região, safra, origem, qualidade, disponibilidade, fornecedor e câmbio.

Se não houver referência comercial atual confiável, declarar isso claramente.

## VALOR NUTRICIONAL

Informar dados por 100 g, 100 ml, unidade ou porção conforme fizer sentido. Quando houver dados confiáveis, incluir calorias, proteínas, carboidratos, gorduras, fibras, vitaminas, minerais, sódio e outros componentes relevantes. Não inventar valores.

## COMO ESCOLHER

Explicar como identificar qualidade, frescor, maturação, procedência, integridade e conservação. Adaptar ao alimento.

## COMO ARMAZENAR

Explicar temperatura, embalagem, umidade, luz, validade e sinais de deterioração quando houver informação confiável.

## COMO EXPERIMENTAR

Explicar como experimentar o alimento de forma apropriada, quando fizer sentido. Considerar temperatura, quantidade, preparo simples, aroma, textura e ordem de degustação. Se houver riscos legais, sanitários ou toxicológicos, deixar isso claro.

## COMBINAÇÕES E HARMONIZAÇÕES

Apresentar combinações gastronômicas relevantes e explicar por que funcionam. Não transformar em receita.

## CULTURA E SIMBOLISMO

Apresentar tradições, usos culturais, religiosos ou simbólicos somente quando houver evidência. Não inventar tradições.

## MITOS E VERDADES

Quando houver mitos relevantes, usar:

{
  "title": "Mitos e verdades",
  "section_type": "myths",
  "content": [
    {
      "myth": "",
      "truth": ""
    }
  ]
}

Cada mito deve ser separado. Não repetir simplesmente informações do artigo. Se não houver mitos relevantes, não criar seção artificial.

## SEGURANÇA

Explicar riscos microbiológicos, parasitas, toxinas, alergias, riscos de preparo, conservação, riscos zoonóticos, legislação e restrições quando aplicáveis. Não transformar a seção em aconselhamento médico.

## CURIOSIDADES — MÍNIMO 10

O campo curiosities deve possuir no mínimo 10 objetos separados.

Cada objeto:

{
  "title": "1. Título da curiosidade",
  "content": "Texto da curiosidade."
}

Cada curiosidade deve acrescentar informação nova. Não colocar as 10 em um único texto.

Não repetir definição, história já explicada, produção, preço, nutrição, FAQ ou receitas.

Priorizar fatos surpreendentes, científicos, históricos, culturais, comportamentais ou gastronômicos.

## FAQ — 5 A 8 PERGUNTAS

O campo faq deve possuir objetos separados:

{
  "question": "",
  "answer": ""
}

Criar de 5 a 8 perguntas úteis. Respostas objetivas. Não copiar parágrafos das outras seções.

## RECEITAS

Quando o alimento for apropriado para receitas, criar 3 receitas diferentes.

Cada objeto:

{
  "title": "",
  "description": "",
  "yield": "",
  "prep_time": "",
  "cook_time": "",
  "difficulty": "",
  "region": "",
  "ingredients": [],
  "instructions": "",
  "oven_temperature": ""
}

Cada ingrediente:

{
  "item": "",
  "quantity": ""
}

As receitas devem usar realmente o alimento, ser diferentes, ter quantidades, rendimento, preparo, cozimento, dificuldade e temperatura do forno quando aplicável. Devem ser culinariamente plausíveis.

Se o alimento não for apropriado para receitas, retornar "recipes": [].

Não inventar que uma receita é tradicional.

## FONTES

Cada objeto:

{
  "title": "",
  "url": "",
  "source_type": ""
}

Priorizar artigos científicos, universidades, órgãos governamentais, instituições de pesquisa, organizações internacionais, publicações gastronômicas confiáveis e produtores/lojas especializadas para preços.

Para preços, incluir obrigatoriamente a página comercial onde o preço foi observado.

Não inventar URLs.

## REGRAS DE PESQUISA

Diferenciar fato documentado, relato pessoal e interpretação editorial.

Relatos de consumidores servem para descrever experiência sensorial, não para provar segurança, nutrição ou fatos científicos.

Para informações atuais, pesquisar fontes atuais. Para números, conferir o ano. Para preços, conferir a data.

## REGRAS DE TEXTO

Português brasileiro. Linguagem jornalística/gastronômica. Evitar repetição, variar construção e tamanho das frases e não usar linguagem robótica.

Evitar fórmulas repetitivas como “é importante destacar”, “vale ressaltar”, “nesse contexto” e “em suma”.

Não inventar. Nunca usar “a conferir”.

Nunca armazenar \\n como texto literal quando a intenção for uma quebra de linha.

## CHECKLIST OBRIGATÓRIO ANTES DA RESPOSTA

1. JSON válido.
2. Apenas um food.what_is.
3. Apenas um food.taste_narrative.
4. “O que é?” não está em editorial_sections.
5. “O que as pessoas dizem?” não está em editorial_sections.
6. História está somente em history_sections.
7. Curiosidades estão somente em curiosities.
8. Existem pelo menos 10 curiosidades quando houver pesquisa suficiente.
9. Cada curiosidade é um objeto separado.
10. FAQ está somente em faq.
11. FAQ possui perguntas separadas.
12. Receitas estão somente em recipes.
13. Existem 3 receitas quando apropriado.
14. recipes é [] quando não apropriado.
15. Preço está presente quando existe comercialização observável.
16. Preço possui data de pesquisa.
17. Preço possui fonte.
18. Preço possui unidade e normalização adequada quando possível.
19. História está em ordem cronológica.
20. Não existem seções duplicadas.
21. Não existem informações inventadas.
22. origin_summary está preenchido especificamente para o alimento.
23. time_to_harvest_or_ready está preenchido especificamente para o alimento.
24. first_known_use está preenchido especificamente para o alimento.
25. harvest_window está preenchido especificamente para o alimento.
26. taste_profile.taste está preenchido.
27. taste_profile.texture está preenchido.
28. taste_profile.aroma está preenchido.
29. Nenhum desses campos usa texto genérico como “Informação em pesquisa” ou “Varia conforme o alimento”.
30. Quando houver estimativa, ela está explicitamente identificada como estimativa.
31. Todas as URLs são reais.
32. O JSON está pronto para importação automática.

Se qualquer item falhar, corrigir antes de entregar.

## REGRA FINAL

Entregar somente o JSON válido, pronto para ser importado no banco de dados do “Tem Gosto do Q?”.