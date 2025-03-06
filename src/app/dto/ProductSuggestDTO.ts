import {CategoryParentDTO} from './CategoryParentDTO';

export class ProductSuggestDTO  {
  id: number | undefined;
  name: string | undefined;
  imageUrl?: string;
  categoryParent?: CategoryParentDTO[]; // Thêm vào đây
}
