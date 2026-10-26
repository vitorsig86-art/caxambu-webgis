# Clipping experimental — Caxambu-MG

O teste afeta exclusivamente o asset ion 4131174. Os cinco vértices, na ordem
e precisão fornecidas, ficam em `src/projects/caxambuClipping.ts`.

- Com clipping: `?clipping3d=on` (também é o padrão sem parâmetro).
- Sem clipping: `?clipping3d=off`.

Recarregue a página ao trocar o parâmetro e ative o Modelo fotogramétrico 3D
no painel. Ele continua desligado na abertura. O modo sem clipping omite
`source.clipping`: não cria nem associa coleção ao tileset.

O loader reutiliza `createModelClipping`, com `Cartesian3.fromDegrees`,
`ClippingPolygon` e `ClippingPolygonCollection` (`inverse: true`, conserva o
interior). Não chama `applyModelClipping`, pois esse helper legado instala
patches privados. Nenhum patch é instalado pelo experimento. A compatibilidade
foi conferida nos tipos e no código instalado do Cesium 1.146.0; o suporte do
contexto é verificado com `ClippingPolygonCollection.isSupported`.

Uma coleção é criada durante cada carregamento do tileset; desligar/religar
a camada reutiliza o mesmo tileset e coleção. Não há recorte do terreno,
alteração de transformação, outro mecanismo de recorte ou offset de altitude.

Validação restrita ao TypeScript. A estabilidade visual e a ausência do erro
intermitente de NaN ainda dependem de confirmação durante o uso do modelo.
