# Plano 029 — Colagem de capturas de tela e arrastar-e-soltar de imagens no chat

> **Status:** Implementado — homologação manual pendente
> **Versão:** 1.0
> **Data:** 01/09/2026
> **Escopo:** frontend, experiência de envio, acessibilidade, segurança, QA e rollout
> **Pré-requisitos:** `plan-027` (envio de mídia temporária) e o compositor atual de conversas/grupos disponíveis no ambiente alvo

## 1. Objetivo

Permitir que um atendente copie uma captura de tela e use `Ctrl+V`/`Cmd+V` dentro do chat para abrir imediatamente o fluxo de prévia/edição da imagem. Também será possível arrastar uma imagem do explorador de arquivos para o compositor.

A imagem nunca será enviada automaticamente. Tanto a colagem quanto o drop devem apenas preencher o anexo e abrir o mesmo modal de edição usado pelo botão **Anexar arquivo**; o atendente continua podendo editar, adicionar legenda, cancelar ou confirmar o envio.

O comportamento deve ser idêntico em conversas privadas e em conversas de grupo. A única diferença continua sendo o destino já resolvido pelo chat atual; não haverá endpoint novo nem tratamento especial de mídia no backend.

Fluxo desejado:

```text
Copiar captura de tela
        │
        └─ colar no compositor focado
              ├─ encontrou imagem no ClipboardEvent?
              │      ├─ não → manter a colagem de texto normal
              │      └─ sim → impedir texto alternativo, criar File local
              └─ abrir ImageEditorDialog existente

Arrastar arquivo para o compositor
        │
        ├─ imagem aceita → abrir ImageEditorDialog existente
        └─ outro tipo/múltiplos arquivos → feedback orientando o usuário

Confirmar no modal
        └─ seguir o mesmo MediaAttachmentPicker → progresso → cancelamento → API atual
```

## 2. Resultado esperado para o usuário

- Uma captura copiada do sistema é reconhecida sem precisar salvar um PNG no disco.
- O modal abre com a imagem pronta para anotar/cortar, preservando as ferramentas já disponíveis.
- O envio só acontece ao clicar em **Enviar**; fechar o modal ou remover o anexo não dispara requisição.
- Durante o arraste, o compositor indica claramente que a imagem pode ser solta.
- O usuário recebe uma mensagem compreensível para formato não aceito, múltiplos arquivos ou falha de leitura.
- A colagem de texto continua funcionando normalmente quando o clipboard não contém imagem.
- O mesmo comportamento aparece nos chats privados e nos grupos, inclusive quando o grupo está incorporado à fila.

## 3. Diagnóstico do estado atual

### 3.1 Frontend

- `frontend/src/pages/conversation/components/MediaAttachmentPicker.tsx` já aceita um arquivo, cria prévia local, mostra tamanho/progresso, abre `ImageEditorDialog` para imagens e `VideoEditorDialog` para vídeos e permite cancelar/remover.
- `frontend/src/pages/conversation/index.tsx` usa o picker no compositor privado, com `useSendMedia`, `AbortController`, validação do limite de vídeo e mensagens de erro amigáveis.
- `frontend/src/pages/groups/index.tsx` possui um compositor próprio, mas reutiliza `MediaAttachmentPicker`, o progresso, o cancelamento e o endpoint de mídia de grupo.
- Nenhum dos compositores registra `onPaste`, `onDragEnter`, `onDragOver`, `onDragLeave` ou `onDrop`.
- A API `frontend/src/lib/api-client.ts` já usa `XMLHttpRequest` somente quando é necessário observar progresso de `FormData`; a origem do `File` não interfere nesse mecanismo.

### 3.2 Backend e integração

- Conversas privadas usam `POST /api/conversations/:id/media`.
- Grupos usam `POST /api/zapi/groups/:groupId/media`.
- Ambos recebem `multipart/form-data`, validam MIME/assinatura/tamanho no servidor e enviam a mídia à Z‑API sem persistir o binário localmente.
- Como uma imagem colada vira um `File` comum antes do envio, não é necessário migration, nova permissão, novo endpoint ou alteração no adaptador Z‑API.
- O backend continua sendo a autoridade para limites, assinatura, RBAC, idempotência e erros `400/403/413/422/502/503`.

