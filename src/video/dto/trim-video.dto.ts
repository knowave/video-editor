import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrimVideoDto {
  @ApiProperty({
    description: 'The ID of the video to trim',
    example: 'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3b3',
  })
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @ApiProperty({
    description: 'The start time of the trimmed video',
    example: '00:00:00',
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'The end time of the trimmed video',
    example: '00:00:10',
  })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}
