import {CategoryTranslation} from './CategoriesTranslation';

export interface Category {
  id: number;
  imageUrl: string;
  isActive: boolean;
  parentCategory: Category | null;
  translations: CategoryTranslation[];
  subCategories: Category[];

  getTranslationByLanguage(languageCode: string): string | null;
  getAllSubCategories(): Category[];
}

export class CategoryImpl implements Category {
  id: number;
  imageUrl: string;
  isActive: boolean;
  parentCategory: Category | null;
  translations: CategoryTranslation[];
  subCategories: Category[];

  constructor(data?: Partial<Category>) {
    this.id = data?.id || 0;
    this.imageUrl = data?.imageUrl || '';
    this.isActive = data?.isActive ?? true;
    this.parentCategory = data?.parentCategory ? new CategoryImpl(data.parentCategory) : null;
    this.translations = data?.translations || [];
    this.subCategories = data?.subCategories?.map(sub => new CategoryImpl(sub)) || [];
  }

  getTranslationByLanguage(languageCode: string): string | null {
    const translation = this.translations.find(
      (t) => t.language.code === languageCode
    );
    return translation ? translation.name : null;
  }

  getAllSubCategories(): Category[] {
    const subCategories: Category[] = [];
    const collectSubCategories = (category: Category) => {
      subCategories.push(category);
      category.subCategories.forEach(collectSubCategories);
    };
    this.subCategories.forEach(collectSubCategories);
    return subCategories;
  }
}

