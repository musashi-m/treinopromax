import React, { useState } from 'react';
import { X, Check, Edit3, Image as ImageIcon } from 'lucide-react';
import type { BaseExercise, MuscleGroup } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary';

interface EditCatalogExerciseModalProps {
  exercise: BaseExercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BaseExercise) => void;
}

export const EditCatalogExerciseModal: React.FC<EditCatalogExerciseModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !exercise) return null;

  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(exercise.muscleGroup);
  const [equipment, setEquipment] = useState(exercise.equipment || '');
  const [gifUrl, setGifUrl] = useState(exercise.gifUrl || '');
  const [instructions, setInstructions] = useState(exercise.instructions || '');
  const [defaultSets, setDefaultSets] = useState(exercise.defaultSets || 3);
  const [defaultReps, setDefaultReps] = useState(exercise.defaultReps || '10');
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(exercise.defaultRestSeconds || 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: BaseExercise = {
      ...exercise,
      name: name.trim(),
      muscleGroup,
      equipment: equipment.trim() || 'Equipamento Geral',
      gifUrl: gifUrl.trim() || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      instructions: instructions.trim(),
      defaultSets: Number(defaultSets) || 3,
      defaultReps: defaultReps.trim() || '10',
      defaultRestSeconds: Number(defaultRestSeconds) || 60,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Editar Exercício do Catálogo</h3>
              <p className="text-xs text-slate-400">{exercise.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nome e Grupo Muscular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nome do Exercício *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Grupo Muscular *
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              >
                {Object.entries(MUSCLE_GROUP_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipamento */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Equipamento / Aparelho
            </label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Ex: Barra Olímpica, Halteres, Polia, Máquina..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Foto / Link do GIF */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-sky-400" /> Foto / GIF de Execução (URL direta)
            </label>
            <input
              type="url"
              value={gifUrl}
              onChange={(e) => setGifUrl(e.target.value)}
              placeholder="https://.../execucao.gif"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
            {gifUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center">
                <img
                  src={gifUrl}
                  alt="Prévia"
                  className="h-full w-full object-contain"
                  onError={() => console.warn('Erro ao carregar prévia')}
                />
              </div>
            )}
          </div>

          {/* Séries, Reps e Descanso */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Séries Padrão
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={defaultSets}
                onChange={(e) => setDefaultSets(parseInt(e.target.value, 10) || 3)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Reps Padrão
              </label>
              <input
                type="text"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
                placeholder="8-12"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Descanso (seg)
              </label>
              <input
                type="number"
                step="5"
                min="15"
                max="300"
                value={defaultRestSeconds}
                onChange={(e) => setDefaultRestSeconds(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>
          </div>

          {/* Descrição / Instruções */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição / Como Realizar a Execução
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Descreva a postura, trajetória do movimento, respiração e dicas..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
            >
              <Check className="w-4 h-4" /> Salvar Exercício
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
