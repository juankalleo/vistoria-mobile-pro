import { create } from 'zustand';
import { User, AuthSession } from '@/types/auth';
import {
  loginUser,
  logoutUser,
  registerUser,
  sendVerificationCode,
  verifyCode,
  requestPasswordReset,
  resetPasswordLocal,
  getLocalSession,
  saveSessionLocally,
  syncPendingData,
} from '@/services/authService';

interface AuthStore {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  sessionLoading: boolean;
  error: string | null;
  isOnline: boolean;
  pendingUserName: string | null; // Para armazenar o nome durante o registro

  // Autenticação
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, emailOrPhone: string, password: string, isPhone: boolean) => Promise<boolean>;
  requestPasswordReset: (emailOrPhone: string) => Promise<boolean>;
  resetPassword: (emailOrPhone: string, newPassword: string) => Promise<boolean>;
  
  // Verificação OTP
  sendOTP: (emailOrPhone: string, isPhone: boolean) => Promise<boolean>;
  verifyOTP: (emailOrPhone: string, code: string) => Promise<boolean>;

  // Estado
  setError: (error: string | null) => void;
  checkSession: () => Promise<void>;
  syncData: () => Promise<void>;
  setOnline: (online: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  sessionLoading: true,
  error: null,
  isOnline: navigator.onLine,
  pendingUserName: null,

  login: async (emailOrPhone: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginUser(emailOrPhone, password);
      if (result.success && result.session) {
        set({
          session: result.session,
          user: result.session.user,
          isLoading: false,
        });
        return true;
      } else {
        set({
          error: result.error || 'Falha ao fazer login',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
      set({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer logout';
      set({ error: message, isLoading: false });
    }
  },

  register: async (name: string, emailOrPhone: string, password: string, isPhone: boolean) => {
    set({ isLoading: true, error: null, pendingUserName: name });
    try {
      const result = await registerUser(name, emailOrPhone, password, isPhone);
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({
          error: result.error || 'Erro ao registrar',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  requestPasswordReset: async (emailOrPhone: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await requestPasswordReset(emailOrPhone);
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: result.error || 'Erro ao solicitar reset', isLoading: false });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao solicitar reset';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  resetPassword: async (emailOrPhone: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await resetPasswordLocal(emailOrPhone, newPassword);
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: result.error || 'Erro ao resetar senha', isLoading: false });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  sendOTP: async (emailOrPhone: string, isPhone: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const { pendingUserName } = get();
      const result = await sendVerificationCode(emailOrPhone, isPhone, pendingUserName || undefined);
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({
          error: result.error || 'Erro ao enviar código',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar código';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  verifyOTP: async (emailOrPhone: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await verifyCode(emailOrPhone, code);
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({
          error: result.error || 'Erro ao verificar código',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar código';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  checkSession: async () => {
    try {
      const session = await getLocalSession();
      if (session) {
        // Verificar se sessão não expirou
        if (new Date(session.expiresAt) > new Date()) {
          set({
            session,
            user: session.user,
            sessionLoading: false,
          });
        } else {
          await get().logout();
          set({ sessionLoading: false });
        }
      } else {
        set({ sessionLoading: false });
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      set({ sessionLoading: false });
    }
  },

  syncData: async () => {
    // Sempre tentar sincronizar pendentes quando online (não depende de sessão ativa)
    if (!navigator.onLine) return;
    try {
      await syncPendingData('');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    }
  },

  setOnline: (online: boolean) => {
    set({ isOnline: online });
  },
}));

// Monitorar conexão
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAuthStore.setState({ isOnline: true }));
  window.addEventListener('offline', () => useAuthStore.setState({ isOnline: false }));
  // Dev helper: expose store to window for manual testing (only in dev)
  if (import.meta.env.MODE === 'development') {
    // @ts-ignore
    window.useAuthStore = useAuthStore;
  }
}
