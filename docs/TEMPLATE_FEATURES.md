# Recursos genéricos do template

A abertura permanece com `layers: [basemap]`, câmera global neutra e nenhuma
camada territorial. Exemplos com `example.invalid` continuam fora da lista ativa.
Não basta marcar um raster ou vetor como invisível: o loader existente inicializa
essas fontes mesmo assim. Configure e valide as fontes antes de incluí-las.

## Configuração em src/projects/

- `group`: `basemap`, `raster`, `vector`, `model` ou `macro`. Sem configuração,
  o painel infere o grupo pelo tipo da camada. Grupos vazios ficam ocultos.
- `subsection`: título livre de subseção, inclusive para Análise Macro. Mantenha
  camadas da mesma subseção contíguas na lista.
- Busca ignora acentos e considera nome, descrição e subseção. Durante a busca,
  os resultados ficam expandidos; limpar a busca restaura os grupos recolhidos.
  Contadores mostram ativo/total do grupo completo, sem alterar visibilidade.
- `legendMode: "embedded"`: a legenda já está nos pixels da fonte; mostra uma
  indicação no painel e evita duplicar a legenda externa. Não gera uma legenda.
  Sem essa opção, `legend` mantém as imagens e gradientes externos existentes.
- `source.popup` em GeoJSON preserva título, campos, rótulos, unidades e formatos
  numéricos configuráveis. Nenhum atributo de imóvel foi acrescentado.
- Sliders continuam disponíveis para XYZ/TMS e vetores com `opacityControl`.
  Os estados do hook existente agora são apresentados no painel: carregamento,
  erro de inicialização e mapa base alternativo. Isso não representa progresso
  individual dos tiles nem acrescenta retentativa automática para vetores/rasters.
- `scenes`: lista opcional de `{ id, label, description?, layerIds }`. Cada cena
  define o conjunto exato de camadas visíveis; inclua o mapa base se desejado.
  IDs desconhecidos são ignorados. Nenhuma cena modifica a câmera.
- `diagnostic.steps`: etapas opcionais com `title`, `text`, `layerIds?`, `facts?`
  e `references?`. Sem etapas, o seletor Explorar/Diagnóstico não aparece.
  Cada etapa pode aplicar um conjunto exato de camadas; omitir `layerIds`
  preserva a seleção atual. Voltar a Explorar mantém a última seleção.
- `exclusiveGroup`: permite exclusividade entre camadas. Vale para a abertura,
  seleção manual, cenas e etapas; a última camada solicitada do grupo prevalece.
- `temporalCampaign: { label, description, comparisonLabel? }` em overlays
  XYZ/TMS habilita o seletor temporal. Há uma única série por projeto, com um
  período visível de cada vez no modo simples, mesmo sem `exclusiveGroup`.
- `temporalComparison: { left, right }` habilita o comparador somente quando os
  IDs apontam para períodos configurados e existem pelo menos duas campanhas.
  A comparação permite dois períodos simultâneos, inclusive o mesmo em ambos
  os lados. Sair restaura a seleção temporal simples; alterações em outras
  camadas e opacidades permanecem. Cenas e diagnóstico encerram a comparação.
  Rasters acima dos períodos podem cobrir a imagem; o controle avisa sobre eles.
  O divisor responde a toque, mouse, setas e teclas Home/End.

GPS é iniciado apenas pelo botão Minha localização. Recentrar, precisão estimada,
erros de permissão e desativação são tratados sem gravar a posição. Requer
geolocalização do navegador e contexto seguro (HTTPS ou localhost).

## Compatibilidade e escopo

Comparados os módulos de painel, navegação/GPS, temporalidade e diagnóstico de
Jurema e Andrelândia. Sliders, popups, legendas externas e estrutura responsiva
já existiam e foram preservados. Nenhum App.tsx foi transplantado integralmente.

`package.json` declara `^1.145.0`; lockfile e pacote instalado registram Cesium
**1.146.0**. Os tipos locais confirmam `ImageryLayer.splitDirection`,
`Scene.splitPosition`, propriedades de entidades e `HeightReference.CLAMP_TO_TERRAIN`.
Referências públicas: [ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html)
e [Scene](https://cesium.com/learn/cesiumjs/ref-doc/Scene.html).
Não foram alterados dependências, loaders, viewer, Home, medições ou tratamentos
de compatibilidade. A única adaptação no hook existente aplica/remove o split
das camadas temporais, inclusive quando terminam de carregar assincronamente.

Validação desta atualização: somente `npm.cmd run typecheck`. Build, testes de
navegador, Playwright, auditorias gerais, commit e push não foram executados.
Interações em navegador e URLs de futuros projetos ainda devem ser validadas
quando suas fontes reais forem configuradas.
