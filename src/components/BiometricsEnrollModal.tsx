import React, { useState } from 'react';
import { X, Fingerprint, Check, AlertCircle, Loader2 } from 'lucide-react';
import { registerBiometricPasskey } from '../utils/webauthn';

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
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerBiometricPasskey(email);
    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      onEnrolledSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } else {
      setErrorMessage(res.error || 'Falha ao registrar biometria.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp text-center">
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <Fingerprint className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-white mb-1">
          Cadastrar Biometria
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Vincule o Windows Hello, Touch ID, Face ID ou leitor de impressão digital deste dispositivo à conta <strong>{email}</strong>.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold mb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Biometria cadastrada com sucesso!</span>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Aguardando leitura do sensor...</span>
                </>
              ) : (
                <span>Ativar Chave de Acesso Agora</span>
              )}
            </button>

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
