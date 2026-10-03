# ALTAR · Devocional Espírita

MVP 1.0. Um espaço digital para alguns minutos de leitura, reflexão e interiorização.

Aplicação web mobile-first, instalável como PWA, que funciona offline. Não tem login nem backend: tudo fica guardado no próprio aparelho.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

O `npm run dev` importa e valida o conteúdo antes de subir o servidor. No modo de desenvolvimento, as inconsistências aparecem numa faixa na própria tela.

**Ver outro dia como se fosse hoje.** O conteúdo cobre outubro de 2026. Para conferir a Home num dia específico, use `?hoje=2026-10-12`. O valor vale até a aba ser fechada.

## Build e deploy

```bash
npm run build        # importa + valida (estrito) + gera o site estático em out/ + service worker
npm start            # serve out/ em http://localhost:3000
```

A pasta `out/` é um site 100% estático e pode ir para qualquer hospedagem estática, como Vercel, Netlify, Cloudflare Pages, GitHub Pages ou S3:

- **Vercel / Netlify / Cloudflare Pages:** comando de build `npm run build`; diretório de saída `out`.
- O app precisa estar na **raiz do domínio**, porque o service worker e o manifest usam `/`.
- Use HTTPS. O service worker (offline) e as notificações exigem HTTPS.

Outros comandos: `npm run lint`, `npm run typecheck`, `npm run content:import` e `npm run content:validate`.

## Conteúdo editorial

O app **não escreve conteúdo**. A única fonte é o arquivo `content/source/devocional_outubro_2026.txt`, que é cópia fiel do arquivo entregue (edição de outubro de 2026, com 31 dias).

```
content/source/*.txt  ──(scripts/content/import.mjs)──▶  src/content/generated/devotionals.json  ──▶  app
                       ──(scripts/content/validate.mjs)──▶  build falha se houver erro
```

O importador apenas recorta o arquivo nos campos `TEMA`, `CARD ESPECIAL`, `REFLEXÃO`, `MOMENTO DE INTERIORIZAÇÃO`, `PRECE`, `PRÁTICA DO DIA`, `FRASE FINAL` e `FONTE DE INSPIRAÇÃO`. A única normalização é a do fim de linha. Os parágrafos são mantidos como estão (separados por linha em branco).

O validador confere:

- quantidade de dias igual aos dias reais do mês (outubro = 31);
- nenhuma data duplicada, ausente, inexistente ou fora de ordem;
- número do `DIA` igual à data;
- todas as seções presentes, na ordem certa, sem duplicação e sem conteúdo vazio;
- **reconstrução idêntica**: cada dia é remontado a partir dos dados e comparado, caractere por caractere, com o bloco original. Isso garante que nenhuma prece ou reflexão foi alterada, truncada ou deslocada para outro dia;
- se o JSON gerado corresponde ao arquivo-fonte (hash SHA-256 + comparação profunda). Uma edição manual no JSON é detectada;
- heurística de truncamento: toda seção deve terminar com pontuação final (gera aviso).

**Para corrigir ou adicionar conteúdo:** edite ou adicione o `.txt` em `content/source/` e rode `npm run content:import`. Não edite `devotionals.json` à mão.

### Fonte de inspiração ≠ citação literal

O texto de `FONTE DE INSPIRAÇÃO` é mostrado como está, somente ao final da leitura. Ele não é decomposto em autor, obra e capítulo, para não inferir dados. A arquitetura para uma futura biblioteca de **citações literais verificadas** (obra, edição, página, status de verificação e situação de direitos) está em `src/content/quotes.ts` e está intencionalmente vazia.

## Pontos editoriais em aberto

Pontos encontrados na importação da edição de outubro/2026. Nenhum texto foi alterado:

