# Caxambu Bairro Vivo — Requisitos técnicos e escolha do backend do piloto

Base: `docs/BAIRRO_VIVO_PROPOSTA.md` e `AGENTS.md`. O arquivo `docs/AUDITORIA_BAIRRO_VIVO.md` não existe no repositório; as observações técnicas da auditoria anterior foram consideradas quando relevantes.

Escopo: documento de decisão. Nenhum código, dependência, conta ou serviço foi criado ou alterado.

**Fora de escopo e intocados:** WebGIS técnico, Cesium, fontes cartográficas (R2 público atual), câmera, Home, medições. O backend atende somente à experiência comunitária.

**Preços, limites, regiões e recursos citados devem ser reconferidos na documentação oficial no dia da contratação.** Eles mudam com frequência, e nada aqui foi testado em conta real.

---

## Parte 1 — Requisitos técnicos

Legenda: **O** = obrigatório no MVP · **D** = desejável (pode ficar para depois do piloto).

### 1.1 Identidade e acesso

| # | Requisito | O/D |
|---|---|---|
| R1 | Registrar sem cadastro. Cada aparelho recebe uma identidade própria (segredo gerado no aparelho, guardado localmente). O servidor guarda só um identificador derivado, nunca o segredo em texto puro | O |
| R2 | Apelido opcional por aparelho; padrão "Um morador" | O |
| R3 | Telefone opcional, só para quem propõe ação ou topa participar; visível somente para a coordenação e para quem organiza a ação em que a pessoa entrou; nunca em resposta pública | O |
| R4 | Confirmação de telefone **manual** (campo "confirmado por" + data). Sem SMS automático | O |
| R5 | Contas nominais para a equipe (2–3 pessoas) com login forte. Papéis **coordenação, guardião e curador**, acumuláveis por pessoa | O |
| R6 | Limite de envios por aparelho por dia e verificação anti-robô leve | O |
| R7 | Recuperar identidade em outro aparelho (por código de recuperação) | D |

### 1.2 Envio e funcionamento sem sinal

| # | Requisito | O/D |
|---|---|---|
| R8 | Fila de envio no aparelho: registro, foto e áudio ficam guardados até haver sinal; status "Aguardando sinal" | O |
| R9 | **Envio idempotente:** cada registro nasce com um identificador gerado no aparelho; reenviar o mesmo registro (ou a mesma mídia) nunca cria duplicata | O |
| R10 | Mídia enviada separada do texto, retomável; registro sem mídia já pode entrar em revisão | O |
| R11 | O prazo de revisão conta a partir da **chegada ao servidor**, não da criação no aparelho | O |

### 1.3 Tipos, campos, estados e histórico

| # | Requisito | O/D |
|---|---|---|
| R12 | Três tipos — **Conhecer**, **Cuidar**, **Agir** — com subtipos e campos próprios (ave, lixo, coleta, trânsito, memória, mutirão, pedido coletivo etc.), validados no servidor | O |
| R13 | Máquina de estados por tipo, com transições permitidas definidas no servidor (ex.: Cuidar: Relatado → Confirmado → Encaminhado → Resolvido; Não procede; Voltou a acontecer) | O |
| R14 | **Histórico imutável** de cada mudança: estado anterior, novo estado, papel de quem mudou, data, motivo público, nota interna | O |
| R15 | Confirmação automática de problema com 3 aparelhos distintos | O |
| R16 | Alerta "Encaminhado há 30 dias sem resposta" | D |

### 1.4 Participação sem duplicar

| # | Requisito | O/D |
|---|---|---|
| R17 | "Eu também vi": uma confirmação por aparelho por registro, com foto e comentário opcionais | O |
| R18 | "Eu topo": uma adesão por aparelho por ação; contador público; telefone só se a pessoa quiser | O |
| R19 | **Junção de duplicados** pela equipe: o registro absorvido aponta para o principal; autorias, confirmações e links migram; nada é apagado | O |
| R20 | **Busca de próximos** antes do envio: mesmo tipo/subtipo, até ~50 m, últimos 90 dias, retornando **só dados públicos** | O |

### 1.5 Localização e proteção

| # | Requisito | O/D |
|---|---|---|
| R21 | Guardar a **coordenada real** em área restrita, acessível só à equipe | O |
| R22 | Guardar a **coordenada pública** separadamente: para problemas, deslocada para a rua (definida pela equipe na revisão; automática é desejável); para ninhos e espécies sensíveis, generalizada para o centro de uma célula fixa de ~200 m (sem sorteio aleatório, que pode ser desfeito por média de vários pontos) ou "sem ponto" | O |
| R23 | **A coordenada real nunca chega ao navegador de quem não é da equipe**: nem em listas, nem na busca de próximos, nem no link "acompanhe aqui", nem em mensagens de erro | O |
| R24 | Lista de espécies sensíveis mantida pelo curador; marcar ninho/filhote aplica generalização automaticamente | O |
| R25 | Atraso de publicação para avistamentos sensíveis | D |
| R26 | Deslocamento automático para a rua mais próxima com base num traçado de ruas | D |

