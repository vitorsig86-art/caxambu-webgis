# Etapa 2B — uso e continuidade

- `/?experience=community`: Caxambu Bairro Vivo, em qualquer tamanho de tela.
- `/?experience=technical`: WebGIS técnico original, inclusive no celular.
- Sem parâmetro: comunidade até 760 px; técnico nas telas maiores. A escolha ocorre na abertura, sem trocar o Viewer ao redimensionar.
- Mapa: ortomosaico inicial preservado, vista 2D, GPS e navegação reutilizados. Explorar permite alternar camadas e opacidade pelo painel existente. Os modelos 3D continuam disponíveis no técnico.
- Registrar: categoria, título, descrição e ponto opcional escolhido no mapa. Salva somente em `localStorage`, chave `caxambu-bairro-vivo:drafts:v1`. Comunidade lista esses rascunhos privados e permite excluí-los. Não há envio, fila de sincronização, mural fictício ou dados de outros moradores. Limpar dados do navegador perde os rascunhos.
- PWA: manifesto, PNGs 192/512, ícone Apple 180 e Service Worker gerado pelo build. Android usa o prompt quando disponível ou o menu do navegador; iPhone usa Safari → Compartilhar → Adicionar à Tela de Início. A instalação real exige teste em aparelho/HTTPS; não foi executada nesta etapa.
- O cache guarda somente arquivos locais da aplicação. Não guarda tiles, GeoJSON remoto ou requisições ion/Bing/R2. O mapa precisa de internet; a interface informa perda de conexão. Atualizações do Service Worker aguardam o encerramento da versão anterior.
- Validação: TypeScript e build aprovados; renderização estática confirmou identidade, quatro opções e acesso técnico. Manifesto, dimensões dos ícones, sintaxe e referências do cache conferidos. Chrome estava fechado e a autorização para abri-lo expirou; revisão visual interativa ficou pendente. Nenhuma suíte extensiva, benchmark, publicação ou commit.
- Etapa 3: backend real, regras de privacidade/consentimento, persistência compartilhada, moderação e fluxo explícito de publicação. Antes do lançamento: validar interface e instalação em Android/iPhone e decidir a política de edição/backup de rascunhos. Nenhum rascunho desta etapa deve ser enviado automaticamente.

A imagem `public/preview-caxambu.png` já estava ausente no início desta etapa. Os metadados de compartilhamento existentes não foram substituídos; a imagem precisa ser reposta por decisão do projeto antes de publicar a prévia social.
