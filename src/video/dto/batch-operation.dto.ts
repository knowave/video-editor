import { IsEnum, IsNotEmpty } from 'class-validator';
import { OperationType } from '../enums/operation-type.enum';
import { TrimVideoDto } from './trim-video.dto';
import { ConcatVideoDto } from './concat-video.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BatchOperationDto {
  @ApiProperty({
    description: 'The type of operation to perform',
    example: OperationType.TRIM,
  })
  @IsNotEmpty()
  @IsEnum(OperationType)
  type: OperationType;

  @ApiProperty({
    description: 'The parameters for the operation',
    example: TrimVideoDto,
  })
  trim?: TrimVideoDto;

  @ApiProperty({
    description: 'The parameters for the operation',
    example: ConcatVideoDto,
  })
  concat?: ConcatVideoDto;
}
