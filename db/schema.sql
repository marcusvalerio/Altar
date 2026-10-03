-- ALTAR — esquema do banco editorial (Neon / PostgreSQL).
--
-- O arquivo-fonte (.txt) continua sendo a origem do conteúdo: ele é importado,
-- validado (npm run content:validate) e só então gravado aqui por
-- `npm run content:sql` → db/seed/<edição>.sql. Ninguém edita textos direto no banco.

CREATE TABLE IF NOT EXISTS editions (
  id              text PRIMARY KEY,                 -- ex.: '2026-10'
  year            integer NOT NULL,
  month           integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  heading         text NOT NULL,                    -- cabeçalho do arquivo, como está
  subtitle        text NOT NULL,
  source_file     text NOT NULL,
  source_sha256   text NOT NULL,                    -- hash do arquivo importado
  technical_normalizations text[] NOT NULL DEFAULT '{}',
  imported_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (year, month)
);

CREATE TABLE IF NOT EXISTS editorial_notes (
  edition_id  text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  position    integer NOT NULL,
  title       text NOT NULL,
  paragraphs  text[] NOT NULL,
  PRIMARY KEY (edition_id, position)
);

CREATE TABLE IF NOT EXISTS devotionals (
  date                date PRIMARY KEY,
  edition_id          text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  source_day_label    text NOT NULL,                -- ex.: 'DIA 01'
  title               text NOT NULL CHECK (title <> ''),       -- linha "TEMA:"
  reflection          text NOT NULL CHECK (reflection <> ''),
  interiorization     text,
  prayer              text,
  practice            text,
  closing_phrase      text,
  source_kind         text NOT NULL DEFAULT 'inspiration' CHECK (source_kind = 'inspiration'),
  source_label        text,                         -- rótulo da seção, como no arquivo
  source_text         text,                         -- "Fonte de inspiração" ≠ citação literal
  commemorative_label text,                         -- "CARD ESPECIAL:", só se existir no arquivo
  is_special          boolean NOT NULL DEFAULT false,
  content_sha256      text NOT NULL                 -- hash dos campos, para auditoria
);
CREATE INDEX IF NOT EXISTS devotionals_edition_idx ON devotionals (edition_id, date);

CREATE TABLE IF NOT EXISTS import_issues (
  id          bigserial PRIMARY KEY,
  edition_id  text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  level       text NOT NULL CHECK (level IN ('error', 'warning')),
  location    text NOT NULL,
  message     text NOT NULL
);

-- Futura biblioteca de CITAÇÕES LITERAIS verificadas (vazia no MVP).
-- Espelha src/content/quotes.ts. Só status 'verified' pode ser exibido.
CREATE TABLE IF NOT EXISTS verified_quotes (
  id                     text PRIMARY KEY,
  text                   text NOT NULL,
  author                 text NOT NULL,
  work                   text NOT NULL,
  original_work          text,
  translator             text,
  edition                text NOT NULL,
  publisher              text,
  year                   integer,
  chapter                text,
  question               text,
  page                   text,
  source_of_verification text NOT NULL,
  status                 text NOT NULL DEFAULT 'unverified'
                           CHECK (status IN ('unverified', 'in_review', 'verified', 'rejected')),
  verified_by            text,
  verified_at            timestamptz,
  rights                 text NOT NULL DEFAULT 'unknown'
                           CHECK (rights IN ('public_domain', 'licensed', 'short_quotation', 'unknown'))
);

-- ============================================================================
-- Contas (opcionais — a leitura nunca exige login)
-- Cadastro: e-mail → link de confirmação → a pessoa define a senha → entra.
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash     text,                           -- scrypt; nulo até a senha ser criada
  email_verified_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Links enviados por e-mail (criar senha / redefinir senha). Só o hash é guardado.
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash  text PRIMARY KEY,
  email       text NOT NULL CHECK (email = lower(email)),
  purpose     text NOT NULL CHECK (purpose IN ('signup', 'reset')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz
);
CREATE INDEX IF NOT EXISTS auth_tokens_email_idx ON auth_tokens (email, created_at DESC);

-- Sessões: o cookie leva um token aleatório; o banco guarda só o hash.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

-- Dados de leitura sincronizados entre aparelhos.
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  devotional_date date NOT NULL,
  saved_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, devotional_date)
);

CREATE TABLE IF NOT EXISTS user_completions (
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  devotional_date date NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, devotional_date)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme       text NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  text_size   text NOT NULL DEFAULT 'md' CHECK (text_size IN ('sm', 'md', 'lg', 'xl')),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
