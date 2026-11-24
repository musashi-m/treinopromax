import React, { useState } from 'react';
import { Dumbbell, Image as ImageIcon, ZoomIn, X, Check } from 'lucide-react';
import type { MuscleGroup } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary';

interface ExerciseMediaProps {
  gifUrl: string;
  name: string;
  muscleGroup: MuscleGroup;
  instructions?: string;
  className?: string;
  onUpdateGifUrl?: (newUrl: string) => void;
  showExpandButton?: boolean;
}

export const ExerciseMedia: React.FC<ExerciseMediaProps> = ({
  gifUrl,
  name,
  muscleGroup,
  instructions,
  className = '',
  onUpdateGifUrl,
  showExpandButton = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState(gifUrl);

  const muscleMeta = MUSCLE_GROUP_LABELS[muscleGroup] || MUSCLE_GROUP_LABELS.geral;

  const handleSaveUrl = () => {
    if (onUpdateGifUrl && customUrl.trim()) {
      onUpdateGifUrl(customUrl.trim());
      setHasError(false);
      setIsLoading(true);
      setIsEditingUrl(false);
    }
  };

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 group ${className}`}>
        {/* Loading skeleton */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 z-10">
            <Dumbbell className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Carregando execução...</span>
          </div>
        )}

        {/* Fallback Graphic if image fails or no URL */}
        {(!gifUrl || hasError) ? (
          <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-center select-none">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/10">
              <Dumbbell className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <span className="text-sm font-bold text-slate-200">{name}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 border ${muscleMeta.badgeBg}`}>
              {muscleMeta.label}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingUrl(true)}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Adicionar / Trocar GIF
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={gifUrl}
              alt={`Execução de ${name}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Tag */}
            <div className="absolute top-2 left-2 z-20">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border ${muscleMeta.badgeBg}`}>
                {muscleMeta.label}
              </span>
            </div>

            {/* Action overlay buttons */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 z-20">
              {onUpdateGifUrl && (
                <button
                  type="button"
                  title="Trocar URL do GIF"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingUrl(true);
                  }}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              )}
              {showExpandButton && (
                <button
                  type="button"
                  title="Expandir visualização"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-black font-bold backdrop-blur-md transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit GIF URL Modal */}
      {isEditingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                Personalizar GIF de Execução
              </h4>
              <button
                onClick={() => setIsEditingUrl(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Cole o link direto de qualquer GIF ou imagem da internet (Giphy, Tenor, Imgur, etc.) para demonstrar o exercício <strong>{name}</strong>:
            </p>

            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://.../exercicio.gif"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mb-4"
            />

            {customUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center">
                <img
                  src={customUrl}
                  alt="Prévia do GIF"
                  className="max-h-48 object-contain"
                  onError={() => alert('URL da imagem inválida ou bloqueada pelo site de origem.')}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Salvar GIF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded GIF & Instructions Lightbox */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">{name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${muscleMeta.badgeBg}`}>
                  {muscleMeta.label}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[380px] overflow-hidden">
              <img
                src={gifUrl}
                alt={name}
                className="w-full h-full max-h-[380px] object-contain"
              />
            </div>

            {instructions && (
              <div className="p-4 bg-slate-950/70 border-t border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Instruções e Dicas de Execução:
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
