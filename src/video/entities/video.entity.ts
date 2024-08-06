export class Video {
  id: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  trims: Trim[];
  concats: Concat[];
}

export class Trim {
  id: string;
  videoId: string;
  startTime: string;
  endTime: string;
}

export class Concat {
  id: string;
  videoIds: string[];
}
