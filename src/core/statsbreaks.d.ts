declare module 'statsbreaks' {
  export function breaks(
    data: number[],
    options?: {
      method?: string;
      nb?: number;
      precision?: number;
      minmax?: boolean;
      k?: number;
      middle?: boolean;
    }
  ): number[];
}
