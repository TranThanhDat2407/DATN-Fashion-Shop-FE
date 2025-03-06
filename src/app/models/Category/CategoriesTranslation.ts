import {Category} from './Category';
import {Language} from '../Language';

export interface CategoryTranslation {
  id: number;
  name: string;
  category: Category;
  language: Language;
}
