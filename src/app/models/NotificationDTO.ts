export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  type: string;
  imageUrl: string;
  redirectUrl: string;
  isRead: boolean;
}