## 4. Decisões de produto e UX

### 4.1 Uma imagem por ação

Na primeira versão, cada colagem ou operação de drop aceita uma única imagem, mantendo o modelo atual de um anexo por envio e evitando picos de memória. Se o `DataTransfer` contiver mais de uma imagem, a primeira não deve ser enviada silenciosamente: mostrar o aviso **“Envie uma imagem por vez para revisar e adicionar a legenda.”** e permitir que o usuário repita a ação.

Uma fila de múltiplas imagens fica registrada como evolução, não como requisito desta entrega.

### 4.2 Clipboard

- Escutar o evento `paste` no contêiner do compositor (não no documento inteiro), para respeitar o foco e não interceptar outras telas.
- Procurar primeiro itens `kind === "file"` cujo MIME comece com `image/`.
- Quando houver imagem, chamar `preventDefault()` para não inserir a representação textual/HTML da captura no campo e enviar o Blob ao mesmo pipeline do seletor de arquivos.
- Quando não houver imagem, não chamar `preventDefault()`; texto, links e atalhos continuam com o comportamento nativo da `Textarea`.
- Não solicitar permissão via `navigator.clipboard.read()` nem ler o clipboard fora de uma ação de colagem. A origem permanece sob controle do navegador.
- Como capturas do sistema podem chegar sem nome, gerar nome local determinístico e seguro, por exemplo `captura-20260831-143015.png`, preservando o MIME real quando disponível.

### 4.3 Drag-and-drop

- O alvo é o contêiner visual do compositor, incluindo a área da `Textarea` e da barra de anexos, sem transformar o histórico em uma zona de drop.
- `dragover` deve chamar `preventDefault()` somente quando houver arquivo; isso impede a navegação acidental do navegador para o arquivo solto.
- Usar contador de entradas (`dragenter`/`dragleave`) ou estado equivalente para evitar que a indicação pisque ao atravessar filhos do contêiner.
- Enquanto ativo, exibir borda tracejada, camada discreta e rótulo **“Solte uma imagem para anexar”**, usando tokens semânticos do tema atual. A camada não deve cobrir nem bloquear o botão de enviar.
- Aceitar somente o primeiro arquivo de imagem. Arquivos não-imagem devem gerar **“Este chat aceita imagens por arrastar e soltar. Use Anexar arquivo para outros formatos.”**
- Em touch/mobile, não criar affordance de drop; o botão de anexo e a colagem continuam disponíveis.

### 4.4 Modal e confirmação

- Reutilizar `ImageEditorDialog` existente, incluindo cortar, desenhar, setas, texto e legenda.
- O modal deve abrir depois que o `File` estiver criado e antes de `mediaFile` ser considerado pronto para envio, evitando que o botão **Enviar** apareça habilitado para um arquivo não revisado.
- Ao aplicar a edição, o arquivo resultante retorna ao `MediaAttachmentPicker` já existente; ao cancelar, referências temporárias são liberadas e o compositor volta ao estado anterior.
- Foco deve retornar ao compositor após fechar o modal. O título e a descrição acessíveis existentes devem ser preservados.

## 5. Arquitetura proposta

### 5.1 Entrada única de arquivos

Extrair uma rotina compartilhada para normalizar a origem do arquivo e encaminhá-lo ao picker:

```ts
type MediaInputSource = "file-picker" | "clipboard" | "drop";

type MediaInputResult = {
  file: File;
  source: MediaInputSource;
};
```

A rotina deve:

1. localizar a imagem no `ClipboardEvent` ou `DataTransfer`;
2. criar um `File` com nome seguro quando o Blob não possuir nome;
3. rejeitar ausência de arquivo, tipo não-imagem, arquivo vazio ou excesso de arquivos com uma mensagem estável;
4. delegar o `File` ao método já usado pelo seletor de arquivo;
5. deixar validação definitiva de MIME, assinatura e limite para o backend.

Recomendação de API: transformar o `MediaAttachmentPicker` em uma superfície reutilizável que exponha uma ação tipada de abertura (`openFile(file, source)`) por `forwardRef`/`useImperativeHandle`, ou equivalente por callback controlado. O objetivo é que input, paste e drop chamem a mesma função que decide entre `ImageEditorDialog`, `VideoEditorDialog` e anexo direto, sem duplicar estado de editor.

