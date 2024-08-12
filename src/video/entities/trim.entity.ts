import { ApiProperty } from '@nestjs/swagger';

export class Trim {
  @ApiProperty({
    description: 'The ID of the trimmed video',
    example: 'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the video that was trimmed',
    example: 'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
  })
  videoId: string;

  @ApiProperty({
    description: 'The start time of the trimmed video',
    example: '00:00:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'The end time of the trimmed video',
    example: '00:00:10',
  })
  endTime: string;
}
