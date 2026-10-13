/**
 * Tela de Login / Registro — Tec Justiça Lite
 *
 * Design premium mobile-first com cores preto, branco e dourado.
 * Animações suaves com a lib motion (já instalada no projeto).
 */

import React, { useState } from 'react';
import { JusticeLogo } from './JusticeLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, UserPlus, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onAuthenticated: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
  hasAccount: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onAuthenticated,
  onRegister,
  isLoading,
  error,
  hasAccount,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(hasAccount ? 'login' : 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setLocalError('Preencha todos os campos.');
      return;
    }

    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError('Informe um email válido.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('As senhas não conferem.');
        return;
      }
      onRegister(trimmedEmail, password);
    } else {
      onAuthenticated(trimmedEmail, password);
    }
  };

  // Indicador visual de força da senha
  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 6) return { label: 'Fraca', color: 'bg-red-500', width: '25%' };
    if (password.length < 8) return { label: 'Regular', color: 'bg-amber-500', width: '50%' };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password))
      return { label: 'Boa', color: 'bg-emerald-400', width: '75%' };
    if (password.length >= 12) return { label: 'Forte', color: 'bg-emerald-500', width: '100%' };
    return { label: 'Regular', color: 'bg-amber-500', width: '50%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center px-4 py-8 select-none">
      {/* Decorative top gradient line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 z-50" />

      {/* Background subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-3xl" />
      </div>

      {/* Logo and Title */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/40 flex items-center justify-center shadow-2xl shadow-amber-500/10 mb-4">
          <JusticeLogo size={48} />
        </div>
        <h1 className="font-cinzel text-2xl md:text-3xl font-bold tracking-wide text-white text-center">
          Tec Justiça <span className="gold-gradient-text text-xl md:text-2xl">Lite</span>
        </h1>
        <p className="text-xs text-amber-300/70 tracking-widest uppercase font-medium mt-1">
          Plataforma Jurídica Estratégica
        </p>
      </div>

      {/* Login / Register Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-[#10141f] border border-amber-500/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Card top accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <div className="p-6">
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 p-1 bg-[#090b10] border border-slate-800 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setLocalError(null); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-[#1e2538] text-amber-400 shadow-md border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setLocalError(null); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-[#1e2538] text-amber-400 shadow-md border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Criar Conta
              </button>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-sm transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength (only on register) */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Força da senha: <span className={`font-semibold ${strength.color === 'bg-red-500' ? 'text-red-400' : strength.color === 'bg-amber-500' ? 'text-amber-400' : 'text-emerald-400'}`}>{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Confirmar Senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-sm transition-all"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl gold-gradient-btn text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {mode === 'register' ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Criar Conta e Entrar
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* Mode switch hint */}
            <p className="text-center text-xs text-slate-400 mt-4">
              {mode === 'login' ? (
                <>
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setLocalError(null); }}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Registre-se
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setLocalError(null); }}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Faça Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 rounded-xl bg-[#10141f]/60 border border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-600" />
            Seus dados são armazenados localmente com criptografia AES-256
          </p>
        </div>

        {/* Company Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">Tectreinamentos Informática LTDA</p>
          <p className="text-[10px] text-slate-600">CNPJ: 40.963.840/0001-74</p>
        </div>
      </div>
    </div>
  );
};
