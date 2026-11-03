# Caxambu Bairro Vivo — Proposta do MVP de participação (bairro Santo Antônio)

Documento de produto. Define como o aplicativo funciona para os moradores antes da implementação do backend. Não descreve nem altera código.

**Ainda a verificar (não tratar como fato):** perímetro oficial do bairro, plano diretor, ZEIS, situação jurídica da associação de moradores, canais oficiais da prefeitura (ouvidoria, coleta, trânsito) e lista de aves de ocorrência local. Até a confirmação, o app fala em **"área do Bairro Vivo"** (a cobertura do drone), não em "limite oficial do bairro".

---

## 1. Princípios do MVP

1. **Pequeno de propósito.** Cerca de 200 casas. O sistema precisa funcionar bem com poucos registros por semana e com uma equipe de 2 ou 3 pessoas.
2. **Três formas de participar, com regras próprias:** Conhecer, Cuidar e Agir.
3. **O WhatsApp é onde o bairro conversa.** O app não compete com ele: gera links e mensagens prontas para compartilhar e recebe registros repassados por lá.
4. **Funcionar com sinal fraco e pouco dado.** Envio fica guardado até ter sinal; fotos e áudios são reduzidos no aparelho; dá para usar a lista sem carregar o mapa.
5. **Ninguém é exposto.** O sistema registra situações e lugares, nunca acusa pessoas.
6. **Nada depende de um único parceiro.** O app funciona sem a associação e sem a mercearia. Ambas podem entrar quando e se for possível.
7. **Ninguém fica sem resposta.** Todo envio tem prazo de revisão visível e um caminho para acompanhar o que aconteceu, sem depender de notificações push.

---

## 2. Os três tipos de registro

| | **Conhecer** (observação) | **Cuidar** (problema) | **Agir** (ação coletiva) |
|---|---|---|---|
| Exemplos | Ave, árvore, nascente, lugar importante, memória em texto ou áudio | Lixo descartado, coleta falhando, travessia perigosa, falta de calçada | Mutirão, pedido coletivo à prefeitura, plantio, placa de aviso |
| Pergunta central | "O que existe aqui?" | "O que precisa de cuidado aqui?" | "O que vamos fazer juntos?" |
| Pode ser resolvido? | Não | Sim | Pode ser realizada |
| Duplicidade | Normal (cada avistamento conta) | Evitar: confirma o existente | Evitar: entra na ação existente |
| Localização pública | Pode ser generalizada (espécies sensíveis, casas) | Na rua ou espaço público, nunca na casa de alguém | Ponto de encontro |
| Quem revisa | Papel de curador(a) de natureza e de guardião | Papel de guardião | Papel de guardião e de coordenação |

---

## 3. Primeiro registro (o caminho mais curto)

Meta: **menos de 1 minuto, sem cadastro, até 4 toques obrigatórios.**

**Tela inicial:** mapa leve do bairro e três botões grandes, com ícone e palavra:

- 🐦 **Vi algo bonito ou importante** (Conhecer)
- ⚠️ **Algo precisa de cuidado** (Cuidar)
- 🤝 **Quero juntar gente para fazer algo** (Agir)

**Fluxo de "Algo precisa de cuidado":**

1. **O que é?** Botões grandes com figura: Lixo jogado · Coleta não passou · Travessia perigosa · Falta calçada · Outro.
2. **Onde?** Dois botões:
   - "Estou no lugar agora" (GPS);
   - "Escolher no mapa" (arrastar o mapa sob um alfinete fixo; já funciona no protótipo).

   Aviso fixo: *"Marque na rua ou no terreno, não na porta de uma casa."*
3. **Foto** (opcional, mas incentivada): "Tirar foto" ou "Pular". Aviso: *"Não fotografe pessoas, rostos ou placas de carro."*
4. **Já registraram perto daqui?** Se houver registros parecidos a até ~50 m, o app mostra cada um com foto e status: **"É esse — eu também vi"** ou **"É outro lugar"**. (Ver seção 5.)
5. **Quer contar mais?** Campo de texto opcional. O ditado por voz do teclado do celular funciona sem custo extra.
6. **Enviar.** A tela de confirmação diz o que acontece a seguir:

   > *"Recebido! Vamos olhar até **quinta, 14h**. Até lá, só você vê este registro."*
   > **[Guardar link no meu WhatsApp]** · **[Ver meus registros]**

