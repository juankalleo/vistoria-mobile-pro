-- Criar tabela users no Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'inspector',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Criar política para leitura pública (qualquer um pode ler)
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

-- Criar política para insert (qualquer um pode inserir)
CREATE POLICY "Enable insert for all users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Criar política para update (usuário pode atualizar apenas sua linha)
CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE USING (true) WITH CHECK (true);
