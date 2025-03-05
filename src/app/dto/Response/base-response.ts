export class BaseResponse {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;

  constructor(data?: Partial<BaseResponse>) {
    this.createdAt = data?.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data?.updatedAt ? new Date(data.updatedAt) : new Date();
    this.createdBy = data?.createdBy ?? undefined;
    this.updatedBy = data?.updatedBy ?? undefined;
  }
}
