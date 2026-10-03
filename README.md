# ALTAR · Devocional Espírita

MVP 1.0. Um espaço digital para alguns minutos de leitura, reflexão e interiorização.

Aplicação web mobile-first, instalável como PWA, com as leituras disponíveis offline. Conta é opcional: sem ela, tudo fica guardado no próprio aparelho.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

O `npm run dev` importa e valida o conteúdo antes de subir o servidor. No modo de desenvolvimento, as inconsistências aparecem numa faixa na própria tela.

**Ver outro dia como se fosse hoje.** O conteúdo cobre outubro de 2026. Para conferir a Home num dia específico, use `?hoje=2026-10-12`. O valor vale até a aba ser fechada.

## Build e deploy (Vercel)

```bash
npm run build        # importa + valida (estrito) + service worker + build Next.js
npm start            # servidor de produção em http://localhost:3000
```

As páginas de leitura são pré-geradas (estáticas). Só `/api/*` roda no servidor, para contas e sincronização.

**Na Vercel:**
1. Importe o repositório. O preset Next.js é detectado sozinho.
2. Em **Settings → Git → Production Branch**, use o branch que contém o app (ou faça o merge no `main`).
3. Em **Settings → Environment Variables**, cadastre:

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Conexão do Neon (projeto **altar**). Use a string *pooled* do console do Neon. |
| `RESEND_API_KEY` | Envio dos e-mails de confirmação ([resend.com](https://resend.com)). |
| `EMAIL_FROM` | Remetente, ex.: `ALTAR <ola@seudominio.com.br>`. O domínio precisa estar verificado na Resend. |
| `APP_URL` | Endereço público, ex.: `https://altar.vercel.app`, usado nos links dos e-mails. |

Sem `DATABASE_URL`, o app funciona normalmente, mas sem contas. Sem `RESEND_API_KEY`, o cadastro responde "Não conseguimos enviar o e-mail agora".

## Contas (opcionais)

A leitura nunca exige login. A conta serve para guardar favoritos, leituras concluídas e preferências e levá-los para outros aparelhos.

**Cadastro em dois passos, sem senha no primeiro momento:**
1. **Mais → Conta → Criar uma conta.** A pessoa informa só o e-mail.
2. Ela recebe um e-mail **"Confirmar e criar senha"**. O link (válido por 24 h, de uso único) abre a tela em que ela cria a senha, e ao salvar já entra na conta.

**Esqueci minha senha** usa o mesmo caminho: e-mail → link → nova senha. A resposta é sempre a mesma, exista ou não conta, para não revelar quais e-mails estão cadastrados.

**Segurança:**
- Senhas guardadas com scrypt.
- Links e sessões guardados apenas como hash SHA-256.
- Cookie de sessão `httpOnly`/`secure`/`SameSite=Lax`, válido por 180 dias.
- Bloqueio de requisições de outras origens.
- Intervalo mínimo de 1 minuto entre e-mails para o mesmo endereço.
- Trocar a senha encerra as outras sessões.

**Desenvolvimento:** sem `RESEND_API_KEY`, o e-mail aparece no terminal e a tela mostra o link para teste. Para testar com um Postgres local, aplique o esquema com `DATABASE_URL=... npm run db:schema` e rode `DATABASE_URL=... npm run dev`.

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

## Banco de dados (Neon)

O conteúdo editorial também fica guardado no Postgres do Neon, no projeto **altar** (`polished-sea-11997910`, região São Paulo).

- **Esquema:** `db/schema.sql`. Tabelas: `editions`, `editorial_notes`, `devotionals`, `import_issues` e `verified_quotes`. Esta última fica vazia até existirem citações conferidas.
- **Gravar uma edição:** `npm run content:sql` gera `db/seed/<ano-mês>.sql` a partir dos dados já validados e se recusa a gerar se houver erro. Depois: `psql "$DATABASE_URL" -f db/seed/2026-10.sql`. A gravação substitui a edição inteira, em uma transação.
- **Edição de outubro/2026:** gravada com 31 dias. A integridade foi conferida por hash SHA-256 de todos os textos, calculado no banco e localmente, com resultado idêntico.
- **O app continua lendo do JSON gerado no build** (rápido, funciona offline e não expõe credenciais no navegador). O banco é o arquivo editorial e a base para recursos futuros: CMS, contas, sincronização de favoritos.
- **Credenciais:** pegue a `DATABASE_URL` no console do Neon e não a coloque no repositório.

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

Pagamentos, comunidade, gamificação (sem pontos ou sequências), IA gerando conteúdo, citações automáticas e scraping.