1. **Marcadores técnicos nas fontes.** 22 linhas de `FONTE DE INSPIRAÇÃO / REFERÊNCIA` terminavam com caracteres invisíveis de citação (`citeturn0search1` e parecidos, U+E200–U+E202), resíduo da ferramenta que gerou o texto. Eles apareceriam como lixo na tela, então o importador os remove por uma regra técnica explícita e o validador lista cada remoção (linha a linha) como aviso. O ideal é limpar o arquivo-fonte.
2. **Possível erro de digitação no dia 02/10:** "transformar diferença em **inimizado**" (provavelmente "inimizade"). Mantido como está.
3. **Título × tema.** O arquivo traz apenas `TEMA:`, que é usado como título.
4. **Datas especiais.** Nenhum dia tem `CARD ESPECIAL:`. Os dias 02 (Não-Violência), 03 (Allan Kardec), 12 (Dia das Crianças) e 24 (Dia das Nações Unidas) tratam de datas, mas aparecem como leitura normal. Para virarem card especial, basta adicionar `CARD ESPECIAL: <rótulo>` logo abaixo do `TEMA:` desses dias.
5. **Ilustrações.** Como não há datas especiais marcadas, as composições gráficas provisórias (`src/components/illustrations.tsx`) não estão associadas a nenhum dia (`src/content/editorial-assets.ts`).
6. **Notas editoriais do arquivo** (introdução e "Notas de verificação editorial") são exibidas em **Mais → Sobre o conteúdo**. Elas pedem uma revisão bibliográfica final antes de uma publicação comercial.

## Estrutura

```
content/source/                 arquivo editorial original
scripts/content/                importador e validador
scripts/generate-sw.mjs         service worker (offline), gerado após o build
src/content/                    tipos, acesso aos dados, arquitetura de citações, assets visuais
src/lib/                        datas, persistência local, notificações, imagem de compartilhamento
src/components/                 splash, navegação, calendário, cards, leitor, ilustrações, ícones
src/app/                        telas: Início, Calendário, Favoritos, Mais, Devocional
```

**Stack:** Next.js 16 (App Router, exportação estática), React 19, TypeScript e Tailwind CSS 4. Fontes: Faculty Glyphic e Geist, auto-hospedadas via `next/font`. Não usamos shadcn/ui nem Motion: o MVP tem poucos controles, e as animações são CSS puro (leves e desligadas com `prefers-reduced-motion`). Assim evitamos dependências sem necessidade.

## Funcionalidades

- **Splash:** letras dispersas, depois a coluna A·L·T·A·R, depois ALTAR, que cresce levemente. ~2,2 s no primeiro acesso, ~0,7 s nos seguintes; não aparece de novo na mesma sessão. Toque para pular.
- **Leitura:** coluna de leitura, barra de progresso discreta, tamanho do texto (Pequeno, Médio, Grande, Muito grande) e tema (Automático, Claro, Escuro). A conclusão é registrada ao chegar ao fim, e a pessoa pode favoritar ou compartilhar.
- **Compartilhamento:** imagem 1080×1920 gerada no aparelho (canvas) e enviada pela folha de compartilhamento do sistema (Web Share API); se não houver suporte, a imagem é baixada.
- **Persistência local** (`localStorage`, prefixo `altar:`): preferências, favoritos, dias concluídos e lembrete.
- **Offline:** todas as páginas e recursos são pré-carregados pelo service worker.
- **Lembrete diário:** a permissão só é pedida quando a pessoa ativa o lembrete. Na web, sem servidor de push, ele só dispara com o app aberto ou em segundo plano recente. Para lembretes com o app fechado, implemente `NotificationAdapter` (`src/lib/notifications.ts`) com notificações locais nativas (por exemplo, Capacitor LocalNotifications) ou com Web Push.
- **Acessibilidade:** contraste AA nos textos, alvos de toque ≥ 44 px, rótulos para leitores de tela (inclusive em cada dia do calendário), foco visível e `prefers-reduced-motion`.

## Fora do escopo do MVP

Login, cadastro, backend, pagamentos, comunidade, gamificação (sem pontos ou sequências), IA gerando conteúdo, citações automáticas e scraping.
