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

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
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
  async trimVideo(@Body() trimVideoDto: TrimVideoDto) {
    return await this.videoService.trimVideo(trimVideoDto);
  }

  @Post('concat')
  async concatVideos(@Body() concatVideoDto: ConcatVideoDto) {
    return await this.videoService.concatVideos(concatVideoDto);
  }

  @Post('batch-operation')
  async batchOperation(@Body() batchOperationsDto: BatchOperationDto[]) {
    return await this.videoService.batchOperation(batchOperationsDto);
  }

  @Post('execute')
  async executeCommands() {
    return await this.videoService.executeCommands();
  }

  @Get()
  async getVideos() {
    return await this.videoService.getVideos();
  }

  @Get('trims')
  async getTrims() {
    return await this.videoService.getTrims();
  }

  @Get('concats')
  async getConcats() {
    return await this.videoService.getConcats();
  }

  @Get('download/:id')
  async downloadVideo(@Param('id') id: string, @Res() res: Response) {
    const downloadPath = this.videoService.getDownloadVideo(id);

    res.download(`${join(process.cwd(), downloadPath)}`);
  }
}
