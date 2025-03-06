import { BaseEntity } from "../BaseEntity";

export interface CategoryAdmin extends BaseEntity{
    id : number,
    name : string,
    imageUrl :  string,
    isActive : boolean,
    parentId : number,
    parentName : string,

}