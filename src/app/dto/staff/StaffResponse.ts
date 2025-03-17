import { CartItemDTO } from "./CartItemDTO"

export interface CartDTO {
    id : number
    userId: number
    sessionId : string
    cartItems : CartItemDTO[]
    totalPrice :number
}