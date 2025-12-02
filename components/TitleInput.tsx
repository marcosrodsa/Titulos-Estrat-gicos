import React, { useState } from 'react';
import type { VariationMode } from '../types';

interface TitleInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (mode: VariationMode, options?: { manualNiche?: string; targetNiche?: string }) => void;
  isLoading: boolean;
}

export const TitleInput: React.FC<TitleInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const [activeMode, setActiveMode] = useState<VariationMode | null>(null);
  const [manualNiche, setManualNiche] = useState('');
  const [targetNiche, setTargetNiche] = useState('');
  
  // Calcula quantidade apenas para info visual
  const titleCount = value.split('\n').filter(t => t.trim() !== '').length;

  const handleModeSelect = (mode: VariationMode) => {
    if (mode === 'synonyms') {
      onSubmit(mode);
    } else {
      setActiveMode(mode);
    }
  };

  const handleConfirmGeneration = () => {
    if (activeMode) {
      onSubmit(activeMode, { manualNiche, targetNiche });
      setActiveMode(null); // Reseta após enviar
    }
  };

  const handleCancel = () => {
    setActiveMode(null);
    setManualNiche('');
    setTargetNiche('');
  };

  // Validação: Obrigatório apenas para 'same_niche'
  const isSubmitDisabled = activeMode === 'same_niche' && manualNiche.trim().length === 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative">
        <textarea
            value={value}
            onChange={onChange}
            placeholder="Coloque um título por linha. Ex:
Como Fazer o Melhor Café em 5 Passos Simples
Guia Definitivo de Jardinagem para Iniciantes"
            disabled={isLoading}
            rows={6}
            className="w-full bg-gray-800/80 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-md py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:opacity-50 resize-y"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none bg-gray-900/80 px-2 rounded">
            {titleCount} títulos
        </div>
      </div>
      
      {/* Área de Ações */}
      <div className="mt-2">
        {isLoading ? (
             <div className="flex items-center justify-center text-indigo-400 py-4 px-4 bg-gray-800 rounded-md border border-gray-700 w-full">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processando...</span>
             </div>
        ) : !activeMode ? (
            /* Botões Iniciais */
            <div className="flex flex-col md:flex-row gap-3 justify-between">
                <button
                    onClick={() => handleModeSelect('synonyms')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-teal-600 text-sm font-medium rounded-md text-teal-100 bg-teal-900/30 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition duration-200"
                    title="Mantém o contexto exato, muda apenas as palavras"
                >
                    Apenas Sinônimos
                </button>

                <button
                    onClick={() => handleModeSelect('same_niche')}
                    className="flex-1 w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                >
                    Mesmo Nicho
                </button>

                <button
                    onClick={() => handleModeSelect('different_niches')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-purple-600 text-sm font-medium rounded-md text-purple-100 bg-purple-900/30 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition duration-200"
                    title="Gera variações para outros mercados"
                >
                    Nichos Diferentes
                </button>
            </div>
        ) : (
            /* Área de Configuração Específica */
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {activeMode === 'same_niche' && (
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="text-sm text-indigo-300 font-semibold">
                            Palavras-chave do Nicho (Obrigatório)
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Insira as palavras principais que definem o nicho.
                        </p>
                        <input 
                            type="text"
                            value={manualNiche}
                            onChange={(e) => setManualNiche(e.target.value)}
                            placeholder="Ex: Marketing Digital"
                            autoFocus
                            className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded px-4 py-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                )}

                {activeMode === 'different_niches' && (
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="text-sm text-purple-300 font-semibold">
                            Nicho Alvo (Opcional)
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Para qual nicho você quer adaptar esses títulos? Se vazio, será aleatório.
                        </p>
                        <input 
                            type="text"
                            value={targetNiche}
                            onChange={(e) => setTargetNiche(e.target.value)}
                            placeholder="Ex: Culinária, Finanças, Fitness"
                            autoFocus
                            className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded px-4 py-3 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-gray-700/50 mt-2">
                     <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={handleConfirmGeneration}
                        disabled={isSubmitDisabled}
                        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md text-white transition-all shadow-lg ${
                            activeMode === 'different_niches' 
                            ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                        } ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        Gerar Variações {activeMode === 'same_niche' ? 'do Mesmo Nicho' : 'de Nichos Diferentes'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};