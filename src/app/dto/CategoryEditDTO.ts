import { TranslationDTO } from "./CategoryAdminDTO";

export interface CategoryEditDTO {
    id: number;
    imageUrl: string;
    parentId: number;
    isActive: boolean;
    translations: TranslationDTO[];
  }