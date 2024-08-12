import { ApiProperty } from '@nestjs/swagger';

export class Concat {
  @ApiProperty({
    description: 'The ID of the concatenated video',
    example: 'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
  })
  id: string;

  @ApiProperty({
    description: 'The IDs of the videos to concatenate',
    example: [
      'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
      'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
    ],
  })
  videoIds: string[];
}
