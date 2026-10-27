# Etapa 2A — preparação técnica do Caxambu Bairro Vivo

## Resultado e escopo

A experiência técnica continua sendo a única interface. A URL sem parâmetros mantém `scene3DOnly: true`, câmera inicial, Home, estados das camadas, dois tilesets, recortes e serviços existentes. Nenhum arquivo de configuração cartográfica em `src/projects/`, URL de dados, coordenada ou dependência foi alterado nesta etapa.

O ensaio 2D é habilitado explicitamente por `?sceneModes=on`, inclusive no build de produção. Ele permite selecionar 2D/3D no mesmo Viewer, inicialmente em 3D. Remover o parâmetro e recarregar restaura a configuração restrita a 3D. Não houve publicação, commit ou push.

## Compatibilidade e arquitetura

- `package.json`: Cesium `^1.145.0`; lockfile e pacote instalado: `1.146.0`. Dependências mantidas.
- Skills consultadas: orientação Cesium, Viewer, câmera, revisão React e verificação de fluxo. As declarações e o código instalado foram confrontados com a documentação pública de [Scene](https://cesium.com/learn/cesiumjs/ref-doc/Scene.html), [Camera](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html) e [Viewer](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html).
- `src/experiences/technical.ts` isola a política da experiência técnica da configuração cartográfica. `sceneVisibility.ts` distingue seleção do usuário e visibilidade efetiva da cena. `App.tsx` continua sendo o shell técnico existente; não foi criada uma interface comunitária.
- O futuro shell comunitário pode reutilizar Viewer, loaders, hooks e configuração cartográfica, com sua política de apresentação própria. A seleção do shell deverá ocorrer antes da criação do Viewer. Não montar dois Viewers nem usar a alternância 2D/3D para trocar de shell.
- `createViewer` aceita uma capacidade 2D opcional, falsa por padrão. O parâmetro é resolvido uma vez na abertura; alternar a vista não altera essa capacidade nem recria o Viewer.
- O controlador usa `morphTo2D(0)`, `morphTo3D(0)`, eventos de morph e `camera.setView`, todas APIs públicas. Guarda cópias da posição, direção, vetor vertical e transformação da câmera 3D e as restaura ao retornar. As transições são imediatas.
- Os modelos são excluídos apenas da visibilidade efetiva em 2D. A seleção permanece guardada; as instâncias e coleções de clipping existentes são reutilizadas no retorno ao 3D. Não há novo carregamento provocado pelo painel ou pela alternância.
- Abertura e Home técnicos permanecem com o caminho original. Em 2D, Home usa o mesmo destino geográfico configurado, com vista ortográfica; a inclinação 3D não é representável nessa vista. O retorno a 3D restaura a câmera anterior à entrada em 2D.

## Verificadores corrigidos e classificação das falhas

As falhas reproduzidas eram incompatibilidades dos verificadores com a aplicação atual, não evidência de defeitos cartográficos. Nenhuma asserção foi simplesmente suprimida para aceitar uma falha funcional.

1. `check-projects.cjs`: a regra que proíbe fontes específicas em código genérico incluía indevidamente `src/projects/`, diretório destinado a fontes e temas específicos. A proibição continua aplicada a componentes, hooks, utilitários e arquivos genéricos da raiz de `src/`.
2. `check-workspace.cjs`: o carregador de teste não resolvia imports relativos TypeScript/TSX; invocava um componente com hooks sem um agendador; não fornecia `statuses`; e esperava a antiga ordem do painel. Foram corrigidos carregamento, estado sintético e expectativa para Mapa base, Modelo 3D, Rasters, Vetores e Análise Macro. Mantidos testes de callbacks, opacidade independente e legendas; adicionado bloqueio dos modelos em 2D.
3. `check-measurements.cjs`: os mocks estavam sem `postRender`, identificação de superfícies, eventos da cena e dependência `measurementUtils` dos gráficos de altura. Também esperavam ponto decimal em um resultado localizado e acumulavam um resultado de altura que a implementação substitui ao selecionar outra ferramenta. Foram corrigidos os mocks e as expectativas. Acrescentados testes de cancelamento de rascunho na transição, distância horizontal e coordenadas sem altitude em 2D, bloqueio de cota e descarte de listeners.
4. `check-template-v2.cjs`: esperava uma configuração vazia de template com uma única camada. Agora verifica unicidade de IDs, uma camada base, ausência de placeholders ativos e exclusão dos exemplos ilustrativos. Os contratos genéricos de popup, atributos, recortes e autenticação ion continuam presentes.
5. `check-raster-lifecycle.cjs`: já passava. Foi ampliado com um segundo modelo sintético e comprovação de que a ida a 2D preserva a seleção, oculta ambos e reutiliza as duas instâncias no retorno a 3D.
6. `check-scene-modes.cjs`: novo verificador de opt-in, opções do Viewer, quatro ciclos de transição, cópia/restauração de câmera, objetos destruídos, descarte do controlador, estados iniciais, coleções independentes de clipping e seus diagnósticos, captura 2D e rejeição de fallback de cota sobre objeto 3D sem profundidade. Inclui GPS com posição sintética em 2D/3D, parada e limpeza; não solicita localização real.

O relatório original da auditoria não estava entre os documentos locais encontrados. A classificação acima se baseia nas falhas efetivamente reproduzidas da suíte disponível.

## Alterações funcionais controladas

- Captura de coordenadas 2D explícita com `camera.pickEllipsoid`, sem atribuir altitude de modelo ou terreno.
- Distância 2D geodésica horizontal WGS84; área mantém o cálculo geográfico horizontal existente. O cálculo e a identificação de superfícies 3D de Diferença de cota permanecem preservados.
- Diferença de cota bloqueada em 2D no botão, no hook e na captura. Nenhum fallback de profundidade 3D foi introduzido.
- Uma mudança de projeção encerra o rascunho de medição para não misturar pontos de vistas diferentes. Resultados concluídos são preservados; gráficos de altura ficam ocultos em 2D e reaparecem em 3D.
- Zoom em 2D usa a largura do frustum ortográfico, evitando misturar coordenadas projetadas da câmera com coordenadas geocêntricas. Caminho 3D de navegação mantido.
- O seletor experimental foi colocado no rodapé no mobile após detectar sobreposição com a barra de medições. O teste final em 390 × 844 confirmou ausência de sobreposição entre esses controles e de rolagem horizontal. Drawer, backdrop e atribuição nativa mantidos.
- O posicionador de popups passa a considerar o seletor experimental como obstáculo, quando presente.

## Validação executada

- `npm.cmd ci`: concluído com o lockfile existente; sem mudança de versão de dependência.
- `npm.cmd run typecheck`: aprovado.
- `npm.cmd run check`: os seis verificadores aprovados.
- `npm.cmd run build`: aprovado; inclui nova execução do TypeScript. Build final: 77 módulos transformados.
- Regressão raster disponível: dois rasters sintéticos, quatro ciclos ON/OFF e 553 situações de borda por ativação, além de opacidade 0–100%, reutilização e limpeza no hook real. O teste também reproduz a falha original de interseção antes de conferir a proteção já existente.
- Preview do build de produção no Chrome local: abertura técnica sem seletor experimental e com estados iniciais corretos; ambos os modelos ativos; medição de cota sobre a cena; ida a 2D e retorno a 3D com ambas as seleções restauradas.
- No ensaio 2D do navegador: Home, zoom e pan; coordenadas, distância horizontal e área; ativação dos dois ortomosaicos e renderização da cobertura RGB; MDT, MDS, declividade e orientação; curvas de nível e drenagem; seleção da drenagem e popup com ordem de Strahler e atributos.
- Viewport móvel 390 × 844: abertura/fechamento do drawer, botões e controle 2D/3D. O seletor experimental não cobre a barra de medições no build final.
- As leituras de console consultadas durante a validação não apresentaram erro de renderização. Isso não equivale a um ensaio de todos os tiles, níveis e dispositivos.

## Limitações, riscos e próximas decisões

1. O 2D permanece experimental e opt-in. Modelos fotogramétricos e medições de cota exigem 3D. O plano 2D não representa uma superfície altimétrica.
2. Coordenadas 2D são planimétricas; distâncias são geodésicas WGS84, sem relevo. Para medições fotogramétricas, voltar a 3D. Não há validação de datum vertical ou precisão de levantamento nesta etapa.
3. O GPS foi exercitado com posição sintética no hook existente. Permissão do navegador, disponibilidade e precisão em dispositivo real ainda exigem homologação em campo.
4. Não foram medidos FPS, memória CPU/GPU ou desempenho em um celular físico. Habilitar 2D remove a otimização `scene3DOnly` e pode aumentar o uso de recursos; o caminho padrão conserva a otimização. Medir antes de tornar 2D padrão comunitário.
5. O histórico de NaN em clipping progressivo não pode ser descartado por testes curtos. Os loaders, recortes e proteções legadas permaneceram intocados. As novas funcionalidades não usam internals do Cesium; isso não elimina dependências privadas pré-existentes nos mecanismos legados. Homologar ambos os bairros em múltiplos níveis e dispositivos antes de produção.
6. `npm ci` informou duas vulnerabilidades da árvore existente (uma alta e uma crítica). Não foi executado `npm audit fix`, nem alteradas dependências. Triagem específica de segurança deve preceder publicação; esses avisos não são atribuídos a uma biblioteca sem investigação adicional.
7. A suíte é local/sintética, complementada por navegação real com fontes remotas. Não é uma suíte automatizada de navegador nem comprova disponibilidade contínua ou CORS em todos os clientes.

Recomendação: iniciar a Etapa 2B como construção incremental de um shell comunitário separado, mantendo o técnico como padrão de referência. Não promover o ensaio 2D a padrão de produção antes da homologação móvel, GPS real, orçamento de desempenho e triagem das dependências. Não há backend, autenticação, formulários, banco, Service Worker ou PWA nesta entrega.

## Arquivos desta etapa

Novos:

- `src/experiences/technical.ts`
- `src/experiences/sceneVisibility.ts`
- `src/cesium/sceneMode.ts`
- `src/hooks/useSceneMode.ts`
- `src/components/SceneModeControl.tsx`
- `src/components/SceneModeControl.css`
- `scripts/check-scene-modes.cjs`
- `docs/ETAPA_2A_BAIRRO_VIVO.md`

Modificados:

- `src/App.tsx`
- `src/cesium/createViewer.ts`
- `src/cesium/measurementUtils.ts`
- `src/hooks/useCesiumViewer.ts`
- `src/hooks/useMeasurements.ts`
- `src/components/LayerPanel.tsx`
- `src/components/MeasurementToolbar.tsx`
- `src/components/NavigationControls.tsx`
- `src/components/VectorPopup.tsx`
- `scripts/check-projects.cjs`
- `scripts/check-workspace.cjs`
- `scripts/check-raster-lifecycle.cjs`
- `scripts/check-measurements.cjs`
- `scripts/check-template-v2.cjs`
- `package.json` (somente inclusão do novo verificador no script `check`)

`dist/`, `node_modules/` e evidências em `.verification/` são artefatos locais ignorados pelo Git e não devem entrar em commits.
