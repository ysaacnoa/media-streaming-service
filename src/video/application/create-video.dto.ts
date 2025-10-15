import { IsString, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsOptional()
  @IsString()
  title?: string;
}
