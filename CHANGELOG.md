# Changelog

## 2026-11-03

### Alterado

- Ações de popup que abrem página sobre o mapa (`target: "overlay"`) não movem
  mais a câmera por padrão: `flyTo` passou de `true` para `false`.
- `flyTo` aceita `false` (mantém a câmera), `true` (voa até a feição) e `"home"`
  (voa para a vista inicial com `flyToCameraSettled`, 1,6 s).
- Fechar o overlay não move a câmera, exceto com `onClose: "home"` configurado.
- Exemplo ilustrativo de `actions` em `src/projects/template.ts`, verificação em
  `scripts/check-embedded-pages.cjs` e documentação atualizados.
