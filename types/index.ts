export type QuoteType = {
  id: string;
  content: string;
};

export interface QuoteFuncParams {
  quote: QuoteType;
  index: number;
  deleteFunction: (param1: QuoteType, param2: string) => void;
  col: string;
}
export interface QuoteListParams {
  quotes: QuoteType[];
  deleteFunction: (param1: QuoteType, param2: string) => void;
  col: string;
}