Sem sinal: *"Guardado. Vai ser enviado quando o celular tiver internet."* O registro fica em "Aguardando sinal" em Meus registros, e o prazo de revisão só começa a contar quando o envio chega.

Telas com uma decisão por vez, texto mínimo de 16 px, botões com ícone **e** palavra, sem termos técnicos.

---

## 4. Identificação: como o morador entra (ou não)

### Opções

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Totalmente anônimo** | Envia sem nada | Zero atrito; protege quem tem medo | Spam, sem como acompanhar, sem retorno, difícil contar participação |
| **B. Apelido + aparelho** | Escolhe um apelido ("Dona Lia da Rua 3" ou "Vizinho"). O app guarda uma chave no celular | Sem senha, sem telefone; acompanha os próprios registros; conta participação | Trocar ou limpar o celular perde o histórico (o link "acompanhe aqui" atenua); pouco freio contra abuso |
| **C. Telefone informado** | A pessoa informa o número; a equipe confirma manualmente, se necessário | Permite chamar para ações e avisar mudanças importantes | Muitos têm receio de dar o número; exige texto claro de privacidade |
| **D. E-mail (link)** | Link de acesso por e-mail | Barato, recuperável | Muitos moradores mais velhos não usam e-mail |
| **E. Registro mediado** | Voluntário ou ponto físico registra por alguém | Inclui quem não usa app | Depende de voluntários; origem precisa ficar clara |

### Decisão para o piloto

| O que a pessoa quer fazer | O que é pedido |
|---|---|
| Ver o mapa, ler registros | Nada |
| Registrar observação, problema ou memória; "eu também vi" | **Apelido + aparelho (B)**. Pode usar "Um morador" como apelido |
| Propor ação, dizer "eu topo", ser chamado | **Telefone (C)**, opcional e **nunca público**. Só quem organiza a ação e a coordenação veem |
| Quem não usa app | **Mediado (E)** |

**Verificação de telefone no piloto: manual ou nenhuma. Sem SMS automático.** Quando for útil confirmar, alguém da equipe manda uma mensagem pelo WhatsApp e marca o contato como confirmado.

Anti-abuso sem cadastro: limite de envios por aparelho por dia, verificação anti-robô leve e revisão antes da publicação (seção 10).

---

## 5. Contribuir sem duplicar

- **Antes de enviar**, o app procura registros do mesmo tipo a até ~50 m nos últimos 90 dias (problemas) e mostra os mais próximos com foto, data e status.
- **"Eu também vi"** soma uma confirmação ao registro existente. A pessoa pode acrescentar foto nova ou comentário curto ("Hoje tinha ainda mais entulho"). O cartão mostra: *"5 vizinhos confirmaram · última vez há 2 dias"*. Quem confirma também recebe o link "acompanhe aqui" (seção 8).
- **A equipe pode juntar** dois registros que são o mesmo problema. O registro juntado vira "Unido a #23", todas as confirmações migram e os links antigos passam a abrir o registro #23. Ninguém perde o que enviou.
- **Observações da natureza não são deduplicadas:** cada avistamento é um dado útil. O mapa agrupa ("Bem-te-vi · 12 avistamentos nesta área").
- **Ações** também passam pela busca: *"Já existe um mutirão proposto aqui. Quer participar?"*

---

## 6. O que cada registro pede

Campos automáticos em todos: data e hora, tipo, localização, origem (app, mercearia, visita, WhatsApp, reunião) e apelido ou "Um morador".

### 6.1 Ave (Conhecer)

| Campo | Obrigatório | Forma |
|---|---|---|
| Qual ave? | Sim | Galeria com foto de ~15–20 aves comuns + **"Não sei"**. A lista precisa ser validada pelo curador |
| Foto ou gravação do canto | Não | Ajuda o curador a confirmar |
| Quantas? | Não | 1 · 2–5 · Mais de 5 |
| O que estava fazendo? | Não | Pousada · Comendo · Cantando · Voando · **Ninho ou filhotes** |
| Onde | Sim | GPS ou mapa |

Regras automáticas: se marcar **ninho/filhotes** ou se a espécie estiver na lista de sensíveis, o ponto público é generalizado (seção 12).

Outras observações (árvore, nascente, lugar importante): título, foto, texto curto, local. Memórias têm regras próprias (seção 6.4).

### 6.2 Lixo e descarte (Cuidar)

