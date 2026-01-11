import { login } from '@/app/auth/actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl border-slate-100">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">VintedFlips</h1>
          <p className="text-sm text-slate-500">Inicia sesión para gestionar tu imperio</p>
        </div>

        <form action={login} className="space-y-4">
          <Input 
            name="email" 
            type="email" 
            label="Correo electrónico" 
            placeholder="admin@vintedflips.com" 
            required 
          />
          
          <Input 
            name="password" 
            type="password" 
            label="Contraseña" 
            required 
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Entrar
          </button>
        </form>
      </Card>
    </div>
  );
}