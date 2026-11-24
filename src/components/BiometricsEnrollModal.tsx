import React, { useState } from 'react';
import { X, Fingerprint, Check, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { registerBiometricPasskey, registerQuickPin } from '../utils/webauthn';

interface BiometricsEnrollModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onEnrolledSuccess: () => void;
}

export const BiometricsEnrollModal: React.FC<BiometricsEnrollModalProps> = ({
  isOpen,
  email,
  onClose,
  onEnrolledSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerBiometricPasskey(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Biometria cadastrada com sucesso!');
      onEnrolledSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1800);
    } else {
      setErrorMessage(res.error || 'Falha ao registrar biometria.');
      if (res.isCredentialManagerError) {
        setShowPinFallback(true);
      }
    }
  };

  const handleRegisterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await registerQuickPin(email, pinInput.trim());
    if (res.success) {
      setSuccessMessage('PIN Rápido ativado neste dispositivo!');
      onEnrolledSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setPinInput('');
      }, 1600);
    } else {
      setErrorMessage(res.error || 'Erro ao salvar PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-sm w-full max-h-[90dvh] overflow-y-auto shadow-2xl animate-scaleUp text-center">
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <Fingerprint className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-white mb-1">
          Acesso Rápido & Biometria
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Vincule a biometria (Passkey) ou um PIN Rápido deste aparelho à conta <strong>{email}</strong>.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 text-left leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold mb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 min-h-[46px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Aguardando leitura do sensor...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Ativar Biometria (Passkey)</span>
                </>
              )}
            </button>

            {!showPinFallback ? (
              <button
                type="button"
                onClick={() => setShowPinFallback(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ou cadastrar PIN Rápido (4 dígitos)</span>
              </button>
            ) : (
              <form
                onSubmit={handleRegisterPin}
                className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2.5 text-left"
              >
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  Alternativa: PIN Rápido (4 a 6 dígitos)
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 1234"
                    className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-base font-black text-white tracking-widest focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
