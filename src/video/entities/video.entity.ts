import { ApiProperty } from '@nestjs/swagger';
import { Concat } from './concat.entity';
import { Trim } from './trim.entity';

export class Video {
  @ApiProperty({
    description: 'The ID of the video',
    example: 'b3b3b3b3-b3b3-b3b3b3b3b3b3b3b3',
  })
  id: string;

  @ApiProperty({
    description: 'The original name of the video',
    example: 'video.mp4',
  })
  originalName: string;

  @ApiProperty({
    description: 'The path to the video',
    example: './uploads/video.mp4',
  })
  path: string;

  @ApiProperty({
    description: 'The MIME type of the video',
    example: 'video/mp4',
  })
  mimeType: string;

  @ApiProperty({
    description: 'The size of the video in bytes',
    example: 1000000,
  })
  size: number;

  @ApiProperty({
    description: 'The date the video was uploaded',
    example: new Date(),
  })
  uploadDate: Date;

  @ApiProperty({
    description: 'The trims applied to the video',
    example: [Trim],
  })
  trims: Trim[];

  @ApiProperty({
    description: 'The concatenation applied to the video',
    example: Concat,
  })
  concat: Concat;
}
