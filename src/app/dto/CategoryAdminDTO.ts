export interface TranslationDTO {
  languageCode: string;
  name: string;
}

export interface CategoryAdminDTO {
  parentId: number;
  translations: TranslationDTO[];
}
