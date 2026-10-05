# Tem Gosto do Q — Fase 0: Arquitetura

## 1. Objetivo

O Tem Gosto do Q é um site editorial e de descoberta gastronômica que responde à pergunta principal: **"Tem gosto de quê?"**

Cada item poderá ser um alimento, ingrediente, fruta, vegetal, carne, animal consumido como alimento, inseto, fungo, fruto do mar, bebida, preparação ou outro produto comestível.

A página de cada item deve explicar não apenas o sabor, mas também sua origem, história, cultura, produção ou obtenção, preparação, consumo atual, pratos tradicionais, combinações e relatos de pessoas que já experimentaram o item.

## 2. Princípio editorial central

O site não deve transformar uma opinião isolada em fato.

Informações históricas, científicas e gastronômicas devem ser diferenciadas de relatos pessoais.

Quando o sabor for descrito a partir de experiências de pessoas, a redação deve deixar claro que se trata de uma síntese dos relatos encontrados. Exemplo: "Nos relatos encontrados, a comparação mais frequente é com...".

Não inventar relatos, fontes, datas, costumes ou características de sabor.

## 3. Público

Pessoas curiosas sobre alimentos, gastronomia, história da alimentação, comidas incomuns, ingredientes, carnes, frutos do mar, insetos e culturas alimentares.

## 4. Estrutura principal do site

- Página inicial
- Categorias
- Página individual de cada item
- Busca
- Página de resultados de busca
- Página de combinações e itens semelhantes
- Página sobre o projeto
- Futuramente: favoritos e recursos personalizados

## 5. Estrutura da página de um item

### Cabeçalho
- Nome popular
- Nome científico quando aplicável
- Categoria
- Imagem principal
- Resposta curta para "Tem gosto de quê?"

### Perfil de sabor
- Sabor predominante
- Intensidade
- Doçura
- Acidez
- Amargor
- Salinidade
- Umami
- Gordura percebida
- Aroma
- Textura
- Comparações com outros alimentos

As escalas serão definidas posteriormente e não devem sugerir precisão científica quando forem apenas editoriais.

### Relatos de quem comeu
- Síntese dos relatos encontrados
- Comparações recorrentes
- Divergências entre relatos
- Contexto do preparo quando conhecido
- Links ou referências das fontes utilizadas

### O que é?
Descrição objetiva do alimento ou ingrediente.

### Origem e história
- Origem conhecida ou provável
- Evidências arqueológicas/históricas quando disponíveis
- Domesticação ou início do consumo quando aplicável
- Evolução do consumo até a atualidade

### Onde é consumido?
- Países
- Regiões
- Povos ou culturas quando relevante
- Contexto tradicional e moderno

### Por que é consumido?
Explicar fatores históricos, econômicos, culturais, ambientais, religiosos ou gastronômicos quando houver evidência.

### Da origem ao prato
Fluxo adaptável ao tipo de item:
- cultivo/criação/coleta
- colheita/obtenção
- limpeza
- processamento
- cura/fermentação/conservação
- armazenamento
- preparação
- consumo

Nem todos os passos se aplicam a todos os itens.

### Como preparar
Preparos tradicionais e modernos documentados.

### Pratos tradicionais
Lista de preparações relevantes, com país/região e contexto.

### Combinações
- Combinações tradicionais
- Combinações recomendadas
- Combinações inusitadas documentadas ou testadas editorialmente no futuro

### Segurança e legislação
Quando relevante:
- riscos alimentares
- toxinas
- parasitas
- necessidade de cocção
- alergênicos
- restrições legais
- diferenças entre países

Não substituir orientação profissional ou legislação oficial.

### Curiosidades
Fatos interessantes que tenham fonte ou sejam claramente identificados como curiosidade editorial.

## 6. Fontes

As fontes serão classificadas por tipo:

1. Científica/acadêmica
2. Institucional/governamental
3. Histórica/museu/arquivo
4. Gastronômica/profissional
5. Jornalística
6. Relato pessoal
7. Vídeo ou conteúdo multimídia

Cada afirmação relevante deverá poder ser rastreada à fonte correspondente quando possível.

## 7. Modelo de conteúdo

O banco será preparado para separar entidades e evitar textos monolíticos.

Entidades principais previstas:

- foods
- categories
- food_categories
- sources
- food_sources
- taste_reports
- preparations
- food_preparations
- dishes
- food_dishes
- countries
- food_countries
- related_foods
- articles/sections, se necessário após validação do primeiro protótipo

O modelo final será definido antes da criação das tabelas no Supabase.

## 8. Primeiro alimento-piloto

**Azeitona** será o primeiro item real.

Objetivo: testar se a arquitetura suporta um alimento convencional com história longa, diferentes variedades, processamento obrigatório ou tradicional, múltiplas formas de conservação e grande quantidade de referências gastronômicas.

## 9. Segundo alimento-piloto

Um item completamente diferente, como **escorpião**, será utilizado posteriormente para verificar se o modelo também suporta alimentos incomuns, animais consumidos como alimento, diferentes métodos de preparo, relatos pessoais e questões de segurança/legalidade.

## 10. Princípios técnicos

- Código versionado no GitHub.
- Alterações pequenas e verificáveis.
- Nenhuma grande reformulação sem preservar a versão funcional anterior.
- Banco de dados estruturado no Supabase.
- Segredos e chaves privadas nunca serão colocados no código público.
- RLS será usado nas tabelas expostas pelo Supabase.
- Migrations serão utilizadas para alterações do banco.
- Cada etapa será testada antes da próxima.
- O projeto deve funcionar bem em celular antes de receber recursos complexos.
- O frontend deve permanecer simples o suficiente para manutenção e migração futura.

## 11. Estratégia de desenvolvimento

### Fase 0
Arquitetura e especificação.

### Fase 1
Frontend mínimo e navegação principal.

### Fase 2
Modelo de dados e integração com Supabase.

### Fase 3
Página completa da azeitona.

### Fase 4
Segundo alimento-piloto e validação do modelo.

### Fase 5
Busca, filtros e descoberta por similaridade.

### Fase 6
SEO técnico e editorial.

### Fase 7
Escala de conteúdo.

### Fase 8
Monetização e otimizações.

## 12. Regra de estabilidade

Uma versão só será considerada concluída quando a funcionalidade correspondente estiver funcionando e não houver erro conhecido bloqueando seu uso.

Não avançar para uma nova camada simplesmente porque o código foi escrito. Primeiro verificar o resultado.

## 13. Objetivo de longo prazo

Criar uma grande base pública de conhecimento gastronômico orientada por uma pergunta simples e memorável:

**Tem Gosto do Q?**

O diferencial do projeto será combinar sabor + relatos reais + história + cultura + preparo + origem em uma única página pesquisável.
