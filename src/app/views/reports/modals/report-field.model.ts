// report-field.model.ts
export interface ReportField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  default?: any;
  options?: any[];
  validators?: string[];
}