| Campo | Obrigatório | Forma |
|---|---|---|
| Que tipo? | Sim | Sacos de lixo · Entulho de obra · Móveis/volumosos · Galhos/poda · Pneus · Outro |
| Tamanho | Sim | Cabe num saco · Um carrinho de mão · Precisa de caminhão |
| Desde quando? | Não | Hoje · Esta semana · Mais tempo · **Sempre volta** |
| Foto | Recomendada | Sem pessoas, sem rostos, sem placas |
| Onde | Sim | Na rua ou no terreno |

**O app nunca pergunta quem jogou.** Textos com acusação ("foi o fulano da casa azul") são editados ou recusados na revisão, com explicação ao autor.

"Coleta não passou" é um subtipo à parte: rua, dia da semana esperado, há quantas semanas falha. Vale mais como **padrão** (várias confirmações) do que como ponto isolado.

### 6.3 Risco de trânsito (Cuidar)

| Campo | Obrigatório | Forma |
|---|---|---|
| Qual é o risco? | Sim | Travessia perigosa · Falta calçada · Carros muito rápidos · Falta placa/faixa · Pouca luz à noite · Buraco · Outro |
| Quem passa mais aperto? | Não | Crianças · Idosos · Cadeirante/carrinho · Todo mundo |
| Quando é pior? | Não | Manhã · Tarde · Noite · Dias de chuva |
| Foto | Recomendada | Mostrando o lugar, não as pessoas |
| Onde | Sim | Ponto (no MVP). Trechos de rua sem calçada viram linhas numa versão futura |

### 6.4 Memória do bairro, com áudio (Conhecer)

Muitas memórias são contadas, não escritas. O MVP aceita **áudio** gravado pelo próprio morador no app ou por um voluntário em visita.

**Gravação**

| Item | Regra |
|---|---|
| Duração máxima | **3 minutos por áudio.** Em visita, até **3 trechos** por memória (até 9 minutos), para quem tem muito a contar |
| Tamanho | Gravado em formato de voz comprimido no aparelho: cerca de **0,5 MB por 3 minutos** |
| Sem sinal | O áudio fica guardado no aparelho e é enviado depois, como os outros registros |
| Ao ouvir | O áudio nunca toca sozinho. O botão mostra duração e tamanho: *"Ouvir · 2 min · 0,4 MB"* |
| Acessibilidade | Um voluntário escreve um **resumo curto** em texto para quem não pode ouvir. Transcrição automática fica fora do MVP |

**Campos:** título curto ("A enchente de 1985", "Quando a quadra era campo"), quem conta (apelido ou "Um morador"), época aproximada (opcional) e lugar.

**Consentimento (duas perguntas separadas, antes de gravar)**

1. **Gravar:** *"Você aceita que esta conversa seja gravada?"* Em visita, o voluntário lê a frase e a resposta fica gravada no início do áudio.
2. **Publicar:** escolha entre
   - *"Pode publicar com a minha voz"*;
   - *"Publique só o resumo escrito, sem a minha voz"*;
   - *"Guarde para o acervo do bairro, mas não publique agora"*.

A pessoa pode mudar de ideia a qualquer momento e pedir para apagar. A voz identifica quem fala: o app avisa isso antes da escolha. Menores de idade precisam de um responsável presente. Memórias que citam outras pessoas pelo nome passam por revisão cuidadosa; a equipe pode pedir a concordância da pessoa ou da família, ou publicar só o resumo sem o nome.

**Lugar no mapa**

- **"Um lugar do bairro":** lista de lugares conhecidos (quadra, mercearias, córrego, praça, igreja ou outros que os moradores apontarem).
- **"Escolher no mapa":** alfinete, como nos outros registros.
- **"O bairro todo / não é um lugar só":** a memória aparece numa lista, sem ponto.
- Memórias sobre a casa de alguém ficam no ponto da **rua**, não do lote.

**Revisão:** a equipe ouve o áudio inteiro antes de publicar, no mesmo prazo de 48 h. Se não der para ouvir a tempo, o status mostra *"em revisão — áudio longo"* e um novo prazo, nunca silêncio.

---

## 7. Estados e linha do tempo

Cada registro tem uma **linha do tempo**: quem mudou o status (papel, não nome), quando e por quê. Status sempre com **ícone + palavra**, nunca só cor.

### 7.1 Revisão antes da publicação (problemas, memórias e textos livres)