### 5.2 Hook de clipboard/drop

Criar `frontend/src/pages/conversation/hooks/use-media-clipboard-drop.ts` (ou mover para `frontend/src/hooks/` se a implementação final for compartilhada fora das páginas) com:

- `isDragActive`;
- `handlePaste`;
- `handleDragEnter`;
- `handleDragOver`;
- `handleDragLeave`;
- `handleDrop`;
- `lastInputError`/callback de erro;
- limpeza de listeners e contador no unmount.

O hook não deve conhecer React Query, endpoints, `conversationId` ou `groupId`. Ele apenas entrega um `File` aceito para o compositor e informa a origem para telemetria local/UX.

### 5.3 Componente visual do alvo

Criar um wrapper compartilhado, por exemplo `MediaComposerDropZone.tsx`, que:

- recebe `disabled`, `onFile`, `onError` e os filhos do compositor;
- aplica `role="region"` e `aria-label` descritivo quando necessário;
- usa `cn()` para a classe condicional de arraste;
- mantém `Button`, `Textarea`, `Attachment`, `Progress`, `Alert` e `Dialog` como primitives shadcn, sem cards/bubbles paralelos;
- não adiciona z-index manual ao modal;
- exibe a indicação de drop apenas no estado ativo e com `aria-live="polite"` para mudanças importantes.

O wrapper deverá envolver tanto o compositor de `conversation/index.tsx` quanto o de `groups/index.tsx`. Se a duplicação de markup for grande, extrair primeiro somente o comportamento e depois avaliar um componente de composer completo em uma etapa separada.

### 5.4 Ciclo de estado

```text
idle
  ├─ paste/drop de imagem → editorOpen
  ├─ paste de texto → textarea normal
  └─ drop inválido → erro acessível

editorOpen
  ├─ cancelar → idle (revoga recursos)
  └─ aplicar → selected (anexo revisado)

selected
  ├─ remover → idle
  └─ enviar → uploading/processing (fluxo existente)

uploading/processing
  ├─ cancelar → idle + AbortController
  ├─ sucesso → sent + limpar estado
  └─ erro → selected + mensagem acionável
```

O componente não deve iniciar upload no `drop`/`paste`, nem manter o Blob em estado global, localStorage, IndexedDB ou query cache.

## 6. Decomposição por arquivos

### Frontend

- `frontend/src/pages/conversation/components/MediaAttachmentPicker.tsx`
  - centralizar a entrada de `File` e tornar reutilizável o disparo dos editores;
  - preservar preview, revogação de Object URL, legenda, progresso, cancelamento e remoção;
  - manter `accept` e permissões atuais.
- `frontend/src/pages/conversation/hooks/use-media-clipboard-drop.ts`
  - normalização de Clipboard/DataTransfer, estado de arraste e mensagens de rejeição.
- `frontend/src/pages/conversation/components/MediaComposerDropZone.tsx`
  - superfície visual e acessível compartilhada pelos dois compositores.
- `frontend/src/pages/conversation/index.tsx`
  - envolver o compositor privado, conectar o ref/callback do picker e preservar `useSendMedia`, atalhos, teclado Enter e cancelamento.
- `frontend/src/pages/groups/index.tsx`
  - aplicar o mesmo wrapper e a mesma origem de arquivo, sem alterar o destino do endpoint de grupo ou o comportamento de digitação/presença.
- `frontend/src/styles.css` (somente se necessário)
  - tokens/ajustes responsivos para o estado de drop; preferir classes semânticas Tailwind e evitar cores hardcoded.
- `frontend/src/types/index.ts` (opcional)
  - adicionar tipos compartilhados apenas se o hook exigir DTO público; não incluir dados binários ou URLs.

### Backend

Nenhuma alteração de rota, schema Prisma, migration, permissão ou adaptador Z‑API é necessária nesta fase. Apenas executar os testes existentes de envio de mídia para comprovar que a origem clipboard/drop é indistinguível de um arquivo escolhido pelo input.

### Documentação

