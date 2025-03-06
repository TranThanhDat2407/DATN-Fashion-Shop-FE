export class PromotionDTO {
  id: number;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  constructor(data?: Partial<PromotionDTO>) {
    this.id = data?.id || 0;
    this.description = data?.description || '';
    this.startDate = data?.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data?.endDate ? new Date(data.endDate) : new Date();
    this.isActive = data?.isActive ?? false;
  }
}
