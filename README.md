# Cardeal Map Template v2

Template reutilizável React, TypeScript, Vite, vite-plugin-cesium e CesiumJS. Dados, URLs, estilos e câmera pertencem à configuração; componentes e loaders não dependem de uma propriedade.

## Começar

Use Node.js 22.14+. Execute `npm.cmd ci`, copie `.env.example` para `.env.local` e configure seus próprios tokens com restrições de assets e origens. Valores VITE_* são públicos no navegador. `.env` e `.env.local` permanecem ignorados pelo Git.

Dev usa http://127.0.0.1:5173; preview usa http://127.0.0.1:4173. Em ambientes Windows restritos, use `-- --configLoader runner` se o carregamento da configuração Vite falhar.

Comandos: `npm.cmd run dev`, `npm.cmd run typecheck`, `npm.cmd run check`, `npm.cmd run build`, `npm.cmd run preview`.

Edite `src/projects/template.ts`: identificação, localização, bounds e initialCamera. A configuração ativa contém somente Bing Aerial com rótulos, com vista global neutra. World Terrain e Bing usam VITE_CESIUM_ION_TOKEN; fallbacks são elipsoide WGS84 e OpenStreetMap. Exemplos usam example.invalid e ficam fora de layers: rasters/vetores são carregados mesmo invisíveis. Nunca ative placeholders antes de substituir URLs, bounds, zoom, rótulos e créditos. O assetId 0 é um marcador inválido a substituir, não um asset real.

## Rasters e convenção TMS

Exporte TMS em **EPSG:3857**, **PNG 256×256**, arquivos **{z}/{x}/{y}.png**. No Cesium, o endereço TMS é **{z}/{x}/{reverseY}.png**. XYZ usa {z}/{x}/{y}.png. Bounds são [west, south, east, north] em graus; níveis de tiles são independentes da câmera.

```ts
{
  id: "raster", name: "Raster", description: "Seu levantamento", kind: "raster", defaultVisible: false,
  source: { format: "tms", url: "https://example.invalid/raster/{z}/{x}/{reverseY}.png",
    credit: "Seu projeto", bounds: [-1, -1, 1, 1], minimumLevel: 0, maximumLevel: 8,
    tileWidth: 256, tileHeight: 256 },
  legend: { type: "image", title: "Raster", imageUrl: "/legends/example.png", imageAlt: "Escala ilustrativa" },
}
```

404/410 confirmados em tiles individuais são recuperáveis automaticamente: não geram alerta fatal, não desativam a camada nem recriam provider. Logs próprios de borda aparecem no máximo uma vez em desenvolvimento. O browser pode registrar 404 no DevTools. Erros opacos/CORS, rede, autenticação e provider continuam detectáveis. Após 32 tiles ausentes distintos e 15 segundos sem nenhum tile válido, há aviso de possível fonte/endereço incorreto. Uma imagem válida cancela esse diagnóstico; cleanup restaura requestImage e cancela timers. allowMissingTiles é mantido apenas por compatibilidade.

## GeoJSON e popups

Exporte ou reprojete antes do upload para **longitude, latitude** em WGS84/CRS84, num fluxo compatível com EPSG:4326. Exemplo geográfico sintético: [0.01, -0.02]. Coordenadas UTM como [466000, 7639000] não são lon/lat. O template não reprojeta UTM automaticamente. URLs devem permitir CORS.

```ts
source: {
  format: "geojson", url: "https://example.invalid/areas.geojson", autoZoom: false,
  uniqueFeatureIds: true,
  popup: { title: "Área", titleProperty: "label", titlePrefix: "Unidade ", fields: [
    { property: "size", label: "Área", decimals: 2, suffix: " ha" },
    { property: "value_count", label: "Quantidade", format: "integer" },
    { property: "class_code", label: "Classe", prefix: "Código " },
  ] },
}
```

Entity.properties/PropertyBag.getValue(viewer.clock.currentTime) resolve as propriedades dinamicamente. O popup customizado Cardeal mantém posicionamento e não usa InfoBox. Campos null, undefined, ausentes e números não finitos são omitidos; zero permanece. Números usam pt-BR, format integer ou decimals; numberFormat { locale, decimalPlaces } permite personalizar. Prefix/suffix não são adicionados automaticamente: dados que já trazem unidades devem ficar sem suffix. Títulos aceitam titleProperty, titlePrefix/titleSuffix e title de fallback. O relógio atualiza valores temporais; seleção por prioridade considera zIndex sem substituir ferramentas de medição.

ignoreAltitude: true remove altitude de uma cópia em memória antes do GeoJsonDataSource.load, sem alterar atributos/arquivos. uniqueFeatureIds gera IDs por camada/posição da feição para evitar perda de trechos que compartilham identificadores. Nenhuma geometria é simplificada.

## Polígonos por atributos e bordas espessas

```ts
style: {
  stroke: "#32404A", strokeWidth: 3, fill: "#B6C3CF", fillOpacity: 0.35,
  clampToGround: true, zIndex: 1,
  classification: { property: "class_code", classes: {
    A: { fill: "#285F9E" }, B: { fill: "#C68524", fillOpacity: 0.5 },
  } },
  outline: { property: "color_index", colors: ["#285F9E", "#C68524", "#6B4E99"],
    width: 3, fallbackColor: "#32404A" },
}
```