- Atualizar `docs/ARCHITECTURE.md` com a entrada única do compositor e a regra de não persistência do clipboard.
- Atualizar `docs/DESIGN_SYSTEM.md` com o estado visual de drop, foco e mensagens de erro do compositor.
- Atualizar `docs/API.md` somente com uma nota de compatibilidade: os endpoints continuam recebendo um `File` multipart igual ao fluxo atual; não há contrato novo.
- Adicionar uma seção de homologação ao `docs/QA_MIDIA_ZAPI.md` ou ao runbook de mídia para colagem e drop nos dois tipos de chat.

## 7. Requisitos funcionais

### RF-01 — Colar captura de tela

Com o foco em qualquer parte do compositor, colar uma imagem do sistema deve abrir o editor de imagem. A captura não deve aparecer como texto na `Textarea`.

### RF-02 — Preservar texto

Colar texto, link, emoji ou conteúdo sem item de imagem deve continuar inserindo o conteúdo no campo, sem abrir modal.

### RF-03 — Drag-and-drop de imagem

Soltar um único PNG, JPEG, WebP ou outro MIME de imagem homologado sobre o compositor deve abrir o editor e exibir o estado de revisão.

### RF-04 — Rejeição compreensível

Drop de PDF, vídeo, áudio, arquivo vazio ou múltiplos arquivos deve manter o chat intacto e mostrar um erro acionável, sem navegar para o arquivo e sem iniciar upload.

### RF-05 — Revisão antes do envio

O modal deve ser aberto antes de qualquer requisição. O usuário pode cancelar, editar, adicionar legenda e somente então clicar em **Enviar**.

### RF-06 — Paridade entre chats

As mesmas ações devem funcionar em uma conversa privada e em uma conversa de grupo, respeitando as permissões já existentes e mantendo seus endpoints de envio atuais.

### RF-07 — Estados existentes

Após confirmar, o usuário deve ver exatamente os estados atuais de preparo, progresso percentual, cancelamento, sucesso e falha. Não criar uma segunda barra de progresso para paste/drop.

### RF-08 — Recuperação

Fechar/cancelar o modal, remover o anexo ou cancelar o upload deve revogar Object URLs e abortar a requisição quando ela já tiver começado, sem deixar seleção fantasma no próximo envio.

## 8. Acessibilidade e conteúdo

- O alvo de drop deve ter nome acessível e foco visível quando receber foco via teclado.
- O destaque visual não pode ser a única indicação: usar texto curto e `aria-live` para **“Solte uma imagem para anexar”**.
- Erros devem usar `role="alert"`, informar o motivo e orientar a ação seguinte.
- Não usar instruções dependentes apenas de cor ou movimento; respeitar `prefers-reduced-motion`.
- Os botões existentes devem manter rótulos em português: **Anexar arquivo**, **Editar imagem**, **Remover arquivo**, **Cancelar envio** e **Enviar**.
- O modal deve continuar atendendo `Esc`, tabulação cíclica e retorno de foco, conforme o padrão do `Dialog` shadcn.
- Em telas pequenas, a área de drop deve ocupar o compositor sem forçar rolagem horizontal nem alterar a altura fixa do chat.

## 9. Segurança, privacidade e desempenho

- Não usar `navigator.clipboard.read()` em segundo plano, não escutar o documento inteiro e não registrar conteúdo do clipboard em logs.
- Manter o arquivo somente em memória do navegador até a confirmação; nunca persistir em localStorage, IndexedDB, cache de query ou backend antes do envio.
- Revogar toda `URL.createObjectURL` em troca, cancelamento, sucesso e desmontagem, inclusive quando o editor falhar.
- Não confiar no MIME informado pelo navegador: o backend mantém validação de extensão, assinatura, tamanho, RBAC e limite efetivo.
- Aplicar o limite de memória existente de um arquivo por vez e evitar conversões duplicadas de Blob/Base64 no frontend.
- Ignorar eventos de drop quando o componente estiver desabilitado ou quando o upload/processamento estiver ativo.
- Impedir navegação do browser somente em `dragover`/`drop` válidos do compositor; não alterar comportamento de outras áreas da aplicação.
- Não adicionar dependência externa para resolver paste/drop; usar APIs DOM já disponíveis no alvo suportado.

## 10. Plano de testes