### 1.6 Mídia

| # | Requisito | O/D |
|---|---|---|
| R27 | Fotos reduzidas e **sem metadados (EXIF/GPS)** no aparelho antes do envio; o servidor **verifica de novo** e recusa ou limpa arquivos com metadados de localização antes de qualquer publicação | O |
| R28 | Mídia nova fica em área **privada**; só passa a ser pública após aprovação | O |
| R29 | Áudio de até **3 min** (até 3 trechos em visita), formato de voz comprimido (~0,5 MB/3 min); limite de duração no aparelho e de tamanho no servidor | O |
| R30 | **Dois consentimentos separados** para áudio: gravar e publicar (com voz / só resumo / só acervo); guardados com data e versão do texto aceito; mudança de ideia a qualquer momento | O |
| R31 | Resumo escrito do áudio, preenchido pela equipe | O |
| R32 | Desfoque de rostos/placas pela equipe dentro do painel | D (no MVP: recusar e pedir nova foto) |

### 1.7 Revisão e moderação

| # | Requisito | O/D |
|---|---|---|
| R33 | Fila de revisão ordenada pelo prazo; problemas, memórias, ações e textos livres entram como **Em revisão** com prazo de 48 h | O |
| R34 | **Revisão atrasada** calculada automaticamente; aviso à equipe (painel e, se possível, e-mail diário) | O |
| R35 | **Ocultar** imediatamente e **desfazer**; **remoção definitiva** com motivo obrigatório e segunda revisão posterior quando houver só uma pessoa | O |
| R36 | "Não publicado" sempre com motivo e opção de corrigir e reenviar | O |
| R37 | Registro de moderação (quem, quando, o quê, por quê), acessível à coordenação | O |
| R38 | Painel de revisão simples, utilizável no celular, para pessoas sem conhecimento técnico | O |

### 1.8 Retorno ao morador

| # | Requisito | O/D |
|---|---|---|
| R39 | Link **"acompanhe aqui"** por registro (e por confirmação/adesão): segredo aleatório longo; o servidor guarda só um derivado; mostra linha do tempo, estado de revisão e motivo, **sem apelido, telefone, aparelho ou coordenada real** | O |
| R40 | "Novidades nos seus registros" ao abrir o app, consultando por identidade do aparelho | O |
| R41 | Mensagens prontas para WhatsApp (texto + link) geradas no cliente | O |
| R42 | Consulta por **número de ficha** de papel | O |
| R43 | Exportação do mapa do mês (lista + painel) para impressão | D |

### 1.9 Registros presenciais

| # | Requisito | O/D |
|---|---|---|
| R44 | Modo "registro presencial" para a equipe: origem (mercearia, visita, reunião, WhatsApp repassado), número da ficha, data da ficha, data da digitação, quem digitou (papel) | O |
| R45 | Local aproximado por **quadrícula**, exibido como área até verificação | O |

### 1.10 Indicadores

| # | Requisito | O/D |
|---|---|---|
| R46 | Os cinco indicadores do piloto calculados por **contagens agregadas** (aparelhos distintos, registros por tipo e origem, encaminhados/resolvidos, ações realizadas, prazo de revisão) | O |
| R47 | Nenhuma tabela de eventos de navegação, nenhum rastreador de terceiros, nenhum cruzamento de identidade com nome/telefone para os indicadores | O |

### 1.11 LGPD e operação

| # | Requisito | O/D |
|---|---|---|
| R48 | Coleta mínima (R1–R4); textos de privacidade e consentimento versionados | O |
| R49 | **Exclusão a pedido:** apagar apelido, telefone e vínculo do aparelho; mídias não usadas em encaminhamentos; manter registros encaminhados desvinculados | O |
| R50 | **Exportação dos dados** de um aparelho (pelo próprio morador) e exportação geral (pela coordenação) | O |
| R51 | **Backup** automático com restauração testada pelo menos uma vez antes do piloto | O |
| R52 | Dados hospedados **no Brasil**, se possível | D (forte) |
| R53 | Logs de acesso com retenção curta; IPs não usados para nada além de proteção contra abuso | O |
| R54 | Prazo de guarda automático para telefones de ações encerradas | D |
| R55 | Tokens e chaves fora do Git; chaves do navegador (`VITE_*`) tratadas como públicas, conforme `AGENTS.md` | O |
| R56 | O backend comunitário é separado do bucket R2 público cartográfico; nenhuma mídia de morador vai para ele | O |

