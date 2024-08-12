import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { TrimVideoDto } from './dto/trim-video.dto';
import { ConcatVideoDto } from './dto/concat-video.dto';
import { Video, Trim, Concat } from './entities/video.entity';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';

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
      concats: [],
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

    const outputDirectory = './processed';
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
      const video = this.getVideoById(id);

      if (!video) throw new NotFoundException(`Video with id ${id} not found`);

      video.concats.push(concat);
      return video;
    });

    if (videos.length !== videoIds.length) {
      const missingIds = videoIds.filter((videoId) =>
        videos.every((video) => video.id !== videoId),
      );

      throw new NotFoundException(
        `Videos with ids ${missingIds.join(', ')} not found`,
      );
    }

    const outputDirectory = './processed';
    const temporaryFilePath = join('./uploads', `${concat.id}_list.txt`);
    const fileListContent = videos
      .map((video) => `file '${join(process.cwd(), video.path)}'`)
      .join('\n');

    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.writeFile(temporaryFilePath, fileListContent);

    const outputFilePath = join(
      outputDirectory,
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

  async executeCommands(): Promise<string[]> {
    const outputFiles: string[] = [];

    for (const trim of this.trims) {
      const video = this.getVideoById(trim.videoId);

      if (video) {
        const outputFilePath = join('./processed', `${trim.id}.mp4`);

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

      const outputFilePath = join('./processed', `${concat.id}.mp4`);

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
    const fileListPath = join('./processed', 'filelist.txt');
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
