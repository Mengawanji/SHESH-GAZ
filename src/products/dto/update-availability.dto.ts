import { IsBoolean } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsBoolean()
  inStock: boolean;
}