### 1.12 Itens iguais nas duas opções (código no frontend)

Não diferenciam as alternativas, mas entram no esforço total:

- **Fila offline (R8–R10):** IndexedDB no aparelho + reenvio ao recuperar conexão. O protótipo atual usa `localStorage` só para rascunhos; mídia exige IndexedDB.
- **Limpeza de EXIF no aparelho (R27):** redesenhar a foto em `canvas` e gerar novo JPEG/WebP reduzido descarta os metadados.
- **Gravação de áudio (R29):** `MediaRecorder`. Android/Chrome tende a gerar WebM/Opus; iPhone/Safari, MP4/AAC. **Reprodução cruzada precisa ser testada em aparelhos reais**; nenhuma das opções converte formatos sem trabalho extra.
- **Mensagens de WhatsApp (R41):** links `wa.me`/compartilhamento nativo, sem API paga.
- **Painel de revisão (R38):** nas duas opções é uma tela própria. O painel do Supabase é para quem desenvolve, não para moderadores: dá acesso irrestrito aos dados e não deve ser usado pela equipe de revisão.

---

## Parte 2 — Comparação

### 2.1 Como cada opção atende os obrigatórios

Legenda: **N** = nativo · **C** = configuração · **P** = código próprio (pequeno/médio/grande).

| Req. | A. Supabase | B. Cloudflare (Workers + D1 + R2) |
|---|---|---|
| R1 identidade do aparelho | **N** — login anônimo do Supabase Auth: cada aparelho vira um usuário anônimo com sessão própria | **P pequeno** — segredo gerado no aparelho, enviado em cabeçalho; Worker guarda o derivado |
| R2 apelido | C — coluna no perfil | C — coluna |
| R3 telefone restrito | **C** — tabela separada com políticas de acesso por linha (RLS) | **P pequeno** — o Worker só devolve o campo em rotas da equipe |
| R4 confirmação manual | C | C |
| R5 equipe com papéis | **N + C** — login por e-mail para a equipe; papéis em tabela consultada pelas políticas | **N + C** — Cloudflare Access (login por e-mail) protegendo as rotas da equipe; papéis em tabela |
| R6 limite e anti-robô | **C + P pequeno** — CAPTCHA (Turnstile ou hCaptcha) no login anônimo é configuração; limite por aparelho/dia via função no banco | **N + C** — Turnstile e limitador de requisições dos Workers |
| R9 envio idempotente | **C** — identificador gerado no aparelho como chave primária; inserir ignorando repetição | **C** — idem no D1 |
| R10 mídia retomável | **N + C** — URLs assinadas de upload; envio retomável disponível no Storage | **P pequeno** — URL pré-assinada do R2 gerada pelo Worker |
| R11 prazo a partir da chegada | C — valor padrão do banco | C — valor padrão do D1 |
| R12 campos por tipo | **C + P pequeno** — restrições no banco e validação em função | **P pequeno** — validação no Worker |
| R13 estados e transições | **P pequeno** — função no banco que valida a transição | **P pequeno** — função no Worker |
| R14 histórico imutável | **C** — gatilho que grava cada mudança; tabela sem permissão de alteração | **P pequeno** — Worker grava o histórico na mesma operação em lote (`batch`) |
| R15 confirmação automática | C — gatilho/contagem | P pequeno |
| R17–R18 eu também vi / eu topo | **C** — chave única (registro, aparelho) | **C** — idem |
| R19 junção de duplicados | P pequeno — função no banco | P pequeno — rota no Worker |
| R20 busca a 50 m | **N** — PostGIS (`ST_DWithin` em geografia) dentro de uma função que devolve só campos públicos | **P pequeno** — sem extensão espacial; filtro por retângulo + distância calculada no Worker (trivial no volume do piloto) |
| R21–R23 coordenada real restrita | **C, com cuidado** — tabela separada sem leitura anônima; leitura pública só por função/visão. Erro de configuração de RLS expõe dados: exige testes automatizados | **P pequeno, explícito** — a coordenada real só é lida em rotas da equipe; não há acesso direto ao banco pelo navegador |
| R22 generalização ~200 m | **N + P pequeno** — PostGIS (`ST_SnapToGrid` em projeção métrica) | P pequeno — cálculo de grade no Worker |
| R24 espécies sensíveis | C | C |
| R27 verificação de EXIF no servidor | **P médio** — função (Edge Function) que verifica o arquivo antes de mover para o público | **P médio** — Worker verifica o arquivo antes de mover para o público |
| R28 mídia privada → pública | **C** — dois buckets com políticas, ou bucket privado + URL assinada | **C** — bucket privado + bucket público (domínio próprio), cópia na aprovação |
| R29 limite de áudio | C — limite de tamanho e tipo por bucket | P pequeno — validação no Worker |
| R30 consentimentos | C — tabela | C — tabela |
| R33–R34 fila e atraso | **N + C** — consulta ordenada; tarefas agendadas no banco (`pg_cron`) | **N + C** — consulta; Cron Triggers |
| R34 e-mail diário | P pequeno — função + serviço de e-mail | P pequeno — Worker + serviço de e-mail |
| R35–R37 ocultar, remover, registro | P pequeno — funções + tabela de registro | P pequeno — rotas + tabela |
| R38 painel de revisão | P médio (frontend) | P médio (frontend) |
| R39 link "acompanhe aqui" | **P pequeno** — função de leitura pública por segredo; devolve só campos permitidos | **P pequeno** — rota pública por segredo |
| R40 novidades | C — consulta pelo usuário anônimo | P pequeno |
| R42 número de ficha | C | C |
| R44–R45 presencial e quadrícula | C + P pequeno | C + P pequeno |
| R46–R47 indicadores agregados | **C** — visões com contagens, acessíveis só à equipe | **P pequeno** — rota de indicadores |
| R49 exclusão | P pequeno — função | P pequeno — rota |
| R50 exportação | **N + P pequeno** — exportação CSV e `pg_dump` para a coordenação; JSON do morador via função | **N + P pequeno** — `wrangler d1 export`; JSON do morador via rota |
| R51 backup | **N no plano pago** — backups diários; o plano gratuito não oferece backup gerenciado | **N** — Time Travel do D1 (restauração a um ponto no tempo); R2 sem versionamento automático: copiar mídia periodicamente |
| R53 logs | C — retenção conforme o plano; contêm IP | C — retenção conforme a configuração de observabilidade; contêm IP |
| R55 chaves | C — chave pública do projeto no navegador é esperada; segurança vem das políticas | C — sem chave no navegador; Worker guarda segredos |
| R56 separação do R2 cartográfico | N — serviço separado | C — **bucket novo e privado**, nunca o bucket público atual |

