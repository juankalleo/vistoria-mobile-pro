import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, register, error, isLoading } = useAuthStore();

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    const success = await login(loginEmail, loginPassword);
    if (success) navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // Debug log
    console.log('Campos registro:', {registerName, registerEmail, registerPassword, registerConfirmPassword});

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      let missing = [];
      if (!registerName) missing.push('Nome');
      if (!registerEmail) missing.push('Email');
      if (!registerPassword) missing.push('Senha');
      if (!registerConfirmPassword) missing.push('Confirmação');
      setRegisterError('Preencha: ' + missing.join(', '));
      return;
    }

    // Validação rápida de tamanho de campos para evitar erro 22001 do Supabase
    if (registerEmail.length > 50) {
      setRegisterError('Email muito longo (use até 50 caracteres)');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('As senhas não coincidem');
      return;
    }

    try {
      // isPhone should be false for email registration
      const ok = await register(registerName, registerEmail, registerPassword, false);
      if (!ok) {
        setRegisterError('Erro ao registrar. Verifique os dados e tente novamente.');
        return;
      }
      // Redireciona para tela de verificação de código (marcando como novo usuário)
      navigate(`/verify-otp?isNewUser=true`, {
        state: {
          email: registerEmail,
          info: 'Um código foi enviado para seu email. Verifique também a caixa de spam.'
        }
      });
    } catch (err: any) {
      setRegisterError(err?.message || 'Erro ao registrar');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Fundo borrado */}
      <img
        src="/guinchofundo.jpg"
        alt="Fundo guincho"
        className="absolute inset-0 w-full h-full object-cover blur-lg brightness-75 z-0"
        style={{ pointerEvents: 'none' }}
      />
      {/* Glassmorphism background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl z-0" />

      <div className="w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl rounded-3xl p-8 relative">
          <div className="flex flex-col items-center mb-8">
            <h2
              className="text-5xl font-extrabold tracking-tight font-sans animate-gradient bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
              style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(99,102,241,0.10)',
              }}
            >
              Vistoria
            </h2>
            <style>{`
              @keyframes gradient {
                0% {background-position: 0% 50%;}
                50% {background-position: 100% 50%;}
                100% {background-position: 0% 50%;}
              }
              .animate-gradient {
                background-size: 400% 400%;
                animation: gradient 6s ease-in-out infinite;
              }
            `}</style>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 gap-2 mb-4 bg-white/40 rounded-xl p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">Registrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {error && (<Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4"/><AlertDescription>{error}</AlertDescription></Alert>)}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="login-email" className="text-gray-700">Email</Label>
                  <Input id="login-email" type="email" autoComplete="username" placeholder="usuario@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className="mt-1 bg-white/60 border-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-gray-700">Senha</Label>
                  <div className="relative mt-1">
                    <Input id="login-password" type={showLoginPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} className="bg-white/60 border-none pr-10 focus:ring-2 focus:ring-indigo-400" />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600" disabled={isLoading}>
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full font-semibold shadow-md" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Entrando...</>) : 'Entrar'}</Button>

                <div className="mt-2 text-center">
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Esqueci a senha</Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              {registerError && (<Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4"/><AlertDescription>{registerError}</AlertDescription></Alert>)}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <Label htmlFor="register-name" className="text-gray-700">Nome</Label>
                  <Input id="register-name" type="text" placeholder="Seu nome" value={registerName} onChange={(e) => setRegisterName(e.target.value)} disabled={isLoading} className="mt-1 bg-white/60 border-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                <div>
                  <Label htmlFor="register-email" className="text-gray-700">Email</Label>
                  <Input id="register-email" type="email" placeholder="usuario@email.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} disabled={isLoading} className="mt-1 bg-white/60 border-none focus:ring-2 focus:ring-indigo-400" />
                </div>


                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Label htmlFor="register-password" className="text-gray-700">Senha</Label>
                    <Input id="register-password" type={showRegisterPassword ? 'text' : 'password'} placeholder="••••••" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} disabled={isLoading} className="mt-1 bg-white/60 border-none pr-10 focus:ring-2 focus:ring-indigo-400" />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-indigo-600" tabIndex={-1}>
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Label htmlFor="register-confirm-password" className="text-gray-700">Confirmar</Label>
                    <Input id="register-confirm-password" type={showRegisterPassword ? 'text' : 'password'} placeholder="••••••" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} disabled={isLoading} className="mt-1 bg-white/60 border-none pr-10 focus:ring-2 focus:ring-indigo-400" />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-indigo-600" tabIndex={-1}>
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full font-semibold shadow-md" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Criando...</>) : 'Criar conta'}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
