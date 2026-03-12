import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { BudgetItemEntity } from './entities/budget-item.entity';
import { ProjectEntity } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetItemEntity, ProjectEntity])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