### 10.1 Testes unitários do helper/hook

- Extrai PNG copiado de `ClipboardEvent.clipboardData.items`.
- Mantém colagem de texto quando não há imagem.
- Gera nome seguro para Blob sem nome e preserva o MIME quando possível.
- Rejeita arquivo vazio, tipo não-imagem e lista com mais de um arquivo.
- Executa `preventDefault` apenas quando encontrou uma imagem aceitável.
- Reseta o contador de drag ao sair do alvo e no unmount.
- Não chama `onFile` quando `disabled` está ativo.

Se o projeto ainda não possuir runner frontend, manter o helper puro e cobrir a lógica com o harness de testes frontend adotado na implementação; não introduzir uma dependência de teste apenas para simular DOM sem decisão registrada.

### 10.2 Testes de componente/E2E

- Colar uma captura na conversa privada abre `ImageEditorDialog` e não envia requisição.
- Colar a mesma captura em um grupo abre o mesmo editor e mantém a rota de grupo.
- Editar, adicionar legenda e confirmar envia uma única requisição multipart com `clientMessageId`.
- Fechar o modal ou clicar em remover não cria mensagem nem requisição.
- Arrastar uma imagem mostra o estado ativo, aceita o drop e abre o modal.
- Arrastar PDF/vídeo ou múltiplos arquivos mostra o erro amigável e não navega a página.
- Colar texto segue funcionando no campo de mensagem.
- Enquanto o upload está em andamento, o drop fica desabilitado, o progresso existente aparece e o cancelamento aborta a requisição.
- Falhas `413`, `422`, `502` e `503` continuam usando as mensagens de mídia atuais.
- Foco, `Esc`, leitores de tela e layout responsivo funcionam nos temas claro e escuro.

### 10.3 Regressão de backend

- Executar `backend/test/outbound-media.contract.test.js` e os testes de grupos/mídia existentes.
- Confirmar que o endpoint privado e o de grupo recebem os mesmos campos (`file`, `caption`, `clientMessageId`, `Idempotency-Key`).
- Confirmar que nenhuma tabela, log ou evento passa a receber o binário da captura antes da confirmação.

## 11. Observabilidade e rollout

Não é necessário feature flag para o contrato de API, mas a entrega deve ser ativada de forma incremental no frontend caso o time utilize flags de interface:

1. adicionar o helper e o wrapper atrás de uma flag local/desligável;
2. testar em um departamento e em um grupo de homologação;
3. acompanhar erros de leitura do clipboard, rejeições de tipo, cancelamentos, `413` e tempo entre drop/paste e abertura do modal;
4. habilitar para todos após validar chats privado e grupo;
5. em incidente, desligar apenas os listeners de paste/drop; o botão **Anexar arquivo** e o envio textual continuam disponíveis.

Métricas/eventos permitidos devem conter somente `source` (`clipboard`/`drop`/`file-picker`), tipo, tamanho aproximado, resultado e duração. Não registrar nome completo do arquivo, conteúdo, Blob, Data URL, token ou URL da Z‑API.

## 12. Critérios de aceite

- [ ] `Ctrl+V`/`Cmd+V` de uma captura de tela dentro do compositor abre o modal de imagem em menos de um ciclo de renderização perceptível, sem upload automático.
- [ ] A imagem colada pode ser editada, legendada, cancelada e enviada pelo mesmo fluxo do botão de anexo.
- [ ] Drop de uma imagem abre o mesmo modal e exibe indicação visual durante o arraste.
- [ ] Colagem de texto não é quebrada e drop de formatos não aceitos não navega a página.
- [ ] A regra de um arquivo por vez é explícita para múltiplos drops.
- [ ] Conversas privadas e grupos apresentam a mesma experiência, sem duplicar a lógica de envio.
- [ ] Progresso, cancelamento, erros amigáveis, idempotência e mensagens persistidas permanecem inalterados.
- [ ] Nenhum binário do clipboard é persistido pela aplicação; Object URLs são revogadas em todos os caminhos de saída.
- [ ] Teclado, leitor de tela, tema claro/escuro e telas pequenas são suportados.
- [ ] Build do frontend e suíte de contratos de mídia/grupos passam sem alteração regressiva.

