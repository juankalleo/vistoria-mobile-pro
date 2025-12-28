import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return setError('Informe seu email');
    setIsLoading(true);
    const ok = await requestPasswordReset(email);
    setIsLoading(false);
    if (ok) {
      navigate(`/verify-otp?contact=${encodeURIComponent(email)}&isPhone=false&isNewUser=false`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recuperar Acesso</h2>
        <p className="text-sm text-gray-600 mb-4">Informe seu email para receber um código de recuperação.</p>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </form>
      </div>
    </div>
  );
}
