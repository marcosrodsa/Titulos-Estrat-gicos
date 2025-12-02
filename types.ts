
export interface TitleAnalysis {
  structure: {
    block: string;
    objective: string;
  }[];
  elements: string[];
}

export interface TitleVariations {
  variations: string[];
}

export type VariationMode = 'synonyms' | 'same_niche' | 'different_niches';
