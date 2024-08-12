import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { OperationType } from '../enums/operation-type.enum';

export class BatchOperationDto {
  @IsNotEmpty()
  @IsEnum(OperationType)
  type: OperationType;

  @IsNotEmpty()
  @IsArray()
  data: any[];
}
