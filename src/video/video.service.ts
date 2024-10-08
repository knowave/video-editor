import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { TrimVideoDto } from './dto/trim-video.dto';
import { ConcatVideoDto } from './dto/concat-video.dto';
import { Video } from './entities/video.entity';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { BatchOperationDto } from './dto/batch-operation.dto';
import { OperationType } from './enums/operation-type.enum';
import { Trim } from './entities/trim.entity';
import { Concat } from './entities/concat.entity';

@Injectable()
export class VideoService {
  private videos: Video[] = [];
  private trims: Trim[] = [];
  private concats: Concat[] = [];

  async uploadVideo(file: Express.Multer.File): Promise<Video> {
    const video: Video = {
      id: uuid(),
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date(),
      trims: [],
      concat: null,
    };

    this.videos.push(video);
    return video;
  }

  async trimVideo(
    trimVideoDto: TrimVideoDto,
  ): Promise<{ trim: Trim; outputFilePath: string }> {
    const { videoId, startTime, endTime } = trimVideoDto;
    const video = this.getVideoById(videoId);

    if (!video) {
      throw new NotFoundException(`Video with id ${videoId} not found`);
    }

    const trim: Trim = {
      id: uuid(),
      videoId,
      startTime,
      endTime,
    };

    const outputDirectory = './uploads';
    const outputFilePath = join(
      outputDirectory,
      `${trim.id}${extname(video.path)}`,
    );

    await fs.mkdir(outputDirectory, { recursive: true });

    const command = `ffmpeg -i ${video.path} -ss ${startTime} -to ${endTime} -c copy ${outputFilePath}`;

    await new Promise<void>((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          reject(new Error(`Error trimming video: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    video.trims.push(trim);
    this.trims.push(trim);
    return { trim, outputFilePath };
  }

  async concatVideos(concatVideoDto: ConcatVideoDto): Promise<Concat> {
    const { videoIds } = concatVideoDto;

    if (videoIds.length === 0)
      throw new BadRequestException('No videos to concatenate');

    const concat: Concat = {
      id: uuid(),
      videoIds,
    };

    const videos = videoIds.map((id) => {
      const video = this.getVideoOrTrim(id);

      if (!video) throw new NotFoundException(`Video with id ${id} not found`);

      if (this.isVideo(video) && video.trims.length > 0) {
        video.concat = concat;
      } else if (!this.isVideo(video) && video.videoId) {
        return this.getVideoById(video.videoId);
      }

      return video;
    }) as Video[];

    if (videos.length !== videoIds.length) {
      const missingIds = videoIds.filter((videoId) =>
        videos.every((video) => video.id !== videoId),
      );

      throw new NotFoundException(
        `Videos with ids ${missingIds.join(', ')} not found`,
      );
    }

    const temporaryFilePath = join('./uploads', `${concat.id}_list.txt`);
    const fileListContent = videos
      .map((video) => `file '${join(process.cwd(), video.path)}'`)
      .join('\n');

    await fs.writeFile(temporaryFilePath, fileListContent);

    const outputFilePath = join(
      './uploads',
      `${concat.id}${extname(videos[0].path)}`,
    );

    const command = `ffmpeg -f concat -safe 0 -i ${temporaryFilePath} -c copy ${outputFilePath}`;

    await new Promise<void>((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          reject(new Error(`Error concatenating videos: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    await fs.unlink(temporaryFilePath);

    this.concats.push(concat);
    return concat;
  }

  async batchOperation(
    batchOperationsDto: BatchOperationDto[],
  ): Promise<boolean> {
    const results = [];

    for (const batchOperationDto of batchOperationsDto) {
      const { type, trim, concat } = batchOperationDto;

      if (type === OperationType.TRIM) {
        await this.trimVideo(trim);
      } else if (type === OperationType.CONCAT) {
        await this.concatVideos(concat);
      }

      results.push(true);
    }

    const allSucceeded = results.every((result) => result);

    return allSucceeded;
  }

  getDownloadVideo(id: string): string {
    const video = this.getVideoById(id);

    if (!video) {
      throw new NotFoundException(`Video with id ${id} not found`);
    }

    return video.path;
  }

  async executeCommands(): Promise<string[]> {
    const outputFiles: string[] = [];

    for (const trim of this.trims) {
      const video = this.getVideoById(trim.videoId);

      if (video) {
        const outputFilePath = join('./uploads', `${trim.id}.mp4`);

        await this.runFfmpegCommand(video.path, outputFilePath, [
          '-ss',
          trim.startTime,
          '-to',
          trim.endTime,
          '-c',
          'copy',
        ]);

        outputFiles.push(outputFilePath);
      }
    }

    for (const concat of this.concats) {
      const inputFiles = concat.videoIds.map(
        (id) => this.getVideoById(id).path,
      );

      const outputFilePath = join('./uploads', `${concat.id}.mp4`);

      await this.concatFfmpegCommand(inputFiles, outputFilePath);
      outputFiles.push(outputFilePath);
    }

    return outputFiles;
  }

  async getVideos(): Promise<Video[]> {
    return this.videos;
  }

  async getTrims(): Promise<Trim[]> {
    return this.trims;
  }

  async getConcats(): Promise<Concat[]> {
    return this.concats;
  }

  getVideoById(id: string): Video {
    return this.videos.find((video) => video.id === id);
  }

  private getVideoOrTrim(id: string): Video | Trim {
    const video = this.getVideoById(id);

    if (video) {
      return video;
    } else {
      return this.trims.find((trim) => trim.id === id);
    }
  }
  private isVideo(entity: Video | Trim): entity is Video {
    return (entity as Video).originalName !== undefined;
  }

  private async runFfmpegCommand(
    inputFile: string,
    outputFile: string,
    args: string[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .outputOptions(...args)
        .save(outputFile)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  private async concatFfmpegCommand(
    inputFiles: string[],
    outputFile: string,
  ): Promise<void> {
    const fileListPath = join('./uploads', 'filelist.txt');
    await fs.writeFile(
      fileListPath,
      inputFiles.map((file) => `file '${file}'`).join('\n'),
    );

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(fileListPath)
        .inputOptions('-f concat', '-safe 0')
        .outputOptions('-c copy')
        .save(outputFile)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }
}
