import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';

export function ChangePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('contact') || '';
  const { resetPassword, error, setError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirm) return setError('Preencha todos os campos');
    if (password !== confirm) return setError('Senhas não coincidem');
    if (password.length < 6) return setError('Senha muito curta');

    setIsLoading(true);
    const success = await resetPassword(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Criar nova senha</h2>
        <p className="text-sm text-gray-600 mb-4">Usuário: {email}</p>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </div>
  );
}
