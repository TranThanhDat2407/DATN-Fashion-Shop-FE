export interface Language {
  id:number;
  code: string;
  name: string;
}
export class LanguageImpl implements Language {
  id: number;
  code: string;
  name: string;

  constructor(data?: Partial<Language>) {
    this.id = data?.id || 0;
    this.code = data?.code || '';
    this.name = data?.name || '';
  }
}
