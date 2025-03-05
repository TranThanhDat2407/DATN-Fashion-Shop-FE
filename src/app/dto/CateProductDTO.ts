import { CategoryParentDTO } from "./CategoryParentDTO";

export interface CateProductDTO{
    productId: number,
    cateParent : CategoryParentDTO[]
}