| Status (visto só por quem enviou) | O que aparece |
|---|---|
| **Aguardando sinal** | Guardado no aparelho, ainda não chegou |
| **Em revisão** | *"Vamos olhar até quinta, 14h"* (48 h após a chegada) |
| **Revisão atrasada** | *"Passou do prazo. Ainda vamos olhar — desculpe a demora."* Ao mesmo tempo, a coordenação recebe um alerta no painel de revisão |
| **Publicado** | Passa a aparecer no mapa para todos |
| **Não publicado** | Sempre com o motivo, em linguagem simples, e o botão **"Corrigir e enviar de novo"** quando fizer sentido (ex.: foto mostrando rosto) |

**Nenhum registro some sem explicação.** O autor sempre vê o seu registro em Meus registros e no link "acompanhe aqui", em qualquer status.

Avistamentos de aves sem texto livre, confirmações ("eu também vi") e "eu topo" aparecem na hora, sem revisão prévia.

### 7.2 Conhecer (observação)

`Em revisão` (só memórias e textos livres) → `Publicado` → (`Identificação confirmada` · `Identificação corrigida`)

Não existe "resolvido": uma ave não é um problema.

### 7.3 Cuidar (problema)

| Status | Significado | Papel que muda |
|---|---|---|
| **Em revisão** | Só para quem enviou, com prazo de 48 h | Automático |
| **Relatado** | Publicado; aguardando verificação | Guardião |
| **Confirmado** | Alguém da equipe viu no lugar **ou** 3 vizinhos diferentes confirmaram | Guardião / automático |
| **Encaminhado** | Levado a quem pode resolver: para quem, quando, como (ex.: número de protocolo, se houver) | Guardião / coordenação |
| **Em ação no bairro** | Uma ação coletiva foi ligada a ele | Automático, ao ligar a ação |
| **Resolvido** | Com foto "depois" e confirmação de um morador ou da equipe. Distinguir *"resolvido pela prefeitura"* e *"resolvido pela comunidade"* | Guardião |
| **Não procede** | Motivo público e respeitoso: não encontrado · fora da área · repetido (unido a #) · não é problema de espaço público | Guardião |
| **Voltou a acontecer** | Reabre um resolvido, mantendo o histórico. Mostra contagem: *"voltou pela 3ª vez"* | Qualquer morador sugere; guardião confirma |

Alerta para a coordenação: **"Encaminhado há 30 dias sem resposta"**. Isso alimenta pedidos coletivos. "Voltou a acontecer" é a informação mais valiosa para esses pedidos: mostra padrão, não reclamação isolada.

### 7.4 Agir (ação coletiva)

`Em revisão` → `Proposta` → `Juntando gente` (meta visível: *"6 de 8 pessoas"*) → `Marcada` (data, hora, ponto de encontro, o que levar) → `Realizada` (resultado: fotos antes/depois, sacos recolhidos, árvores plantadas) · ou `Adiada` · `Cancelada` (com motivo).

---

## 8. Ciclo de retorno (sem notificações push)

O morador fica sabendo do que aconteceu por quatro caminhos, do mais pessoal ao mais coletivo. Nenhum depende de push.

### 8.1 Os quatro canais

1. **Link "acompanhe aqui".** Gerado no envio e também ao tocar em "eu também vi". O botão **"Guardar link no meu WhatsApp"** abre o WhatsApp com a mensagem pronta para a pessoa mandar para si mesma ou para um familiar:
   > *"Meu registro no Bairro Vivo: Lixo na Rua X (#23). Acompanhe aqui: [link]"*

   O link abre a página do registro com a linha do tempo, inclusive "em revisão" e o motivo de "não publicado". Ele é difícil de adivinhar e não mostra nenhum dado pessoal; mesmo se for repassado, só revela o status do registro. Funciona em outro celular e depois de trocar de aparelho.

2. **"Novidades nos seus registros".** Ao abrir o app, um aviso no topo mostra o que mudou desde a última visita: *"2 novidades: #23 foi encaminhado · sua memória foi publicada"*. Não exige conta nem push; usa a chave guardada no aparelho.

3. **Mensagem pronta para o grupo do bairro.** Quando um problema é **resolvido** ou uma ação é **realizada**, a equipe recebe, no painel de revisão, o botão **"Avisar no grupo"**, com texto e link prontos:
   > *"✅ Resolvido: o entulho da Rua X (#23) foi recolhido. 7 vizinhos tinham avisado. Obrigado a todos! [link]"*

   A equipe também pode usar o mesmo botão para "Encaminhado" e "Voltou a acontecer", quando fizer sentido para o grupo. A mensagem nunca cita nomes.

4. **Mapa impresso atualizado todo mês** (onde houver ponto físico; ver seção 9). Mostra os registros com número e status, e o painel do bairro do mês.

Se a pessoa deixou telefone (opcional), a equipe pode avisar manualmente nas mudanças mais importantes (resolvido, não procede). Isso é um extra, não o caminho principal.

### 8.2 O ciclo nos três percursos

**Conhecer — avistamento de ave**

| Momento | Como a pessoa fica sabendo |
|---|---|
| Envio | Tela de confirmação + link "acompanhe aqui" |
| Publicado (na hora, se não tiver texto livre) | Já aparece no mapa; aviso de novidades |
| Identificação confirmada ou corrigida pelo curador | Aviso de novidades + link; ex.: *"Era um sanhaço-cinzento, não um sabiá. Obrigado pela foto!"* |
| Fim do mês | Mensagem para o grupo: *"Aves do mês: 14 avistamentos de 9 espécies"*; mapa impresso |

**Conhecer — memória em áudio**

| Momento | Como a pessoa fica sabendo |
|---|---|
| Gravação e envio | Confirmação com prazo de 48 h + link (em visita, o voluntário manda o link para o WhatsApp da pessoa ou da família, se ela quiser) |
| Publicado ou só resumo | Aviso de novidades + link |
| Não publicado | Motivo + opção de corrigir; o áudio pode continuar no acervo se a pessoa escolheu isso |
| Fim do mês | Mensagem para o grupo: *"Nova memória do bairro: A enchente de 1985"* (só se a pessoa autorizou publicar) |

**Cuidar — problema**

| Momento | Quem enviou | Quem clicou "eu também vi" | Bairro |
|---|---|---|---|
| Envio | Confirmação com prazo + link | — | — |
| Em revisão / atrasada | Link e Meus registros mostram o prazo | — | — |
| Publicado / Confirmado | Novidades + link | Novidades + link | Mapa |
| Encaminhado | Novidades + link (para quem e quando) | Novidades + link | Mensagem opcional para o grupo |
| Resolvido | Novidades + link + foto "depois" | Novidades + link | **Mensagem para o grupo** + mapa impresso |
| Não procede | Novidades + link, com motivo | Novidades + link, com motivo | Mapa (cinza, com motivo) |
| Voltou a acontecer | Novidades + link | Novidades + link | Mensagem opcional para o grupo |

**Agir — ação coletiva**

| Momento | Quem propôs | Quem tocou "eu topo" | Bairro |
|---|---|---|---|
| Proposta enviada | Confirmação com prazo + link | — | — |
| Publicada | Novidades + link | — | Mensagem pronta para convidar: *"Vamos limpar a Rua X? Toque em Eu topo: [link]"* |
| Meta atingida | Novidades: *"8 pessoas toparam. Vamos marcar?"* | Novidades | — |
| Marcada | Novidades + link | Novidades + link; quem deixou telefone pode receber o convite pelo WhatsApp de quem organiza | Mensagem pronta com data, hora e ponto de encontro |
| Véspera | — | Link mostra *"É amanhã"* | Lembrete pronto para o grupo |
| Realizada | Novidades + link + resultado | Novidades + link + resultado | **Mensagem para o grupo** com antes/depois + mapa impresso |
| Adiada / Cancelada | Novidades, com motivo | Novidades, com motivo | Mensagem pronta |

---

## 9. Ponto físico (mercearia ou outro)

**A participação de uma mercearia depende de conversa presencial. O app funciona sem ela.** Sem ponto físico, os registros em papel e em áudio continuam possíveis por **visita de voluntário**, **reunião na quadra** ou **WhatsApp repassado** para alguém da equipe.

Se uma mercearia aceitar, a participação é voluntária e o(a) dono(a) **não** é moderador(a) nem responsável pelos registros, para não virar alvo de reclamações.

**Kit do ponto:**

- Mapa impresso (A2 ou A3) do bairro, com **quadrículas** (A1, A2… D6) e referências conhecidas.
- **Ficha de papel** numerada (ex.: F-041), com as mesmas opções do app em caixas de marcar: tipo, quadrícula, referência ("perto de…"), descrição. Duas partes destacáveis:
  - **canhoto do morador**, com o número da ficha, que a pessoa leva para casa;
  - **canhoto de contato** (opcional), que vai para a equipe.
- Urna ou caixa fechada.
- QR code grande para o app e um QR para "Quero ajudar no bairro".
- Cartaz com o painel do bairro.

**Digitalização:**

- Alguém da equipe recolhe as fichas (ex.: semanalmente) e usa o **modo "registro presencial"** do app.
- Campos extras: **origem** (`Mercearia [nome]`, `Visita`, `WhatsApp repassado`, `Reunião`), **número da ficha**, **data da ficha**, **data da digitação**, **digitado por** (papel, não nome público) e **local aproximado** (quadrícula).
- O mapa mostra a origem com um selo: *"Registrado no papel"*. O local por quadrícula aparece como área, não como ponto, até alguém confirmar no lugar.
- Depois de digitada, a ficha é destruída. O canhoto de contato é descartado quando não for mais necessário.

**Retorno para quem usou o papel:**

- **Mapa impresso atualizado todo mês**, com uma lista *"Fichas do mês"*: *"F-041 → registro #23 · Encaminhado"*. A pessoa confere pelo número do seu canhoto.
- O canhoto também traz o endereço curto do app; quem tiver celular pode digitar o número da ficha para ver a linha do tempo.

---

## 10. Revisão e moderação com equipe pequena

### Papéis no sistema

Os papéis continuam separados no sistema, para o projeto poder crescer. **No piloto, uma pessoa pode acumular vários papéis.**

| Papel | O que faz |
|---|---|
| **Morador(a)** | Registra, confirma, propõe, topa |
| **Guardião(ã)** | Revisa e publica, verifica no lugar, une duplicados, muda status, digitaliza fichas e áudios |
| **Curador(a) de natureza** | Confirma ou corrige espécies, define espécies sensíveis |
| **Coordenação** | Remove conteúdo, resolve conflitos, faz encaminhamentos oficiais, mantém os combinados |

### Equipe do piloto (2 ou 3 pessoas)

| Pessoa | Papéis |
|---|---|
| **Cardeal Map** | Coordenação + guardião + curador provisório |
| **Morador(a) de confiança** (a definir) | Coordenação + guardião |
| **IRMM** (provável, a confirmar) | Curador de aves |

Se o IRMM não confirmar, a Cardeal Map mantém a curadoria provisória e pode pedir apoio de identificação à comunidade do **iNaturalist**, publicando a foto manualmente. Sem integração técnica no MVP. Só com autorização de quem enviou a foto e com a localização oculta no iNaturalist quando for ninho ou espécie sensível.

Voluntários adicionais podem entrar depois como guardiões, sem mudar o sistema. A associação, se reativada, pode receber papéis de guardião ou de coordenação. Nada depende dela.

### Regras ajustadas para 2 ou 3 pessoas

- **Prazo:** problemas, memórias e textos livres são revisados em **até 48 h**. Alerta no painel quando faltar 12 h e quando o prazo vencer.
- **Publicado na hora, sem revisão:** confirmações, "eu topo" e avistamentos de aves sem texto livre.
- **Ocultar e remover:**
  - qualquer pessoa da equipe pode **ocultar** um conteúdo publicado na hora, se houver risco (exposição de pessoa, acusação, ninho). Ocultar é reversível;
  - a **remoção definitiva** pede uma segunda pessoa da equipe, quando ela estiver disponível em até 48 h;
  - se só houver uma pessoa disponível, ela pode remover, mas **escreve o motivo no registro de moderação**, avisa o autor e a outra pessoa revisa depois. O autor pode contestar, e a revisão decide.
- **Conflito de interesse:** quem tiver relação direta com o caso (a própria rua em disputa, um parente envolvido) passa para a outra pessoa. Se não houver outra, a decisão fica registrada com a justificativa.
- **Todo ato de moderação fica registrado** (quem, quando, o quê, por quê), visível para a coordenação.
- **Combinados do Bairro Vivo**, em cinco frases simples, aceitos no primeiro envio:
  1. Fale do lugar, não de pessoas.
  2. Não fotografe rostos, crianças ou placas.
  3. Não marque a casa de ninguém.
  4. Respeite quem pensa diferente.
  5. Ninhos e bichos sensíveis ficam protegidos.

---

## 11. De registro a ação coletiva

1. No cartão de um problema confirmado: botão **"Vamos resolver juntos?"**
2. A pessoa escolhe um modelo simples:
   - **Mutirão** (limpeza, plantio, pintura de faixa com autorização);
   - **Pedido coletivo** à prefeitura ou ao órgão responsável;
   - **Aviso no lugar** (placa feita pelos moradores);
   - **Conversa no bairro** (reunião na quadra ou num ponto de encontro).
3. Preenche: o que, onde, o que precisa (pessoas, sacos, carrinho, ferramentas), quem propõe (apelido) e telefone **privado**.
4. Outros tocam **"Eu topo"**. Ao atingir a meta, o app sugere marcar data e gera a mensagem pronta para o WhatsApp (ver 8.2, percurso Agir).
5. **Pedido coletivo:** o app monta um documento simples (PDF) com os problemas confirmados, quantas pessoas confirmaram, quantas vezes voltaram, datas e fotos aprovadas — **sem nenhum nome ou telefone**. A coordenação entrega e registra o encaminhamento.
6. Depois da ação: foto "depois", números simples, e os problemas ligados mudam para **Resolvido pela comunidade**.

**Painel do bairro** (uma tela, sem rankings individuais): *"Desde março: 41 registros · 12 resolvidos · 3 mutirões · 64 aves de 18 espécies vistas · 6 memórias"*. Também em formato de imagem para compartilhar no WhatsApp e imprimir no ponto físico.

---

## 12. Privacidade e proteção

### O que nunca é público

Nome, telefone, chave do aparelho, lista de registros de uma pessoa (não há perfil público no MVP), conteúdo dos canhotos de contato, horário exato de avistamentos sensíveis, áudios sem autorização de publicação.

### Pessoas e casas

- Apelido ou "Um morador" em tudo o que é público.
- Fotos: o app **remove os metadados (incluindo GPS)** antes de enviar; a equipe recusa ou desfoca rostos, crianças, placas e números de casa.
- Problemas **ficam no espaço público**. O ponto público é ajustado para a rua mais próxima quando cair dentro de um lote; o ponto exato fica visível só para a equipe.
- O app não pergunta e não exibe "quem fez". Acusações são editadas ou recusadas, com aviso ao autor.
- "Estou no lugar agora" usa o local do **problema**, não da pessoa. Se o ponto parecer uma casa, o app pergunta: *"É na rua?"*
- Áudios: a voz identifica quem fala; a publicação com voz só acontece com consentimento explícito (seção 6.4).

### Natureza sensível

- Espécies marcadas como sensíveis (lista definida pelo curador) e **qualquer ninho**: o ponto público vira uma **área de ~200 m** ou apenas "na área do Bairro Vivo". O ponto exato fica só com o curador.
- Avistamentos sensíveis podem aparecer com atraso (ex.: publicar depois de alguns dias).
- Nada de rota, horário exato ou foto que identifique o local do ninho.

### Dados pessoais (LGPD)

- **Controlador dos dados no piloto: Cardeal Map.**
- **Política de privacidade curta** e **termo de consentimento simples**, em linguagem de morador: para que serve, quem vê, por quanto tempo fica, como apagar.
- **Coleta mínima:** apelido e chave do aparelho para registrar; telefone só para quem quer participar de ações; áudio só com as duas autorizações da seção 6.4.
- Prazo de guarda: contato ligado a uma ação é apagado alguns meses depois de ela terminar; canhotos de contato são descartados após o uso.
- Botão **"Apagar meus dados"** em Meus registros. Registros já usados em encaminhamentos permanecem, mas desvinculados da pessoa.
- Menores de idade: sem telefone; conteúdo que mostre crianças não é publicado; áudio só com responsável presente.
- **Esse arranjo será revisado com orientação jurídica antes da abertura ao público.** O papel de controlador **pode ser transferido à associação de moradores**, se ela for reativada e houver acordo.

---

## 13. Interface do MVP

### Navegação (três abas)

| Aba | Conteúdo |
|---|---|
| **Bairro** | Mapa leve com os registros públicos e um botão **"Ver em lista"** (útil com pouco sinal). Filtros grandes: Natureza e memória · Cuidado · Ações |
| **Participar** (botão central, destacado) | Os três botões grandes da seção 3 |
| **Juntos** | Ações em andamento, painel do bairro e "o que mudou esta semana" |

**Meus registros** fica acessível pelo topo (ícone de pessoa), com o aviso de novidades: status e prazo de cada envio, "aguardando sinal", links "acompanhe aqui" e "Apagar meus dados".

### Linguagem

| Evitar | Usar |
|---|---|
| Ocorrência, registro georreferenciado | O que você viu |
| Status: pendente | Vamos olhar até quinta, 14h |
| Encaminhado ao órgão competente | Levamos à prefeitura em 12/05 |
| Camadas, raster, ortomosaico | Foto do bairro vista do alto |
| Não procede | Não encontramos isso no lugar (motivo) |

### Acessibilidade e aparelhos simples

- Texto base 16–18 px; botões grandes (mínimo 48 px), ícone + palavra.
- Uma decisão por tela; botão "Voltar" sempre visível; nada depende de gesto escondido.
- Contraste alto; status nunca só por cor.
- **Modo leve:** abre na lista, carrega o mapa só quando a pessoa pedir; fotos e áudios reduzidos no aparelho; áudio nunca toca sozinho; sem vídeos.
- Envio guardado sem sinal e reenviado depois.
- Instalação na tela inicial (já existe no protótipo), sem prometer mapa offline.

### Como o protótipo atual se encaixa

O protótipo já tem: escolha de ponto no mapa (funciona), rascunhos locais, PWA e aviso de conexão. Na implementação, o "rascunho local" passa a ser a **fila de envio**. As categorias atuais ("Natureza e ambiente", "Cuidado com o bairro", "Ideia para a comunidade") são substituídas pelos três tipos e subtipos acima. O WebGIS técnico continua separado e intocado.

---

## 14. Fora do MVP (de propósito)

- Comentários abertos e chat (alto custo de moderação; o WhatsApp já cumpre esse papel).
- Curtidas, rankings, pontos e perfis públicos.
- Notificações push.
- SMS automático e integração automática com WhatsApp (custo e regras próprias).
- Integração técnica com o iNaturalist.
- Transcrição automática de áudio.
- Trechos de rua (linhas) e áreas desenhadas.
- Modelos 3D na experiência do morador (ficam como "momentos" futuros).

---

## 15. Piloto de 8 semanas: critérios de sucesso

Todos os indicadores são **contagens agregadas**. Nenhum depende de seguir o que uma pessoa faz. "Pessoas" é uma contagem aproximada de aparelhos distintos no app mais fichas, visitas e repasses com origem registrada; esses números não são cruzados com nomes ou telefones.

| # | Indicador | Bom | Razoável | Fraco |
|---|---|---|---|---|
| 1 | **Moradores que participaram ao menos uma vez** (app + papel + visita + WhatsApp repassado) | 40 ou mais | 20 a 39 | Menos de 20 |
| 2 | **Registros publicados, por tipo** (Conhecer · Cuidar · Agir) | 40 ou mais, com pelo menos 5 de Conhecer e 5 de Cuidar | 20 a 39, ou um dos tipos quase vazio | Menos de 20 |
| 3 | **Problemas confirmados que foram encaminhados ou resolvidos** | 50% ou mais | 25% a 49% | Menos de 25% |
| 4 | **Ações coletivas realizadas** (com antes/depois) | 2 ou mais | 1 | Nenhuma |
| 5 | **Registros que chegaram fora do app** (mercearia, visita, reunião, WhatsApp repassado), com a parte da mercearia separada, se houver | 25% ou mais do total | 10% a 24% | Menos de 10% |

**Requisitos (não são metas, são condições):** nenhum caso de exposição de pessoa, casa ou ninho; revisão dentro de 48 h em pelo menos 9 de cada 10 envios. Se algum requisito falhar, o piloto pausa para correção antes de continuar.

**Antes do piloto:** uma conversa presencial (quadra ou mercearia) para validar categorias, aves da lista, nomes dos lugares e o nome "Bairro Vivo" com os moradores.

---

## 16. Decisões pendentes

1. **Quem é o(a) morador(a) de confiança** que fará a coordenação com a Cardeal Map.
2. **Confirmação do IRMM** como curador de aves (senão: curadoria provisória da Cardeal Map com apoio do iNaturalist, sem integração).
3. **Conversa com a mercearia:** aceita ser ponto físico? Com que frequência de recolhimento e atualização do mapa?
4. **Revisão jurídica** da política de privacidade, do termo de consentimento e do papel de controlador antes da abertura ao público.
5. **Canais oficiais de encaminhamento** na prefeitura (coleta, trânsito, ouvidoria), a levantar antes do primeiro "Encaminhado".
