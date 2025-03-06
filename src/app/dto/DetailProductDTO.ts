import { Promotion } from "../models/Product/Promotion";
import { BaseResponse } from "./Response/base-response";


export interface DetailProductDTO extends BaseResponse{
  id: number;
  name: string;
  description: string;
  material: string;
  care: string;
  basePrice: number;
  promotion?: Promotion;
  isActive: boolean;
 
}