## 13. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Navegador entrega Blob sem nome ou MIME vazio | Preview/validação inconsistente | Inferir extensão segura para a captura, manter validação final no backend e mostrar erro acionável se a assinatura não corresponder |
| Evento `paste` intercepta texto junto com a imagem | Texto inesperado no campo | Procurar item de imagem antes de `preventDefault`; sem imagem, preservar evento nativo |
| `dragleave` dispara ao atravessar filhos | Overlay pisca ou desaparece | Contador de entradas ou `relatedTarget` normalizado e limpeza no unmount |
| Drop durante upload substitui o anexo em trânsito | Perda/duplicidade de envio | Desabilitar drop enquanto `uploading`/`processing`; exigir cancelamento explícito antes de nova seleção |
| Capturas grandes pressionam memória | Travamento no navegador | Um arquivo por vez, limite antecipado apenas como otimização, revogação imediata de Object URL e backend como autoridade |
| Compositores privado/grupo divergem novamente | Bugs diferentes por tipo de chat | Hook e wrapper únicos, checklist de paridade e teste nos dois endpoints |
| Usuário espera colar vídeo ou PDF | Confusão de expectativa | Mensagem de formato clara e deixar botão de anexo disponível para os demais tipos já suportados |

## 14. Ideias para evolução (fora do MVP)

- Fila visual para múltiplas imagens coladas/soltas, com edição e legenda independentes.
- Aceitar vídeos/arquivos copiados de aplicativos que os disponibilizem como `ClipboardItem`, reutilizando o editor de vídeo quando homologado.
- Arrastar uma imagem diretamente sobre o histórico para destacar o compositor e rolar até ele, sem tornar o histórico um dropzone permanente.
- Exibir dica contextual discreta **“Você também pode colar uma imagem (Ctrl/Cmd+V)”** na primeira utilização, com opção de dispensar.
- Manter rascunhos locais criptografados para recuperação após falha de rede — somente se houver decisão explícita de retenção e privacidade.
- Adicionar telemetria de UX agregada para comparar tempo entre captura, revisão e envio, sem coletar conteúdo.

## 15. Responsabilidades sugeridas

Conforme `agents/README.md`, a execução pode ser dividida entre os perfis abaixo, sem alterar a decisão de arquitetura central:

- **Tech Lead & Arquiteto:** revisar a API de entrada única e confirmar que não há mudança de contrato/migration.
- **Desenvolvedor Frontend:** implementar hook, wrapper, integração nos dois compositores e acessibilidade.
- **Engenheiro de QA & Testes:** validar clipboard, DnD, regressões de mídia, teclado, responsividade e dois tipos de chat.
- **Engenheiro de Segurança:** revisar não persistência do clipboard, revogação de Object URLs e ausência de conteúdo em telemetria/logs.

## 16. Definição de pronto

A tarefa estará pronta quando os critérios de aceite forem evidenciados nos dois chats, o fluxo de arquivo colado/solto compartilhar o mesmo código do seletor atual, os testes de mídia existentes passarem, o build frontend estiver verde e a documentação de arquitetura/QA registrar a nova entrada sem alterar o contrato de envio da Z‑API.

## 17. Registro da execução

- Criado `use-media-clipboard-drop.ts` para tratar clipboard, `DataTransfer`, validação de imagens, nomes de capturas e estado de arraste.
- Criado `MediaComposerDropZone.tsx` com indicação visual e acessível de drop, aplicado aos compositores privado e de grupos.
- `MediaAttachmentPicker.tsx` agora expõe `openFile()` por ref, fazendo colagem/drop compartilharem os mesmos editores e estados do seletor nativo.
- `conversation/index.tsx` e `groups/index.tsx` foram integrados sem alteração dos endpoints, progresso, cancelamento ou idempotência existentes.
- Documentação de arquitetura, API, design system, QA e índice de documentos atualizada.
- Verificações concluídas: `npx tsc --noEmit` no frontend, `npm run build` no frontend, `npm run build` no backend e contratos `outbound-media`/`plan-028` aprovados.
- Homologação manual no navegador (colar captura, drop, cancelamento e envio real em privado/grupo) permanece como etapa operacional, pois depende de uma instância autenticada e da Z‑API disponível.
