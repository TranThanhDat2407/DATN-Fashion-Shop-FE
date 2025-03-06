import { BaseEntity } from "../models/BaseEntity";

export interface DetailMediaDTO extends BaseEntity{
    id: number;
    basePrice: number;
    salePrice: number;
    colorId: number;
    colorName: string;
    sizeId:number;
    size: string;
    productName: string;
    productId: number;
}
