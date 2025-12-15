import { supabase } from './supabaseClient';
import { User, AuthSession, PendingRegistration, VerificationCode } from '@/types/auth';
import { getDB } from '@/database/db';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from './emailService';

const ADMIN_EMAIL = 'admin@vistoria.local';
const ADMIN_PASSWORD = 'VSX9090123wnq!';

// ===== UTILITÁRIOS DE CRIPTOGRAFIA =====

// Hash usando SHA-256 (funciona no browser)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Se for admin (hash === 'admin'), já foi verificado na loginUser
  if (hash === 'admin') {
    return password === ADMIN_PASSWORD;
  }
  
  // Hash a senha fornecida e compara com o hash armazenado
  const passwordHash = await hashPassword(password);
  return passwordHash === hash || hash === password;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===== ARMAZENAMENTO LOCAL =====

async function getLocalDB() {
  const db = await getDB();
  return db;
}

export async function saveSessionLocally(session: AuthSession): Promise<void> {
  const db = await getLocalDB();
  try {
    // Usa IndexedDB através da store 'config' para salvar a sessão
    await db.put('config', { key: 'currentSession', value: JSON.stringify(session) });
  } catch (error) {
    console.error('Erro ao salvar sessão localmente:', error);
  }
}

export async function getLocalSession(): Promise<AuthSession | null> {
  const db = await getLocalDB();
  try {
    const config = await db.get('config', 'currentSession');
    if (config?.value) {
      return JSON.parse(config.value as string);
    }
    return null;
  } catch (error) {
    console.error('Erro ao recuperar sessão localmente:', error);
    return null;
  }
}

export async function clearLocalSession(): Promise<void> {
  const db = await getLocalDB();
  try {
    await db.delete('config', 'currentSession');
  } catch (error) {
    console.error('Erro ao limpar sessão local:', error);
  }
}

// ===== VERIFICAÇÃO OTP =====

export async function sendVerificationCode(
  emailOrPhone: string,
  isPhone: boolean,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateVerificationCode();
    
    // Enviar email com Resend
    if (!isPhone) {
      const emailResult = await sendVerificationEmail(emailOrPhone, code, name);
      if (!emailResult.error) {
        console.log(`✅ Email de verificação enviado para ${emailOrPhone}`);
      } else {
        console.log(`ℹ️ Código gerado: ${code} | Email será enviado quando a Edge Function estiver disponível`);
      }
    } else {
      // Para SMS no futuro
      console.log(`📱 SMS seria enviado para ${emailOrPhone}`);
    }

    // Sempre salvar código localmente para desenvolvimento/teste
    const db = await getLocalDB();
    const verificationData = {
      code,
      emailOrPhone,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
      attempts: 0,
    };
    await db.put('config', { 
      key: `verification_${emailOrPhone}`, 
      value: JSON.stringify(verificationData) 
    });

    console.log(`🔐 CÓDIGO SALVO LOCALMENTE para ${emailOrPhone}: ${code}`);
    console.log(`⏱️ Válido por 10 minutos`);

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    return { success: false, error: 'Erro ao processar solicitação' };
  }
}

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

    // Verificar expiração
    if (new Date() > new Date(verification.expiresAt)) {
      await db.delete('config', `verification_${emailOrPhone}`);
      return { success: false, error: 'Código expirado' };
    }

    // Verificar tentativas
    if (verification.attempts >= 3) {
      await db.delete('config', `verification_${emailOrPhone}`);
      return { success: false, error: 'Muitas tentativas. Solicite um novo código' };
    }

    // Verificar código
    if (verification.code !== code) {
      verification.attempts += 1;
      await db.put('config', {
        key: `verification_${emailOrPhone}`,
        value: JSON.stringify(verification),
      });
      return { success: false, error: 'Código inválido' };
    }

    // Limpar código verificado
    await db.delete('config', `verification_${emailOrPhone}`);
    
    // Agora confirmar o usuário pendente
    await confirmPendingUser(emailOrPhone);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return { success: false, error: 'Erro ao verificar código' };
  }
}

