export type BuilderTableCellFn = (row: any, value: any) => string | number | null | undefined;

export interface BuilderTableColumn {
  /** field key on row */
  key: string;
  title: string;
  width?: string;
  /** custom display; if omitted, shows row[key] */
  format?: BuilderTableCellFn;
  align?: 'left' | 'right' | 'center';
}

export interface BuilderTablePageEvent {
  pageIndex: number;
  pageSize: number;
}
