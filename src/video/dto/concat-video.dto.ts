import { IsNotEmpty, IsArray } from 'class-validator';

export class ConcatVideoDto {
  @IsNotEmpty()
  @IsArray()
  videoIds: string[];
}
