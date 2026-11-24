import React, { useState } from 'react';
import { 
  Dumbbell, Calendar, BookOpen, Trophy, History, Download, 
  Upload, RotateCcw, Flame, Shield, X, LogOut, Fingerprint 
} from 'lucide-react';
import type { ViewTab } from '../types/workout';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isWorkoutActive: boolean;
  user: { email: string; id?: string } | null;
  onLogout: () => void;
  onRegisterBiometrics?: () => void;
  onExportData: () => void;
  onImportData: (jsonString: string) => boolean;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isWorkoutActive,
  user,
  onLogout,
  onRegisterBiometrics,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = onImportData(importText.trim());
    if (success) {
      setImportStatus('Dados restaurados com sucesso!');
      setTimeout(() => {
        setImportStatus(null);
        setIsBackupModalOpen(false);
        setImportText('');
      }, 1500);
    } else {
      setImportStatus('Erro: Arquivo JSON inválido.');
    }
  };

  const navItems = [
    { id: 'semana' as ViewTab, label: 'Rotina Semanal', mobileLabel: 'Rotina', icon: Calendar },
    { id: 'exercicios' as ViewTab, label: 'Catálogo & GIFs', mobileLabel: 'Catálogo', icon: BookOpen },
    { id: 'prs' as ViewTab, label: 'Recordes (PRs)', mobileLabel: 'PRs', icon: Trophy },
    { id: 'historico' as ViewTab, label: 'Histórico & Calendário', mobileLabel: 'Histórico', icon: History },
  ];

  return (
    <>
      {/* Top Main Navbar */}
      <nav className="bg-[#0f1420] border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('semana')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">Iron<span className="text-emerald-400">Routine</span></span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Gestor & Modo Treino</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: User Status, Biometrics & Actions */}
          <div className="flex items-center gap-2">
            {isWorkoutActive && (
              <button
                type="button"
                onClick={() => onSelectTab('treino_ativo')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40 flex items-center gap-1.5 animate-pulse"
              >
                <Flame className="w-4 h-4 fill-emerald-400" />
                <span className="hidden sm:inline">Treino Ativo</span>
              </button>
            )}

            {/* User profile & Supabase cloud sync badge */}
            {user && (
              <>
                {/* Mobile compact biometrics button */}
                {onRegisterBiometrics && (
                  <button
                    type="button"
                    onClick={onRegisterBiometrics}
                    className="sm:hidden p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                    title="Cadastrar Biometria (Passkey)"
                  >
                    <Fingerprint className="w-4 h-4" />
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Conectado ao Supabase" />
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[130px]">{user.email}</span>
                  {onRegisterBiometrics && (
                    <button
                      type="button"
                      onClick={onRegisterBiometrics}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors ml-0.5"
                      title="Cadastrar / Atualizar Chave de Acesso Biométrica"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="p-2.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Backup / Dados"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Logout button */}
            {user && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Android safe-area aware) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1420]/95 border-t border-slate-800/90 backdrop-blur-lg px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-xl min-h-[50px] transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 font-black'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
                <span className="text-[11px] tracking-tight leading-none">{item.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backup & Data Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Backup e Dados Locais
              </h3>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              Todos os seus treinos, personalizações de séries, GIFs e PRs ficam sincronizados com o Supabase e com o armazenamento do navegador.
            </p>

            {/* Export and Reset actions */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">Exportar Dados (Backup JSON)</h5>
                  <p className="text-[11px] text-slate-500">Baixe um arquivo de backup para guardar ou transferir</p>
                </div>
                <button
                  type="button"
                  onClick={onExportData}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" /> Baixar
                </button>
              </div>

              {/* Import JSON Form */}
              <form onSubmit={handleImportSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Restaurar / Importar Backup</h5>
                  <textarea
                    rows={3}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Cole aqui o conteúdo JSON do seu backup..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:border-emerald-500"
                  />
                </div>

                {importStatus && (
                  <p className={`text-xs font-bold ${importStatus.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {importStatus}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" /> Restaurar Backup
                  </button>
                </div>
              </form>

              {/* Reset to Factory Default */}
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-red-300">Restaurar Padrões de Fábrica</h5>
                  <p className="text-[11px] text-slate-500">Volta à rotina inicial sugerida e limpa dados</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Atenção: Isso irá redefinir todos os treinos para os padrões iniciais. Deseja prosseguir?')) {
                      onResetData();
                      setIsBackupModalOpen(false);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold border border-red-500/40"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Resetar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