classification usa chaves String do atributo, sem ordem de feições ou sorteio. fill/stroke/strokeWidth são fallback; fillOpacity multiplica o alpha da cor (0–1). Classes podem alterar fill, fillOpacity, stroke, strokeWidth e zIndex. Outline usa índice inteiro da paleta, com fallback explícito. Para ocultar contornos, use polygonOutline: false. opacityControl: true na camada habilita o slider existente, multiplicando o alpha inicial sem acumular mudanças.

O polígono original mantém fill e picking. Anéis exteriores e buracos recebem helpers PolylineGraphics fechados, com largura em pixels e clampToGround configurável, sem preencher outra vez. Helpers compartilham atributos/popup e pertencem ao mesmo DataSource; ao desativar são removidos da coleção, ao reativar são reinseridos sem duplicações, e descarte da camada remove seus recursos.

## Linhas por classes

```ts
style: {
  stroke: "#32404A", strokeWidth: 1, clampToGround: true, zIndex: 10,
  classification: { property: "level_code", classes: {
    minor: { stroke: "#34B3C8", strokeWidth: 1, zIndex: 10 },
    major: { stroke: "#2457B2", strokeWidth: 3.5, zIndex: 11 },
  } },
}
```

O mesmo mecanismo aceita propriedades numéricas/categóricas. Polylines usam as cores, larguras e prioridades configuradas; ground zIndex prevalece quando suportado. Para sobrepor linhas a polígonos, configure prioridades superiores e valide visualmente nos dados finais.

## Modelos URL/ion e clipping

```ts
// Duas alternativas independentes. Os modelos carregam ao ativar, sem mover a câmera.
source: { format: "3d-tiles", source: "url", url: "https://example.invalid/tileset.json", heightOffsetMeters: 0 }
source: { format: "3d-tiles", source: "ion", assetId: 0, tokenEnv: "VITE_CESIUM_3D_TOKEN" }
// assetId 0 deve ser substituído pelo asset da nova propriedade.
```

URL preserva transformação/georreferenciamento nativo e resolução de conteúdo relativo. Ion usa IonResource.fromAssetId com token dedicado opcional no ambiente VITE_CESIUM_3D_TOKEN, seguido de Cesium3DTileset.fromUrl. tokenEnv pode ser omitido para usar esse nome padrão; não herda automaticamente o token do viewer. Sem token configurado, o carregamento ion sinaliza erro sem expor credenciais. heightOffsetMeters é opcional e desloca o modelo relativamente à transformação original.

```ts
// Dentro de source do modelo: apenas exemplo sintético próximo de 0°.
clipping: {
  enabled: true, inverse: true,
  positions: [[-0.01, -0.01], [0.01, -0.01], [0.01, 0.01], [-0.01, 0.01]],
}
```

Recorte opcional validado, via ClippingPolygon/ClippingPolygonCollection exclusiva do tileset. Sem config ou enabled: false não se aplica. inverse: true mantém o interior. Exige WebGL 2; coordenadas em graus, ao menos três vértices, sem repetir o primeiro no fim. Coleções são descartadas com o dono. A proteção pontual de volumes inválidos usa internos somente no Cesium 1.146 e deve ser revista em upgrades.

terrainCutout: true é uma opção separada: aplica no globe uma coleção independente de recorte complementar enquanto o modelo carregado está visível. Não compartilha a coleção do tileset; desligar restaura terreno/imagens e cleanup libera o recorte. Por padrão clipping afeta somente o modelo e terrainCutout fica ausente. Havendo outro recorte do globe, ele é preservado; apenas um cutout pode possuir o globe por vez.

## Produção e ferramentas de desenvolvimento

```ts
developmentTools: { modelAlignment: false, cropAuthoring: false, cameraCapture: false }
```

Produção mostra apenas o controle principal na seção Modelo 3D. Ferramentas avançadas dependem de import.meta.env.DEV **e** opt-in: modelAlignment habilita altura relativa com restauração; cropAuthoring habilita autoria, undo, preview, validação e exportação do polígono; cameraCapture habilita captura. Elas não aparecem no build de produção, mesmo com flags true. Editores limpam handlers/helpers e restauram transformação/recorte ao desmontar; o editor de crop modifica apenas o modelo, não redesenha o cutout do globe.

Para capturar: habilite cameraCapture, execute npm run dev, ajuste a vista e no console dispare window.dispatchEvent(new Event("cardeal:capture-camera")). O JSON gerado vai para initialCamera. Longitude/latitude, heading/pitch/roll são graus; height é metros acima do elipsoide. Home e abertura compartilham a configuração; ativar o modelo não reposiciona câmera.

## Interface e validação

Preservados grupos Mapa base/Rasters/Vetores/Modelo 3D, múltiplos rasters com sliders independentes, coordenadas/distância/área/diferença de cota/limpeza, navegação/Home, drawer/backdrop/cabeçalho mobile, legendas PNG com expansão por toque e atribuição nativa Cesium. Não altere o layout aprovado para adicionar um tema.

Checks locais usam dados sintéticos, sem assets reais/tokens/rede. Execute typecheck, check e build. Para cada propriedade final, valide URLs/CORS, georreferenciamento, prioridades de linhas, seleção, opacidade e desktop/mobile com seus dados. Esta atualização estrutural não exige nova rodada manual exaustiva.

src/projects mantém configuração; src/cesium contém infraestrutura; src/hooks cuida do lifecycle; src/components contém UI genérica; public/legends recebe PNGs; scripts contém checks. Não versionar .env/.env.local, node_modules, dist, caches ou .verification.
