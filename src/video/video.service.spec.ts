import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { NotFoundException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import { TrimVideoDto } from './dto/trim-video.dto';
import { ConcatVideoDto } from './dto/concat-video.dto';
import { Video, Trim, Concat } from './entities/video.entity';

jest.mock('fluent-ffmpeg');
jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe('VideoService', () => {
  let service: VideoService;
  let ffmpegMock: jest.Mocked<typeof ffmpeg>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService],
    }).compile();

    service = module.get<VideoService>(VideoService);
    ffmpegMock = ffmpeg as jest.Mocked<typeof ffmpeg>;
  });

  describe('uploadVideo', () => {
    it('비디오를 업로드하면 비디오 정보를 return 한다.', async () => {
      const mockFile = {
        originalname: 'test.mp4',
        path: '/path/to/test.mp4',
        mimetype: 'video/mp4',
        size: 1024,
      } as Express.Multer.File;

      const mockUuid = 'mock-uuid';
      (uuid as jest.Mock).mockReturnValue(mockUuid);

      const result = await service.uploadVideo(mockFile);

      expect(service.getVideos()).resolves.toContainEqual(result);
    });
  });
});
