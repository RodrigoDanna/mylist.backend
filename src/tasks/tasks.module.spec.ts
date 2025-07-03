import { Test, TestingModule } from '@nestjs/testing';
import { TasksModule } from './tasks.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide TasksService', () => {
    const service = module.get<TasksService>(TasksService);
    expect(service).toBeInstanceOf(TasksService);
  });

  it('should provide TasksController', () => {
    const controller = module.get<TasksController>(TasksController);
    expect(controller).toBeInstanceOf(TasksController);
  });

  it('should provide PrismaService', () => {
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
  });
});
