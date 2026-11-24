import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Fingerprint, KeyRound, Mail, Lock, 
  ArrowRight, AlertCircle, Check, Loader2 
} from 'lucide-react';
import { supabase, MASTER_USER } from '../lib/supabase';
import { 
  isBiometricsAvailable, 
  registerBiometricPasskey, 
  authenticateWithBiometrics, 
  getStoredPasskey,
  getStoredQuickPin,
  registerQuickPin,
  authenticateWithQuickPin,
} from '../utils/webauthn';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; id?: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [hasQuickPin, setHasQuickPin] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [quickPinInput, setQuickPinInput] = useState('');
  const [supportsBiometrics, setSupportsBiometrics] = useState(false);
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);

  useEffect(() => {
    async function checkBiometrics() {
      const avail = await isBiometricsAvailable();
      setSupportsBiometrics(avail);
      const stored = getStoredPasskey();
      setHasPasskey(!!stored);
      setHasQuickPin(!!getStoredQuickPin());
    }
    checkBiometrics();
  }, []);

  // One-click autofill master credentials
  const handleAutofillMaster = () => {
    setEmail(MASTER_USER.email);
    setPassword(MASTER_USER.password);
    setErrorMessage(null);
  };

  // Standard Email/Password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: inputEmail,
        password: inputPass,
      });

      if (error) {
        // Fallback for master account if network is offline or unverified
        if (inputEmail === MASTER_USER.email && inputPass === MASTER_USER.password) {
          onLoginSuccess({ email: inputEmail });
          return;
        }
        setErrorMessage(error.message || 'E-mail ou senha incorretos.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        onLoginSuccess({ email: data.user.email || inputEmail, id: data.user.id });
      }
    } catch {
      // Local fallback for master user
      if (inputEmail === MASTER_USER.email && inputPass === MASTER_USER.password) {
        onLoginSuccess({ email: inputEmail });
      } else {
        setErrorMessage('Erro ao conectar com o serviço de autenticação.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric / Passkey Login
  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authenticateWithBiometrics();
      if (!res.success) {
        setErrorMessage(res.error || 'Falha na verificação biométrica.');
        setIsLoading(false);
        return;
      }

      const targetEmail = res.email || MASTER_USER.email;

      // Ensure Supabase session is established for the biometric user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: MASTER_USER.password,
      });

      if (!error && data?.user) {
        onLoginSuccess({ email: data.user.email || targetEmail, id: data.user.id });
      } else {
        // Log in locally with validated biometric credentials
        onLoginSuccess({ email: targetEmail });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Erro ao ler biometria: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Register Biometrics (Chave de Acesso)
  const handleRegisterBiometrics = async () => {
    setIsRegisteringBiometrics(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = email.trim() || MASTER_USER.email;

    try {
      const res = await registerBiometricPasskey(targetEmail);
      if (res.success) {
        setHasPasskey(true);
        setSuccessMessage('Biometria cadastrada com sucesso neste dispositivo! Agora você pode entrar com um toque.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'Não foi possível cadastrar a biometria.');
        if (res.isCredentialManagerError) {
          setShowPinSetup(true);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsRegisteringBiometrics(false);
    }
  };

  // Register Quick PIN fallback
  const handleRegisterQuickPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const targetEmail = email.trim() || MASTER_USER.email;
    const res = await registerQuickPin(targetEmail, quickPinInput.trim());
    if (res.success) {
      setHasQuickPin(true);
      setShowPinSetup(false);
      setQuickPinInput('');
      setSuccessMessage('PIN Rápido cadastrado neste aparelho! Agora você pode entrar só com o PIN.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Erro ao salvar PIN.');
    }
  };

  // Login with Quick PIN
  const handleQuickPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authenticateWithQuickPin(quickPinInput.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'PIN incorreto.');
        setIsLoading(false);
        return;
      }
      const targetEmail = res.email || MASTER_USER.email;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: MASTER_USER.password,
      });
      if (!error && data?.user) {
        onLoginSuccess({ email: data.user.email || targetEmail, id: data.user.id });
      } else {
        onLoginSuccess({ email: targetEmail });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b0f17] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden text-slate-100">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-scaleUp">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-3 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0b0f17] rounded-[22px] flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Iron<span className="text-emerald-400">Routine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de treinos de alta performance • Conectado ao Supabase
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Cloud Database
          </div>
        </div>

        {/* Master User Quick-Fill Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Acesso Master
            </span>
            <span className="text-xs font-mono font-bold text-white">vini@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={handleAutofillMaster}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors border border-slate-700"
          >
            Preencher
          </button>
        </div>

        {/* Error and Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Biometrics / Quick PIN Login Actions */}
        {(supportsBiometrics || hasQuickPin) && (
          <div className="mb-5 space-y-2.5">
            {supportsBiometrics && (
              <div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleBiometricLogin}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-800 to-emerald-500/20 hover:from-emerald-500/30 hover:to-emerald-500/30 active:scale-95 text-white font-black text-xs sm:text-sm border border-emerald-500/40 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 transition-all group min-h-[48px]"
                >
                  <Fingerprint className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Entrar com Biometria / Chave de Acesso</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-1.5">
                  Windows Hello, Touch ID, Face ID ou impressão digital
                </p>
              </div>
            )}

            {hasQuickPin && (
              <div>
                {!showPinLogin ? (
                  <button
                    type="button"
                    onClick={() => setShowPinLogin(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-sky-400 font-bold text-xs border border-sky-500/30 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Entrar com PIN Rápido deste Aparelho</span>
                  </button>
                ) : (
                  <form onSubmit={handleQuickPinLogin} className="p-3 rounded-2xl bg-slate-950 border border-sky-500/30 flex gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={quickPinInput}
                      onChange={(e) => setQuickPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Digite seu PIN"
                      autoFocus
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-base font-black text-white tracking-widest focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs"
                    >
                      Entrar
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ou entrar com senha
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vini@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <span>Acessar Painel de Treino</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Biometrics / Quick PIN section */}
        {(supportsBiometrics || showPinSetup) && (
          <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-2.5">
            {supportsBiometrics && (
              <>
                <button
                  type="button"
                  disabled={isRegisteringBiometrics}
                  onClick={handleRegisterBiometrics}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1.5 mx-auto transition-colors py-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {hasPasskey
                      ? 'Recadastrar / Atualizar Chave de Acesso Biométrica'
                      : 'Cadastrar Biometria neste Dispositivo (Chave de Acesso)'}
                  </span>
                </button>
                <span className="text-[10px] text-slate-500 block">
                  Permite fazer login instantâneo sem digitar senha nas próximas vezes
                </span>
              </>
            )}

            {!showPinSetup ? (
              <button
                type="button"
                onClick={() => setShowPinSetup(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 underline block mx-auto"
              >
                {hasQuickPin ? 'Alterar PIN Rápido' : 'Ou cadastrar PIN Rápido (4 dígitos)'}
              </button>
            ) : (
              <form
                onSubmit={handleRegisterQuickPin}
                className="p-3 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2 text-left mt-2"
              >
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  Definir PIN Rápido (4 a 6 dígitos)
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={quickPinInput}
                    onChange={(e) => setQuickPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 1234"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-base font-black text-white tracking-widest focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs"
                  >
                    Salvar PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
