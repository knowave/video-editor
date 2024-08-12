import { IsEnum, IsNotEmpty } from 'class-validator';
import { OperationType } from '../enums/operation-type.enum';
import { TrimVideoDto } from './trim-video.dto';
import { ConcatVideoDto } from './concat-video.dto';

export class BatchOperationDto {
  @IsNotEmpty()
  @IsEnum(OperationType)
  type: OperationType;

  trim?: TrimVideoDto;

  concat?: ConcatVideoDto;
}
