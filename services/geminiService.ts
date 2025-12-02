import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { VariationMode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Lista de prioridade otimizada para VELOCIDADE (Flash primeiro)
const MODEL_PRIORITY_LIST = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-3-pro-preview',
  'gemini-2.5-pro',
  'gemini-1.5-flash'
];

/**
 * Tenta gerar conteúdo rotacionando modelos em caso de falha ou rate limit.
 */
async function generateWithFallback(
  contents: any, 
  config: any = {}, 
  taskName: string
): Promise<GenerateContentResponse> {
  let lastError: any = null;

  for (const model of MODEL_PRIORITY_LIST) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: config
      });
      return response;
    } catch (error: any) {
      console.warn(`Falha no modelo ${model} para ${taskName}:`, error.message);
      lastError = error;
      // Continua para o próximo modelo na lista
      continue;
    }
  }

  throw lastError || new Error(`Todas as tentativas de modelo falharam para a tarefa: ${taskName}`);
}

const getVariationInstruction = (mode: VariationMode, contextNiche?: string, targetNiche?: string): string => {
  const langInstruction = "IMPORTANTE: TODAS AS VARIAÇÕES DEVEM ESTAR OBRIGATORIAMENTE EM PORTUGUÊS DO BRASIL (PT-BR).";

  switch (mode) {
    case 'different_niches':
      if (targetNiche && targetNiche.trim() !== '') {
        return `Mantenha a estrutura estratégica original (gatilhos mentais e formato), mas substitua os elementos do assunto para adaptar o título especificamente para o nicho de "${targetNiche}". Use termos, dores e desejos comuns a esse público alvo. ${langInstruction}`;
      }
      return `Mantenha a estrutura estratégica original (gatilhos mentais e formato), mas substitua os "elementos" (assunto específico) por alternativas de NICHOS E SUBNICHOS COMPLETAMENTE DIFERENTES e variados (ex: se for culinária, gere sobre finanças, fitness, negócios, etc). ${langInstruction}`;
    
    case 'same_niche':
      const nichePrompt = contextNiche 
        ? `O nicho principal definido é: "${contextNiche}". É OBRIGATÓRIO que estas palavras (ou o conceito central delas) apareçam nas variações.` 
        : 'Mantenha o foco estrito no mesmo nicho do título original.';
      
      return `Mantenha a estrutura estratégica original. ${nichePrompt} Mantenha o tema central, mas substitua os elementos complementares por outros CONTEXTOS, CENÁRIOS, SITUAÇÕES DO DIA A DIA ou problemas específicos dentro deste mesmo nicho. O objetivo é explorar diferentes ângulos para o mesmo público. ${langInstruction}`;
    
    case 'synonyms':
      return `Mantenha a estrutura estratégica original e EXATAMENTE OS MESMOS ELEMENTOS/CONCEITOS. NÃO mude o assunto nem o subnicho. Apenas altere as palavras usadas para se referir a eles (use sinônimos, termos relacionados, ou reescrita criativa da mesma ideia). O objetivo é apenas mudar a forma de falar a mesma coisa (copywriting/refinamento), mas mantendo o mesmo impacto emocional. ${langInstruction}`;
    
    default:
      return langInstruction;
  }
};

export async function detectNicheFromTitles(titles: string[]): Promise<string> {
  // Pega uma amostra de até 20 títulos para não sobrecarregar o prompt de detecção
  const sampleTitles = titles.slice(0, 20);
  
  const prompt = `
    Analise a lista de títulos abaixo e identifique o "Nicho Central" (o assunto principal) que se repete neles.

    Títulos para análise:
    ${sampleTitles.join('\n')}

    Sua tarefa é extrair apenas 2 palavras-chave que representam o nicho principal.

    REGRAS DE EXCLUSÃO (Tipos de palavras que você DEVE IGNORAR):
    1. Artigos, Preposições e Conectivos (ex: o, a, de, para, com, em, no, do, por...);
    2. Verbos Genéricos e de Ação (ex: fazer, criar, ser, estar, ter, aprender...);
    3. Palavras de Formato de Conteúdo (ex: guia, tutorial, passo, dicas, curso, aula, definitivo, completo, simples...);
    4. Adjetivos Genéricos (ex: melhor, rápido, incrível, fácil...).

    Foque apenas nos SUBSTANTIVOS que definem o TEMA DO MERCADO (ex: "Marketing Digital", "Perda Peso", "Investimento Bolsa", "Adestramento Cães").

    Responda APENAS com as duas palavras separadas por espaço. Nada mais.
  `;

  const response = await generateWithFallback(
    prompt,
    {},
    'Detecção de Nicho'
  );

  return response.text ? response.text.trim() : "";
}

/**
 * Interface para retorno do serviço em lote
 */
export interface BatchResult {
  originalTitle: string;
  variations: string[];
}

/**
 * Função unificada que analisa e gera variações para MÚLTIPLOS títulos em uma única chamada.
 * Aceita até 10 títulos por vez para máxima performance.
 */
export async function generateTitleVariations(titles: string[], mode: VariationMode, contextNiche?: string, targetNiche?: string): Promise<BatchResult[]> {
  const modeInstruction = getVariationInstruction(mode, contextNiche, targetNiche);
  
  // Lista formatada para o prompt
  const titlesListString = titles.map((t, i) => `ID ${i}: ${t}`).join('\n');

  const unifiedPrompt = `
    Atue como um especialista em Copywriting e Marketing Viral.
    
    Você receberá uma lista de títulos originais. Para CADA título da lista, sua tarefa é:
    1. Analisar mentalmente a estrutura sintática e os gatilhos mentais.
    2. Gerar 3 novas variações seguindo rigorosamente as INSTRUÇÕES DE MODO.

    INSTRUÇÕES DE MODO (${mode}):
    ${modeInstruction}

    LISTA DE TÍTULOS:
    ${titlesListString}

    SAÍDA:
    Retorne um objeto JSON contendo um array "results". 
    Cada item do array deve conter o "originalTitle" (exatamente como enviado) e as "variations".
  `;

  const response = await generateWithFallback(
    unifiedPrompt,
    {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalTitle: {
                  type: Type.STRING,
                  description: "O título original correspondente, exatamente como recebido na lista."
                },
                variations: {
                  type: Type.ARRAY,
                  description: "Lista com exatamente 3 variações geradas.",
                  items: { type: Type.STRING }
                }
              },
              required: ["originalTitle", "variations"]
            }
          }
        },
        required: ["results"]
      }
    },
    'Geração em Lote Otimizada'
  );

  try {
    const jsonString = response.text || "{}";
    const parsedResponse = JSON.parse(jsonString);
    
    // Validação básica para garantir que retornou array
    if (parsedResponse.results && Array.isArray(parsedResponse.results)) {
        return parsedResponse.results;
    }
    return [];

  } catch (error) {
    console.error("Failed to parse variations JSON:", response.text);
    throw new Error("Could not parse the title variations from AI response.");
  }
}