// Confirmar usuário pendente após verificação de email
async function confirmPendingUser(emailOrPhone: string): Promise<void> {
  const db = await getLocalDB();
  const keys = await db.getAllKeys('config');
  
  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith('pending_user_')) {
      const config = await db.get('config', key);
      if (config?.value) {
        try {
          const pending = JSON.parse(config.value as string);
          
          // Verificar se é o email/phone que está sendo confirmado
          if (pending.email === emailOrPhone) {
            const { user, passwordHash } = pending;
            
            // Salvar usuário confirmado localmente
            await db.put('config', {
              key: `user_${user.id}`,
              value: JSON.stringify(user),
            });
            await db.put('config', {
              key: `user_password_${user.id}`,
              value: passwordHash,
            });
            
            // Salvar no Supabase se online
            if (navigator.onLine) {
              try {
                const { error } = await supabase.from('users').insert([
                  {
                    id: user.id,
                    email: user.email || null,
                    phone: user.phone || null,
                    name: user.name,
                    role: user.role,
                    is_active: user.isActive,
                    created_at: user.createdAt,
                  },
                ]);

                if (!error) {
                  // Só salvar credenciais se o usuário foi criado com sucesso
                  await supabase.from('user_credentials').insert([
                    {
                      user_id: user.id,
                      password_hash: passwordHash,
                    },
                  ]);
                }
              } catch (error) {
                console.warn('Erro ao salvar usuário confirmado no Supabase:', error);
              }
            }
            
            // Remover pendente
            await db.delete('config', key);
            break;
          }
        } catch (e) {
          // Ignorar erro de parse
        }
      }
    }
  }
}

// ===== REGISTRO =====

