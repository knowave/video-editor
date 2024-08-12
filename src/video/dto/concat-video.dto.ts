import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray } from 'class-validator';

export class ConcatVideoDto {
  @ApiProperty({
    description: 'The IDs of the videos to concatenate',
    example: [
      'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
      'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  videoIds: string[];
}
