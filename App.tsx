import React, { useState, useCallback, useMemo } from 'react';
import { generateTitleVariations, detectNicheFromTitles } from './services/geminiService';
import { TitleInput } from './components/TitleInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import type { VariationMode } from './types';

interface Result {
  originalTitle: string;
  variations: string[];
  isLoading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const [titlesInput, setTitlesInput] = useState<string>('');
  const [results, setResults] = useState<Result[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Calcula a quantidade de títulos não vazios
  const titlesList = useMemo(() => {
    return titlesInput.split('\n').map(t => t.trim()).filter(t => t !== '');
  }, [titlesInput]);

  const handleGenerate = useCallback(async (mode: VariationMode, options?: { manualNiche?: string; targetNiche?: string }) => {
    if (titlesList.length === 0) {
      setError('Por favor, insira pelo menos um título para analisar.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setHasGenerated(true);

    let contextNiche: string | undefined = undefined;

    // Lógica preliminar para o modo 'same_niche'
    if (mode === 'same_niche') {
      if (options?.manualNiche && options.manualNiche.trim() !== '') {
         contextNiche = options.manualNiche.trim();
      } else {
         try {
           // Usa a lista completa para detectar o nicho globalmente
           contextNiche = await detectNicheFromTitles(titlesList);
         } catch (err) {
           console.warn('Não foi possível identificar o nicho automaticamente.', err);
         }
      }
    }

    // Inicializa o estado visual com "loading" para todos os títulos
    const initialResults: Result[] = titlesList.map(originalTitle => ({
      originalTitle,
      variations: [],
      isLoading: true,
      error: null,
    }));
    setResults(initialResults);

    // Função auxiliar para dividir o array em pedaços (chunks)
    const chunkArray = <T,>(array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // Divide os títulos em lotes de 10
    const BATCH_SIZE = 10;
    const titleChunks = chunkArray(titlesList, BATCH_SIZE);

    // Processa um lote de títulos
    const processBatch = async (batchTitles: string[]) => {
      try {
        // Envia o array de títulos para a API de uma vez só
        const batchResults = await generateTitleVariations(batchTitles, mode, contextNiche, options?.targetNiche);

        // Atualiza o estado com os resultados recebidos
        setResults(prevResults => {
          const newResults = [...prevResults];
          
          batchResults.forEach(result => {
             const index = newResults.findIndex(r => r.originalTitle === result.originalTitle);
             if (index !== -1) {
               newResults[index] = {
                 ...newResults[index],
                 variations: result.variations,
                 isLoading: false,
                 error: null
               };
             }
          });

          // Caso algum título do lote não tenha retornado na resposta da API (erro parcial), marcamos como erro
          batchTitles.forEach(title => {
             const returned = batchResults.find(r => r.originalTitle === title);
             const index = newResults.findIndex(r => r.originalTitle === title);
             
             if (!returned && index !== -1) {
                newResults[index] = {
                  ...newResults[index],
                  isLoading: false,
                  error: 'Falha ao processar este título específico no lote.'
                };
             }
          });

          return newResults;
        });

      } catch (err) {
        console.error(`Error processing batch:`, err);
        // Em caso de erro total do lote
        setResults(prevResults => 
          prevResults.map(r => 
            batchTitles.includes(r.originalTitle) 
              ? { ...r, error: 'Falha ao gerar variações.', isLoading: false }
              : r
          )
        );
      }
    };

    // Dispara as requisições dos lotes em paralelo
    const promises = titleChunks.map(chunk => processBatch(chunk));

    await Promise.allSettled(promises);
    setIsProcessing(false);

  }, [titlesList]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Gerador de Títulos Estratégicos
            </h1>
          </div>
          <p className="text-md sm:text-lg text-gray-400 max-w-2xl">
            Insira seus títulos e configure as opções para gerar variações personalizadas.
          </p>
        </header>

        <div className="w-full bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 shadow-lg mb-8">
           <TitleInput
              value={titlesInput}
              onChange={(e) => setTitlesInput(e.target.value)}
              onSubmit={handleGenerate}
              isLoading={isProcessing}
            />
        </div>
       
        {error && (
          <div className="mb-8 text-center bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg w-full">
            <p>{error}</p>
          </div>
        )}

        <div className="w-full">
          {hasGenerated && results.length > 0 ? (
             <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index}>
                  {result.isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700 animate-pulse">
                      <LoadingSpinner />
                      <p className="mt-4 text-lg text-gray-400">
                        Criando variações para: <span className="font-semibold text-gray-300">"{result.originalTitle}"</span>
                      </p>
                    </div>
                  ) : result.error ? (
                    <div className="bg-red-900/50 text-red-300 border border-red-700 p-6 rounded-lg w-full">
                      <p className="font-semibold text-lg">Erro ao processar "{result.originalTitle}"</p>
                      <p className="mt-1 text-red-400">{result.error}</p>
                    </div>
                  ) : (
                    <ResultsDisplay originalTitle={result.originalTitle} titles={result.variations} />
                  )}
                </div>
              ))}
            </div>
          ) : !hasGenerated ? (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg border border-gray-700/50 border-dashed">
                <p className="text-gray-500">As variações geradas aparecerão aqui.</p>
            </div>
          ) : null }
        </div>

      </main>
        <footer className="w-full max-w-4xl mx-auto mt-12 text-center text-gray-600 text-sm pb-4">
            <p>Sistema inteligente de criação de títulos estratégicos.</p>
        </footer>
    </div>
  );
};

export default App;