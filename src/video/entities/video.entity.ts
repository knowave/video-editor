import { Concat } from './concat.entity';
import { Trim } from './trim.entity';

export class Video {
  id: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  trims: Trim[];
  concat: Concat;
}
