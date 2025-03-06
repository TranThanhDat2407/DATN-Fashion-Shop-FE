import {OrderDetail} from './OrderDetail';

export interface OrderDetailResponse {
  timestamp: string;
  status: number;
  message: string;
  data: OrderDetail[];
  errors: any;
}
