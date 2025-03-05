import { BaseEntity} from '../BaseEntity';
import { AttributeValue} from './AttributeValue';

export class AttributeValuePattern extends BaseEntity {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  attributeValues: AttributeValue[];

  constructor(data?: Partial<AttributeValuePattern>) {
    super(data);
    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.type = data?.type || '';
    this.isActive = data?.isActive ?? true;
    this.attributeValues = data?.attributeValues?.map(av => new AttributeValue(av)) || [];
  }
}