**Leitura rápida:** o Supabase entrega mais coisas prontas (identidade anônima, PostGIS, uploads, gatilhos, backups). O Cloudflare exige escrever uma API, mas cada regra de acesso fica explícita no código, o que reduz o risco de expor a coordenada real por engano de configuração.

### 2.2 Esforço de implementação

Estimativas grosseiras para uma pessoa com apoio de agentes de IA, em dias úteis. Servem para comparar, não para cronograma.

| Bloco | A. Supabase | B. Cloudflare |
|---|---|---|
| Modelo de dados e regras de acesso | 3–4 (RLS + funções + testes de acesso) | 2–3 (tabelas D1 + validação) |
| API | 1–2 (só funções específicas; o resto é acesso direto via biblioteca) | 5–7 (~15–20 rotas no Worker) |
| Identidade, anti-robô, equipe | 1 | 1–2 (Access + aparelho + Turnstile) |
| Mídia (upload, verificação, publicação) | 2–3 | 2–3 |
| Painel de revisão (frontend) | 4–5 | 4–5 |
| Fila offline, áudio, retorno (frontend) | 4–5 | 4–5 |
| **Total aproximado** | **~3 a 4 semanas** | **~4 a 5 semanas** |

### 2.3 Esforço de manutenção (uma pessoa)

| Aspecto | A. Supabase | B. Cloudflare |
|---|---|---|
| Superfície a manter | Banco, políticas, funções, Edge Functions, buckets | Um Worker, um banco D1, um bucket |
| Risco principal | **Política de acesso mal escrita** expõe dados sem nenhum erro aparente. Exige testes que consultem como usuário anônimo a cada mudança | **Bug de rota** pode expor dados, mas o ponto de controle é um só arquivo de rotas, fácil de revisar |
| Inspeção dos dados | Painel com editor de tabelas e SQL (para quem desenvolve) | Console do D1 e `wrangler` (mais cru) |
| Evolução após o piloto | PostGIS facilita traçados de ruas, áreas, linhas e análises | Geometrias mais complexas exigem bibliotecas no Worker ou outro banco |
| Pausa por inatividade | **O plano gratuito pausa projetos inativos** (cerca de uma semana sem uso). Inaceitável para um piloto com picos irregulares | Não pausa |
| Familiaridade de agentes de IA | Alta | Alta |