export async function registerUser(
  name: string,
  emailOrPhone: string,
  password: string,
  isPhone: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar entrada
    if (!name || !emailOrPhone || !password) {
      return { success: false, error: 'Preencha todos os campos' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' };
    }

    // Verificar se email/phone já existe
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq(isPhone ? 'phone' : 'email', emailOrPhone);

      if (error) throw error;
      if (data && data.length > 0) {
        return { success: false, error: `${isPhone ? 'Telefone' : 'Email'} já cadastrado` };
      }
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário
    const user: User = {
      id: uuidv4(),
      name,
      email: !isPhone ? emailOrPhone : undefined,
      phone: isPhone ? emailOrPhone : undefined,
      role: 'inspector',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const db = await getLocalDB();

    // Salvar localmente (temporário, antes da verificação de email)
    await db.put('config', { 
      key: `pending_user_${user.id}`, 
      value: JSON.stringify({ user, passwordHash, email: emailOrPhone })
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, error: 'Erro ao registrar usuário' };
  }
}

// ===== LOGIN =====

export async function loginUser(
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    let user: User | null = null;
    let userId: string | null = null;
    let localPasswordHash: string | null = null;

    const db = await getLocalDB();

    // Tentar login online primeiro
    if (navigator.onLine) {
      const isAdmin = emailOrPhone === ADMIN_EMAIL && password === ADMIN_PASSWORD;

      if (isAdmin) {
        // Login admin - direto sem verificar Supabase
        user = {
          id: 'admin-user',
          name: 'Administrador',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        userId = 'admin-user';
        // Skip password hash for admin (already verified above)
        localPasswordHash = 'admin';
      } else {
        // Procurar usuário no Supabase
        const isPhone = /^\d+/.test(emailOrPhone);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq(isPhone ? 'phone' : 'email', emailOrPhone)
          .single();

        if (error || !data) {
          return { success: false, error: 'Usuário não encontrado' };
        }

        userId = data.id;
        user = {
          id: data.id,
          email: data.email || undefined,
          phone: data.phone || undefined,
          name: data.name,
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at,
          lastLogin: data.last_login,
        };

        // Buscar hash da senha
        const { data: credData, error: credError } = await supabase
          .from('user_credentials')
          .select('password_hash')
          .eq('user_id', userId)
          .single();

        if (credError || !credData) {
          return { success: false, error: 'Erro ao verificar credenciais' };
        }

        localPasswordHash = credData.password_hash;
      }
    } else {
      // Modo offline: procurar usuário localmente
      // Percorrer todas as chaves para encontrar usuário
      const keys = await db.getAllKeys('config');
      
      for (const key of keys) {
        if (typeof key === 'string' && key.startsWith('user_') && !key.includes('password')) {
          try {
            const config = await db.get('config', key);
            if (config?.value) {
              const localUser = JSON.parse(config.value as string);
              const isPhone = /^\d+/.test(emailOrPhone);
              
              if (
                (!isPhone && localUser.email === emailOrPhone) ||
                (isPhone && localUser.phone === emailOrPhone)
              ) {
                user = localUser;
                userId = localUser.id;
                break;
              }
            }
          } catch (e) {
            // Ignorar erro de parse
          }
        }
      }

      if (!userId) {
        return { success: false, error: 'Usuário não encontrado offline' };
      }

      // Buscar hash local
      const passwdConfig = await db.get('config', `user_password_${userId}`);
      if (passwdConfig?.value) {
        localPasswordHash = passwdConfig.value as string;
      }
    }

    if (!user || !userId) {
      return { success: false, error: 'Falha na autenticação' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Usuário desativado' };
    }

    // Verificar senha
    if (!localPasswordHash) {
      return { success: false, error: 'Erro ao verificar credenciais' };
    }

    const passwordMatch = await verifyPassword(password, localPasswordHash);

    if (!passwordMatch) {
      return { success: false, error: 'Senha incorreta' };
    }

    // Criar sessão
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias

    const session: AuthSession = {
      user,
      token,
      expiresAt,
    };

    // Salvar sessão
    await saveSessionLocally(session);

    // Se online, atualizar last_login no Supabase
    if (navigator.onLine && userId !== 'admin-user') {
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
      } catch (error) {
        console.warn('Erro ao atualizar last_login:', error);
      }
    }

    return { success: true, session };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

// ===== LOGOUT =====

export async function logoutUser(): Promise<void> {
  await clearLocalSession();
}

// ===== FILA DE SINCRONIZAÇÃO =====

export async function addToSyncQueue(
  userId: string,
  action: 'create' | 'update' | 'delete',
  tableName: 'vistorias' | 'users',
  recordId: string,
  data: any
): Promise<void> {
  const db = await getLocalDB();
  
  // Seria salvo em uma store específica para sync queue
  // Por enquanto, salvar em config com padrão de chave
  const queueItem = {
    id: uuidv4(),
    userId,
    action,
    tableName,
    recordId,
    data,
    timestamp: new Date().toISOString(),
    status: 'pending',
    attempts: 0,
  };

  await db.put('config', {
    key: `sync_queue_${queueItem.id}`,
    value: JSON.stringify(queueItem),
  });
}

export async function syncPendingData(userId: string): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline: sincronização adiada');
    return;
  }

  const db = await getLocalDB();
  const keys = await db.getAllKeys('config');

  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith('sync_queue_')) {
      try {
        const config = await db.get('config', key);
        if (config?.value) {
          const queueItem = JSON.parse(config.value as string);
          
          if (queueItem.userId === userId && queueItem.status === 'pending') {
            // Sincronizar baseado no tipo de ação
            const success = await syncQueueItem(queueItem);
            
            if (success) {
              queueItem.status = 'synced';
            } else {
              queueItem.attempts += 1;
              if (queueItem.attempts > 3) {
                queueItem.status = 'failed';
              }
            }

            await db.put('config', {
              key: `sync_queue_${queueItem.id}`,
              value: JSON.stringify(queueItem),
            });
          }
        }
      } catch (error) {
        console.error('Erro ao processar fila de sincronização:', error);
      }
    }
  }
}

async function syncQueueItem(queueItem: any): Promise<boolean> {
  try {
    const { tableName, action, recordId, data } = queueItem;

    if (tableName === 'vistorias') {
      if (action === 'create' || action === 'update') {
        const { error } = await supabase
          .from('vistorias')
          .upsert([data], { onConflict: 'id' });
        return !error;
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('vistorias')
          .delete()
          .eq('id', recordId);
        return !error;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar item:', error);
    return false;
  }
}
