import { BaseEntity} from '../BaseEntity';
import { AttributeValue} from './AttributeValue';

export class Attribute extends BaseEntity {
  id: number;
  name: string;
  attributeValues: AttributeValue[];

  constructor(data?: Partial<Attribute>) {
    super(data);
    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.attributeValues = data?.attributeValues?.map(av => new AttributeValue(av)) || [];
  }
}
