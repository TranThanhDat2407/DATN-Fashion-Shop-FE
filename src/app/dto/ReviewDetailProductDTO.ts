import { BaseEntity } from "../models/BaseEntity";

export interface ReviewDetailProductDTO extends BaseEntity {
     
    id: number;
    title: string;
    comment: string;
    purchasedSize: string;
    fit: string;
    nickname: string;
    gender: string;
    ageGroup: string;
    height: number;
    weight: number;
    reviewRate: number;
    location: string;
    shoeSize: number;
    productId: number;
     
  }
  
