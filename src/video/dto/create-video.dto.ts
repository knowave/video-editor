import { IsNotEmpty } from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  originalName: string;

  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  mimeType: string;

  @IsNotEmpty()
  size: number;
}
