-- ===== TABELA DE USUÁRIOS =====
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  role VARCHAR CHECK (role IN ('admin', 'inspector', 'user')) DEFAULT 'inspector',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ===== TABELA DE CREDENCIAIS DE USUÁRIO =====
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  password_hash VARCHAR NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE VISTORIAS =====
CREATE TABLE IF NOT EXISTS public.vistorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  numero VARCHAR NOT NULL UNIQUE,
  placa VARCHAR NOT NULL,
  data DATE NOT NULL,
  hora VARCHAR,
  seguradora VARCHAR,
  veiculo VARCHAR,
  cor VARCHAR,
  ano VARCHAR,
  segurado VARCHAR,
  local VARCHAR,
  telefone VARCHAR,
  destino VARCHAR,
  tipo_veiculo VARCHAR,
  tipo_servico VARCHAR,
  condicao_pneus VARCHAR,
  tem_documento BOOLEAN,
  nivel_combustivel VARCHAR,
  quilometragem VARCHAR,
  motivo_chamada VARCHAR,
  motivo_outro VARCHAR,
  status VARCHAR CHECK (status IN ('rascunho', 'completa')) DEFAULT 'rascunho',
  dados_carro JSONB,
  itens_seguranca JSONB,
  itens_ausentes BOOLEAN,
  descricao_itens_ausentes TEXT,
  possui_avarias BOOLEAN,
  descricao_avarias TEXT,
  observacoes TEXT,
  declaracao_entrega JSONB,
  declaracao_recebimento JSONB,
  fotos TEXT[],
  foto_types VARCHAR[],
  fotos_obrigatorias JSONB,
  video_seguranca TEXT,
  pdf_base64 TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- ===== TABELA DE FILA DE SINCRONIZAÇÃO =====
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR CHECK (action IN ('create', 'update', 'delete')),
  table_name VARCHAR CHECK (table_name IN ('vistorias', 'users')),
  record_id VARCHAR NOT NULL,
  data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  status VARCHAR CHECK (status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP,
  error_message TEXT
);

-- ===== ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_vistorias_user_id ON public.vistorias(user_id);
CREATE INDEX IF NOT EXISTS idx_vistorias_numero ON public.vistorias(numero);
CREATE INDEX IF NOT EXISTS idx_vistorias_placa ON public.vistorias(placa);
CREATE INDEX IF NOT EXISTS idx_vistorias_status ON public.vistorias(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON public.sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem acessar suas próprias credenciais" ON public.user_credentials;
DROP POLICY IF EXISTS "Usuários veem suas próprias vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários criam suas próprias vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários atualizam suas próprias vistorias" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários veem sua fila" ON public.sync_queue;

-- Desabilitar RLS por enquanto (usar autenticação manual no app)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue DISABLE ROW LEVEL SECURITY;

-- ===== TRIGGER PARA ATUALIZAR updated_at =====
DROP TRIGGER IF EXISTS update_vistorias_updated_at ON public.vistorias;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vistorias_updated_at
  BEFORE UPDATE ON public.vistorias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ===== FUNÇÃO PARA CRIAR USUÁRIO ADMIN =====
-- Execute uma vez para criar o usuário admin
-- Obs: bcryptjs.hash('VSX9090123wnq!', 10) = $2a$10$... (substitua pelo hash real)

INSERT INTO public.users (id, name, email, role, is_active, created_at)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Administrador', 'admin@vistoria.local', 'admin', true, NOW())
ON CONFLICT DO NOTHING;

-- Ou via cliente de autenticação do Supabase, defina como admin em is_admin claim
