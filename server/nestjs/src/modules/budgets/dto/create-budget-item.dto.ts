import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetItemDto {
  @ApiProperty({ description: '项目 ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: '材料', enum: ['材料', '人工', '设备', '其他'] })
  @IsString()
  category: string;

  @ApiProperty({ example: '水泥砂浆' })
  @IsString()
  @Length(1, 200)
  itemName: string;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
