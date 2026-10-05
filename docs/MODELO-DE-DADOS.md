# Tem Gosto do Q — Modelo de Dados Inicial

## Objetivo

Este documento define o modelo conceitual antes da criação das tabelas no Supabase. A prioridade é evitar retrabalho: o banco deve representar tanto alimentos comuns quanto itens incomuns sem criar estruturas específicas para cada caso.

## Entidade principal: alimento

Cada item recebe um registro único.

Campos conceituais:

- id
- slug
- nome
- nome_cientifico (quando aplicável)
- resumo
- resposta_curta_sabor
- descricao_sabor_editorial
- textura
- aroma
- intensidade_sabor
- status_publicacao
- imagem_principal
- criado_em
- atualizado_em

O campo `resposta_curta_sabor` será a resposta direta à pergunta "Tem gosto de quê?". A descrição completa ficará separada para permitir diferentes apresentações no site.

## Categorias

Um alimento pode pertencer a mais de uma categoria.

Categorias iniciais:

- Frutas
- Vegetais
- Ingredientes
- Carnes
- Aves
- Frutos do mar
- Peixes
- Moluscos
- Crustáceos
- Insetos
- Outros animais consumidos como alimento
- Fungos
- Fermentados
- Bebidas
- Preparações
- Outros

A categoria é uma relação, não uma característica fixa do alimento, porque alguns itens podem se encaixar em mais de uma classificação editorial.

## Perfil de sabor

Não tratar as escalas como medição científica.

Campos conceituais:

- doçura
- acidez
- amargor
- salinidade
- umami
- gordura_percebida
- intensidade_aromatica
- firmeza_textura

Cada valor poderá usar uma escala editorial padronizada, definida antes da implementação da interface.

## Comparações de sabor

Uma das partes mais importantes do projeto.

Um alimento poderá ser associado a outros alimentos por semelhança de sabor ou textura.

Exemplo conceitual:

Azeitona → lembra → alcaparra
Azeitona → lembra → azeite em determinados aspectos aromáticos

A relação deve armazenar o motivo da comparação, por exemplo:

- sabor
- textura
- aroma
- sensação na boca
- combinação desses fatores

Também deverá existir espaço para indicar que a comparação veio de relatos, de fonte gastronômica ou de análise editorial.

## Relatos de sabor

Um alimento poderá ter muitos relatos.

Campos conceituais:

- alimento_id
- fonte_id
- autor_nome (se disponível/publicável)
- texto_original_referenciado
- resumo_do_relato
- comparacoes_mencionadas
- textura_descrita
- sabor_descrito
- metodo_de_preparo
- local
- data_do_relato, quando conhecida
- tipo_de_fonte
- confiabilidade_editorial

Não publicar automaticamente todo relato encontrado. O sistema deve permitir revisão antes da publicação.

## Fontes

Cada fonte será registrada separadamente.

Campos conceituais:

- id
- titulo
- url
- autor
- dominio
- tipo
- data_publicacao
- data_acesso
- observacoes

Tipos:

- acadêmica
- governamental/institucional
- histórica
- gastronômica
- jornalística
- relato pessoal
- vídeo/multimídia
- outra

## História

A história não deve ficar limitada a um único campo gigante.

Cada alimento poderá possuir seções históricas ordenadas:

- título
- período
- conteúdo
- fonte(s)
- ordem

Isso permitirá apresentar uma linha do tempo quando houver informação suficiente.

## Origem e distribuição

Relações com países/regiões:

- alimento_id
- país/região
- tipo de relação
- período, quando relevante
- observação
- fonte

Tipos possíveis:

- origem
- domesticação
- cultivo
- consumo tradicional
- produção atual
- consumo atual

## Produção/obtenção e processamento

Não haverá uma sequência fixa obrigatória.

Cada alimento poderá ter etapas:

- etapa
- ordem
- descrição
- equipamento/técnica
- duração, quando relevante
- temperatura, quando relevante
- fonte

Exemplo para azeitona:

1. Cultivo
2. Colheita
3. Seleção
4. Lavagem
5. Cura/desamargamento
6. Conservação
7. Acondicionamento
8. Consumo

Um escorpião poderá ter outra sequência completamente diferente.

## Preparações

Uma preparação é uma forma documentada de preparar o alimento.

Campos conceituais:

- nome
- descrição
- região
- ingredientes principais
- técnica
- contexto cultural
- fonte(s)

## Pratos

Separar prato de método de preparo.

Um prato pode usar vários alimentos e um alimento pode aparecer em muitos pratos.

Relação:

- alimento
- prato
- papel do alimento no prato
- região
- observação
- fonte

## Combinações

Relação entre dois alimentos/ingredientes.

Campos conceituais:

- alimento_a
- alimento_b
- tipo
- descrição
- origem da recomendação
- fonte

Tipos:

- tradicional
- recorrente
- gastronômica
- inusitada/documentada
- editorial

## Segurança

Cada alimento poderá ter avisos específicos.

Campos conceituais:

- risco
- descrição
- prevenção
- fonte
- jurisdição, quando aplicável

Exemplos:

- toxina
- parasita
- alergênico
- contaminação
- preparo insuficiente
- parte não comestível
- restrição legal

## Legislação

Quando necessário, registrar por país/jurisdição.

Não presumir que uma regra alimentar de um país vale para outro.

## Relações entre alimentos

Uma tabela genérica de relações permitirá recursos futuros como:

- "Se você gosta de X, experimente Y"
- "Parecidos com X"
- "Mais suaves que X"
- "Mais intensos que X"
- "Alternativas a X"

Tipos serão controlados para evitar relações sem significado.

## Conteúdo editorial

O artigo visual poderá ser montado a partir dos dados estruturados e de seções editoriais.

Não criar um banco separado para cada tipo de alimento.

## Status de conteúdo

Todo conteúdo deverá ter estado editorial:

- rascunho
- em revisão
- aprovado
- publicado
- arquivado

Isso permite pesquisar e preparar conteúdo sem expor automaticamente dados incompletos.

## Princípio de segurança do banco

O frontend público não deverá possuir credenciais administrativas.

Dados públicos poderão ser acessados apenas por políticas RLS apropriadas.

Operações de escrita administrativa serão separadas do acesso público.

## Primeiro teste

O modelo deverá conseguir representar integralmente:

1. Azeitona — alimento vegetal, histórico, processado, com variedades, cura e muitos relatos.
2. Escorpião — animal consumido como alimento, com criação/coleta, preparo, relatos e questões de segurança/legalidade.

Se o modelo exigir exceções específicas para um desses dois itens, ele deverá ser revisado antes de criar as tabelas definitivas no Supabase.