### 2.4 Custo do piloto (reconferir antes de contratar)

| | A. Supabase | B. Cloudflare |
|---|---|---|
| Plano mínimo adequado | **Pro** (~US$ 25/mês por organização) — necessário para evitar pausa e ter backup | **Workers pago** (~US$ 5/mês) — D1 e R2 cabem nas cotas incluídas no volume do piloto |
| 8 semanas | ~US$ 50 | ~US$ 10 |
| Tráfego de mídia | Incluído até a cota do plano; folga para centenas de fotos e áudios curtos | R2 sem cobrança de saída |

Em qualquer caso, o custo do piloto é pequeno frente ao tempo de desenvolvimento.

### 2.5 Hospedagem no Brasil e LGPD

| | A. Supabase | B. Cloudflare |
|---|---|---|
| Região no Brasil | **Sim** — região São Paulo disponível na criação do projeto | **Não**, até onde se sabe: as dicas de localização do D1 e do R2 não incluem a América do Sul; a localização regional garantida é recurso de planos corporativos |
| Consequência | Atende R52 | Dados ficam fora do Brasil; transferência internacional é permitida pela LGPD sob condições, mas precisa constar na política de privacidade e passar pela revisão jurídica |

### 2.6 Dependência de fornecedor

- **Supabase:** Postgres padrão; dados e esquema saem com `pg_dump`. As políticas RLS e funções são SQL portável. Auth e Storage exigiriam reescrita ao migrar.
- **Cloudflare:** D1 é SQLite; exportação simples. O código do Worker usa APIs próprias da Cloudflare, mas é TypeScript comum e portável com ajustes.

Ambas são aceitáveis para um piloto.

### 2.7 Segurança — pontos a observar em qualquer opção

- A coordenada real vive numa **tabela separada**, nunca na mesma linha que é lida publicamente.
- Testes automatizados que, **como visitante anônimo**, tentam ler coordenadas reais, telefones, apelidos ligados a aparelhos e mídias não aprovadas — e devem falhar.
- Mídia sempre entra pelo caminho privado; só a aprovação copia para o público.
- Segredos do link "acompanhe aqui" e da identidade do aparelho são aleatórios e longos; o servidor guarda só derivados.
- CORS restrito ao domínio do Vercel (produção e previews definidos).
- Nada de dados comunitários no bucket R2 público usado pela cartografia.

---

## Parte 3 — Recomendação

**Supabase (opção A), plano Pro, região São Paulo**, para o piloto.

Motivos, em ordem de peso:

1. **Hospedagem no Brasil (R52)** disponível; no Cloudflare, não.
2. **Menos código para uma pessoa só manter:** identidade anônima, uploads assinados, gatilhos de histórico, tarefas agendadas e backups já existem.
3. **PostGIS** resolve busca de próximos, generalização em grade e, depois do piloto, deslocamento automático para a rua (R26), linhas de calçada e áreas.
4. Painel de dados útil para quem desenvolve investigar problemas.

Condições para a recomendação valer:

- **Não usar o plano gratuito** (pausa por inatividade e falta de backup gerenciado).
- **Navegador sem acesso direto às tabelas sensíveis:** leitura pública só por funções e visões que devolvem campos públicos; tabelas de coordenada real, telefone e consentimentos sem permissão para usuários anônimos.
- **Testes de acesso como anônimo** rodando junto com `npm run check` antes de cada publicação.
- O painel do Supabase fica restrito a quem desenvolve; a equipe de revisão usa a tela própria do Bairro Vivo.

**Quando escolher o Cloudflare:** se a revisão jurídica aceitar dados fora do Brasil e a prioridade for custo mínimo e um único fornecedor junto do R2. Nesse caso, o Cloudflare Access para a equipe e o controle explícito por rotas são bons pontos a favor.

**Em qualquer opção:** o R2 atual continua servindo só a cartografia; a experiência comunitária ganha um backend separado, sem mudanças no WebGIS, no Cesium, na câmera ou no Home.

---

## Parte 4 — Antes de implementar (fora desta tarefa)

1. Conferir preços, cotas, regiões e o recurso de login anônimo no dia da contratação.
2. Testar gravação e reprodução de áudio em um Android simples e um iPhone.
3. Validar com orientação jurídica a política de privacidade, o termo de consentimento e a região de hospedagem.
4. Definir domínio de produção do Bairro Vivo e domínios de preview para CORS.
5. Escrever o esquema de dados e os testes de acesso anônimo antes de qualquer tela.
