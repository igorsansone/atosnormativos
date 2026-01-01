-- Migration inicial para PostgreSQL
-- Cria tabelas sequences e acts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sequences (
  id serial PRIMARY KEY,
  act_type varchar(50) NOT NULL,
  year integer NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  UNIQUE (act_type, year)
);

CREATE TYPE IF NOT EXISTS act_type_enum AS ENUM ('DECISAO', 'PORTARIA', 'RESOLUCAO');

CREATE TYPE IF NOT EXISTS requesting_sector_enum AS ENUM (
  'SECRETARIA','CADASTRO','TELEFONIA','COBRANCA','FINANCEIRO',
  'PRESIDENCIA','PLENARIO','PROJUR','COMPRAS','RECURSOS_HUMANOS',
  'CPD','FISCALIZACAO','DIRETORIA'
);

CREATE TYPE IF NOT EXISTS homologation_enum AS ENUM (
  'DIRETORIA','PLENARIO','SECRETARIA','DESPACHO_PRESIDENTE','OUTROS','PENDENTE_DE_HOMOLOGACAO'
);

CREATE TYPE IF NOT EXISTS status_enum AS ENUM ('ACTIVE','ARCHIVED','VOIDED');

CREATE TABLE IF NOT EXISTS acts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  number varchar(20) NOT NULL,
  sequential_number integer NOT NULL,
  year integer NOT NULL,
  act_type act_type_enum NOT NULL,
  object text,
  requesting_sector requesting_sector_enum,
  date_act date,
  homologation homologation_enum,
  homologation_number varchar(200),
  published_site boolean DEFAULT false,
  published_word boolean DEFAULT false,
  published_pdf boolean DEFAULT false,
  published_pending boolean DEFAULT false,
  status status_enum DEFAULT 'ACTIVE',
  archived_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acts_type_year_seq ON acts(act_type, year, sequential_number);
CREATE INDEX IF NOT EXISTS idx_acts_status ON acts(status);
