import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { VideoService } from './video.service';
import { TrimVideoDto } from './dto/trim-video.dto';
import { ConcatVideoDto } from './dto/concat-video.dto';
import { Response } from 'express';
import { BatchOperationDto } from './dto/batch-operation.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Video } from './entities/video.entity';
import { Trim } from './entities/trim.entity';
import { Concat } from './entities/concat.entity';

@ApiTags('videos')
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload Video Files' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadVideos(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) =>
      this.videoService.uploadVideo(file),
    );
    return await Promise.all(uploadPromises);
  }

  @Post('trim')
  @ApiOperation({ summary: 'Trim a Video' })
  @ApiBody({ type: TrimVideoDto })
  @ApiResponse({ status: 201, description: 'Video trimmed successfully.' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async trimVideo(@Body() trimVideoDto: TrimVideoDto) {
    return await this.videoService.trimVideo(trimVideoDto);
  }

  @Post('concat')
  @ApiOperation({ summary: 'Concatenate Videos' })
  @ApiBody({ type: ConcatVideoDto })
  @ApiResponse({
    status: 201,
    description: 'Videos concatenated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid video ids.' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async concatVideos(@Body() concatVideoDto: ConcatVideoDto) {
    return await this.videoService.concatVideos(concatVideoDto);
  }

  @Post('batch-operation')
  @ApiOperation({ summary: 'Perform batch operations on videos' })
  @ApiBody({ type: BatchOperationDto })
  @ApiResponse({ status: 201, description: 'Batch operation successful)' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  @ApiResponse({ status: 400, description: 'Invalid video ids.' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async batchOperation(@Body() batchOperationsDto: BatchOperationDto[]) {
    return await this.videoService.batchOperation(batchOperationsDto);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a Video' })
  @ApiResponse({ status: 201, description: 'Video downloaded successfully.' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async downloadVideo(@Param('id') id: string, @Res() res: Response) {
    const downloadPath = this.videoService.getDownloadVideo(id);

    res.download(`${join(process.cwd(), downloadPath)}`);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiResponse({ status: 200, description: 'Return all videos.', type: Video })
  async getVideos() {
    return await this.videoService.getVideos();
  }

  @Get('trims')
  @ApiOperation({ summary: 'Get all trims' })
  @ApiResponse({ status: 200, description: 'Return all trims.', type: Trim })
  async getTrims() {
    return await this.videoService.getTrims();
  }

  @Get('concats')
  @ApiOperation({ summary: 'Get all concats' })
  @ApiResponse({ status: 200, description: 'Return all concats', type: Concat })
  async getConcats() {
    return await this.videoService.getConcats();
  }
}
