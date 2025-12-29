import { supabase } from './supabaseClient';
import { User, AuthSession } from '@/types/auth';
import { getDB } from '@/database/db';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from './emailService';

const ADMIN_EMAIL = 'admin@vistoria.local';
const ADMIN_PASSWORD = 'VSX9090123wnq!';

// Hash using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getLocalDB() {
  return await getDB();
}

// Save session to IndexedDB
export async function saveSessionLocally(session: AuthSession): Promise<void> {
  const db = await getLocalDB();
  try {
    await db.put('config', { key: 'currentSession', value: JSON.stringify(session) });
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
}

// Get session from IndexedDB
export async function getLocalSession(): Promise<AuthSession | null> {
  const db = await getLocalDB();
  try {
    const config = await db.get('config', 'currentSession');
    return config?.value ? JSON.parse(config.value as string) : null;
  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    return null;
  }
}

// Clear session from IndexedDB
export async function clearLocalSession(): Promise<void> {
  const db = await getLocalDB();
  try {
    await db.delete('config', 'currentSession');
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
}

// Send verification code via email
export async function sendVerificationCode(
  emailOrPhone: string,
  isPhone: boolean,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateVerificationCode();
    
    if (!isPhone) {
      await sendVerificationEmail(emailOrPhone, code, name);
    }

    const db = await getLocalDB();
    const verificationData = {
      code,
      emailOrPhone,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 0,
    };
    await db.put('config', { 
      key: `verification_${emailOrPhone}`, 
      value: JSON.stringify(verificationData) 
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar código:', error);
    return { success: false, error: 'Erro ao processar solicitação' };
  }
}

// Verify OTP code
export async function verifyCode(
  emailOrPhone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getLocalDB();
    const verificationData = await db.get('config', `verification_${emailOrPhone}`);

    if (!verificationData?.value) {
      return { success: false, error: 'Código expirado ou não encontrado' };
    }

    const verification = JSON.parse(verificationData.value as string);

    if (new Date() > new Date(verification.expiresAt)) {
      await db.delete('config', `verification_${emailOrPhone}`);
      return { success: false, error: 'Código expirado' };
    }

    if (verification.attempts >= 3) {
      await db.delete('config', `verification_${emailOrPhone}`);
      return { success: false, error: 'Muitas tentativas' };
    }

    if (verification.code !== code) {
      verification.attempts += 1;
      await db.put('config', { 
        key: `verification_${emailOrPhone}`, 
        value: JSON.stringify(verification) 
      });
      return { success: false, error: 'Código incorreto' };
    }

    await db.delete('config', `verification_${emailOrPhone}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return { success: false, error: 'Erro ao verificar código' };
  }
}

// Register user
export async function registerUser(
  name: string,
  emailOrPhone: string,
  password: string,
  isPhone: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!name || !emailOrPhone || !password) {
      return { success: false, error: 'Preencha todos os campos' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' };
    }

    const passwordHash = await hashPassword(password);

    const user: User = {
      id: uuidv4(),
      name,
      email: !isPhone ? emailOrPhone : undefined,
      phone: isPhone ? emailOrPhone : undefined,
      role: 'inspector',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Tentar salvar no Supabase primeiro
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            name: user.name,
            email: user.email || null,
            phone: user.phone || null,
            role: user.role,
            is_active: user.isActive,
            created_at: user.createdAt,
          }])
          .select()
          .single();

        if (error) {
          console.warn('Erro ao salvar no Supabase, salvando localmente:', error);
          try {
            console.error('Detalhes do erro Supabase (insert users):', JSON.stringify(error));
          } catch (_) {
            console.error('Detalhes do erro Supabase (insert users):', error);
          }
          // If validation error (e.g., value too long), return explicit error to UI
          if ((error as any)?.code === '22001' || (error as any)?.message?.includes('character varying')) {
            return { success: false, error: 'Um dos campos é muito longo para o banco de dados (reduza o tamanho do email/nome).' };
          }
        } else {
          console.log('✅ Usuário criado no Supabase:', data);
          // If registered online, also store credentials
          try {
            await supabase.from('user_credentials').upsert({
              user_id: user.id,
              password_hash: passwordHash,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          } catch (credErr) {
            console.warn('Erro ao salvar credenciais no Supabase', credErr);
            console.error('Detalhes do erro Supabase (upsert user_credentials):', credErr);
          }

          return { success: true };
        }
      } catch (supabaseError) {
        console.warn('Erro ao conectar Supabase, salvando localmente:', supabaseError);
        console.error('Detalhes do erro Supabase (connection):', supabaseError);
      }
    }

    // Fallback: salvar localmente
    const db = await getLocalDB();
    await db.put('config', { 
      key: `pending_user_${user.id}`, 
      value: JSON.stringify({ user, passwordHash, email: emailOrPhone })
    });

    console.log('✅ Usuário salvo localmente (sync pendente)');
    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return { success: false, error: 'Erro ao registrar usuário' };
  }
}

// Login user
export async function loginUser(
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    let user: User | null = null;

    // Check admin first
    if (emailOrPhone === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      user = {
        id: 'admin-user',
        name: 'Administrador',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    } else if (navigator.onLine) {
      // Try online lookup
      try {
        const isPhone = /^\d+/.test(emailOrPhone);
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq(isPhone ? 'phone' : 'email', emailOrPhone)
          .single();

        if (!data) {
          return { success: false, error: 'Usuário não encontrado' };
        }

        user = {
          id: data.id,
          email: data.email || undefined,
          phone: data.phone || undefined,
          name: data.name,
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      } catch (error) {
        return { success: false, error: 'Erro ao buscar usuário' };
      }
    } else {
      return { success: false, error: 'Sem conexão e usuário não encontrado localmente' };
    }

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Verificar senha local (se houver)
    try {
      const db = await getLocalDB();
      const pwEntry = await db.get('config', `user_password_${emailOrPhone}`);
      if (pwEntry?.value) {
        const providedHash = await hashPassword(password);
        if (providedHash !== pwEntry.value) {
          return { success: false, error: 'Senha incorreta' };
        }
      } else {
        // If online, try to validate against Supabase user_credentials
        if (navigator.onLine && user.id) {
          try {
            const { data: cred } = await supabase.from('user_credentials').select('password_hash').eq('user_id', user.id).single();
            if (cred?.password_hash) {
              const providedHash = await hashPassword(password);
              if (providedHash !== cred.password_hash) {
                return { success: false, error: 'Senha incorreta' };
              }
            } else {
              // No credential found: require non-empty password
              if (!password) return { success: false, error: 'Senha incorreta' };
            }
          } catch (e) {
            // fallback to local behavior
            if (!password) return { success: false, error: 'Senha incorreta' };
          }
        } else {
          // Sem senha armazenada localmente e offline: não permitir login sem senha
          if (!password) return { success: false, error: 'Senha incorreta' };
        }
      }
    } catch (e) {
      console.warn('Erro ao validar senha local', e);
    }

    const session: AuthSession = {
      user,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await saveSessionLocally(session);
    return { success: true, session };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  await clearLocalSession();
}

// Sync pending data when online
export async function syncPendingData(userId: string): Promise<void> {
  if (!navigator.onLine) return;

  const db = await getLocalDB();
  const keys = await db.getAllKeys('config');

  for (const key of keys) {
    if (typeof key !== 'string' || !key.startsWith('pending_user_')) continue;

    try {
      const config = await db.get('config', key);
      if (!config?.value) continue;

      const { user, passwordHash } = JSON.parse(config.value as string);
      let synced = false;

      try {
        // Check for existing user to avoid unique constraint conflicts
        let existing: any = null;
        try {
          if (user.email && user.phone) {
            const orFilter = `email.eq.${user.email},phone.eq.${user.phone}`;
            const { data: existData } = await supabase.from('users').select('id').or(orFilter).limit(1).maybeSingle();
            existing = existData;
          } else if (user.email) {
            const { data: existData } = await supabase.from('users').select('id').eq('email', user.email).limit(1).maybeSingle();
            existing = existData;
          } else if (user.phone) {
            const { data: existData } = await supabase.from('users').select('id').eq('phone', user.phone).limit(1).maybeSingle();
            existing = existData;
          }
        } catch (existErr) {
          console.warn('Erro ao verificar usuário existente antes de inserir:', existErr);
        }

        if (existing && existing.id) {
          console.log('syncPendingData: usuário já existe no Supabase, removendo pending:', existing.id);
          if (passwordHash) {
            try {
              await supabase.from('user_credentials').upsert({ user_id: existing.id, password_hash: passwordHash, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
            } catch (credErr) {
              console.warn('Erro ao upsert credenciais para usuário existente', credErr);
            }
          }
          synced = true;
        } else {
          const { data: userData, error: userError } = await supabase.from('users').insert([{
            id: user.id,
            name: user.name,
            email: user.email || null,
            phone: user.phone || null,
            role: user.role,
            is_active: user.isActive,
            created_at: user.createdAt,
          }]).select().single();

          if (userError) {
            console.warn('Erro ao inserir usuário no Supabase:', userError);
            throw userError;
          }

          if (passwordHash) {
            try {
              const { error: credErr } = await supabase.from('user_credentials').upsert({ user_id: user.id, password_hash: passwordHash, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
              if (credErr) console.warn('Erro ao salvar credenciais no Supabase', credErr);
            } catch (credErr) {
              console.warn('Erro ao salvar credenciais no Supabase', credErr);
            }
          }

          synced = true;
        }
      } catch (e) {
        console.warn('Erro ao inserir/atualizar usuário no Supabase:', e);
      }

      if (synced) {
        await db.delete('config', key);
        console.log('syncPendingData: pending user synced and removed:', user.id);
      } else {
        console.log('syncPendingData: pending user retained for retry:', user.id);
      }
    } catch (e) {
      console.warn('Erro ao processar pending user', e);
    }
  }
}

// Create a session from a pending local user (after email verification)
export async function createSessionFromPending(emailOrPhone: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const db = await getLocalDB();
    const keys = await db.getAllKeys('config');
    for (const key of keys) {
      if (typeof key === 'string' && key.startsWith('pending_user_')) {
        const config = await db.get('config', key);
        if (config?.value) {
          const { user } = JSON.parse(config.value as string);
          if (!user) continue;
          const match = (user.email && user.email === emailOrPhone) || (user.phone && user.phone === emailOrPhone);
          if (match) {
            const session: AuthSession = {
              user: {
                id: user.id,
                name: user.name,
                email: user.email || undefined,
                phone: user.phone || undefined,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
              },
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };

            // Save session locally so app treats user as logged in
            await saveSessionLocally(session);

            // Optionally remove the pending entry; keep it so sync can retry later
            // await db.delete('config', key);

            return { success: true, session };
          }
        }
      }
    }

    return { success: false, error: 'Pending user not found' };
  } catch (error) {
    console.error('Erro ao criar sessão a partir de pending user:', error);
    return { success: false, error: 'Erro ao criar sessão' };
  }
}


// Pedido de recuperação: reusar o envio de código
export async function requestPasswordReset(emailOrPhone: string): Promise<{ success: boolean; error?: string }> {
  return await sendVerificationCode(emailOrPhone, false);
}

// Resetar senha (salva localmente para validação no login)
export async function resetPasswordLocal(emailOrPhone: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await hashPassword(newPassword);
    const db = await getLocalDB();
    await db.put('config', { key: `user_password_${emailOrPhone}`, value: passwordHash });
    // If online, try to persist credential to Supabase user_credentials
    if (navigator.onLine) {
      try {
        // Need to resolve user_id: try to find user by email or phone
        const isPhone = /^\d+/.test(emailOrPhone);
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq(isPhone ? 'phone' : 'email', emailOrPhone)
          .limit(1)
          .single();

        if (userData?.id) {
          await supabase.from('user_credentials').upsert({
            user_id: userData.id,
            password_hash: passwordHash,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        }
      } catch (e) {
        console.warn('Erro ao sincronizar credenciais no Supabase', e);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return { success: false, error: 'Erro ao resetar senha' };
  }
}
