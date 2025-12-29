import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

export function VerifyOTPScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOTP, verifyOTP, error, isLoading, setError, syncData } = useAuthStore();

  const contact = searchParams.get('contact');
  const isPhone = searchParams.get('isPhone') === 'true';
  const isNewUser = searchParams.get('isNewUser') === 'true';

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Auto-focus no input
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (!contact) {
      navigate('/login');
      return;
    }

    // Enviar código automaticamente na primeira vez
    sendOTP(contact, isPhone);
  }, [contact, isPhone, navigate, sendOTP]);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(numericValue);

    if (numericValue.length === OTP_LENGTH) {
      handleVerify(numericValue);
    }
  };

  const handleVerify = async (verifyCode?: string) => {
    const codeToVerify = verifyCode || code;

    if (codeToVerify.length !== OTP_LENGTH) {
      setError('Digite o código completo');
      return;
    }

    const success = await verifyOTP(contact!, codeToVerify);

    if (success) {
      // Tentar sincronizar quaisquer usuários pendentes (salvos localmente quando offline)
      try {
        await syncData();
      } catch (e) {
        console.warn('Erro ao sincronizar após verificação', e);
      }
      // Mostrar notificação de sucesso
      if (isNewUser) {
        toast.success('Verificação realizada — bem-vindo!');
      } else {
        toast.success('Código verificado. Você pode criar uma nova senha.');
      }
      if (isNewUser) {
        // Ir para tela de home após registro bem-sucedido
        navigate('/');
      } else {
        // Ir para tela de alteração de senha
        navigate('/change-password');
      }
    }
  };

  const handleResend = async () => {
    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    setCode('');
    await sendOTP(contact!, isPhone);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatContact = () => {
    if (isPhone) {
      const numbers = contact!.replace(/\D/g, '');
      if (numbers.length >= 10) {
        // Formato: (XX) XXXXX-XXXX
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
      return contact!;
    }
    return contact!;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {/* Header com botão voltar */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">Verificação</h1>
            <p className="text-xs text-gray-600 mt-1">
              {isNewUser ? 'Complete seu registro' : 'Verificar identidade'}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Enviamos um código de 6 dígitos para:
          </p>
          <p className="font-medium text-gray-900 mt-1">{formatContact()}</p>
          <p className="text-xs text-gray-600 mt-3 flex items-start gap-2">
            <span className="text-blue-600 font-semibold">💡</span>
            <span>Verifique a pasta <strong>Spam</strong> do seu email se não receber em alguns segundos</span>
          </p>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulário */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="otp-code" className="text-sm font-medium">
              Código de Verificação
            </Label>
            <div className="mt-2 flex gap-2 justify-between">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => {
                    const newCode = code.split('');
                    newCode[index] = e.target.value.replace(/\D/g, '');
                    const updatedCode = newCode.join('');
                    handleCodeChange(updatedCode);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      setFocusIndex(index - 1);
                      const inputs = document.querySelectorAll('input[inputmode="numeric"]');
                      (inputs[index - 1] as HTMLInputElement)?.focus();
                    } else if (e.key === 'ArrowLeft' && index > 0) {
                      const inputs = document.querySelectorAll('input[inputmode="numeric"]');
                      (inputs[index - 1] as HTMLInputElement)?.focus();
                    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
                      const inputs = document.querySelectorAll('input[inputmode="numeric"]');
                      (inputs[index + 1] as HTMLInputElement)?.focus();
                    }
                  }}
                  disabled={isLoading}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  onFocus={() => setFocusIndex(index)}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || code.length !== OTP_LENGTH}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </form>

        {/* Reenviar */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Reenviar código
            </button>
          ) : (
            <p className="text-sm text-gray-600">
              Reenviar em{' '}
              <span className="font-medium text-gray-900">
                {countdown}s
              </span>
            </p>
          )}
        </div>

        {/* Dica de offline */}
        {!navigator.onLine && (
          <div className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
            Modo offline: o código será enviado quando conectado.
          </div>
        )}
      </div>
    </div>
  );
}
