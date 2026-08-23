import marketInsightRaw from '../prompts/market-insight.md?raw';

/**
 * Substitui placeholders no formato {{chave}} pelos valores fornecidos no objeto de variáveis.
 */
export function interpolatePrompt(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return key in variables ? String(variables[key]) : `{{${key}}}`;
  });
}

export interface MarketInsightVariables {
  price: number;
  change24h: number;
}

/**
 * Retorna o prompt formatado para a geração de insight de mercado do Bitcoin.
 */
export function getMarketInsightPrompt(variables: MarketInsightVariables): string {
  return interpolatePrompt(marketInsightRaw, {
    price: variables.price.toLocaleString(),
    change24h: variables.change24h.toFixed(2),
  });
}
