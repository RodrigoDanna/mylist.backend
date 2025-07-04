import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    status: TaskStatus.pendente,
    priority: TaskPriority.alta,
    deadline: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  };

  const prismaMock = {
    task: {
      create: jest.fn().mockResolvedValue(mockTask),
      findMany: jest.fn().mockResolvedValue([mockTask]),
      findUnique: jest.fn().mockResolvedValue(mockTask),
      update: jest.fn().mockResolvedValue(mockTask),
      delete: jest.fn().mockResolvedValue(mockTask),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { title: 'Test Task', userId: 'user1' };
      await expect(service.create(dto as any)).resolves.toEqual(mockTask);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.create).toHaveBeenCalled();
    });
    it('should throw BadRequestException if title is missing', async () => {
      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should normalize deadline if string in yyyy-mm-dd', async () => {
      const dto = {
        title: 'Test Task',
        userId: 'user1',
        priority: TaskPriority.alta,
        deadline: '2025-07-03',
      };
      prisma.task.create = jest.fn().mockResolvedValue(mockTask);
      await service.create(dto as any);
      expect(
        (prisma.task.create as jest.Mock).mock.calls[0][0].data.deadline,
      ).toBeInstanceOf(Date);
    });

    it('should remove deadline if not provided', async () => {
      const dto = {
        title: 'Test Task',
        userId: 'user1',
        priority: TaskPriority.alta,
      };
      prisma.task.create = jest.fn().mockResolvedValue(mockTask);
      await service.create(dto as any);
      expect(
        'deadline' in (prisma.task.create as jest.Mock).mock.calls[0][0].data,
      ).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      await expect(service.findAll({})).resolves.toEqual([mockTask]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      await expect(service.findOne('1')).resolves.toEqual(mockTask);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTask);
      await expect(service.update('1', { title: 'Updated' })).resolves.toEqual(
        mockTask,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it('should normalize deadline if string in yyyy-mm-dd', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTask);
      const dto = { deadline: '2025-07-03' };
      prisma.task.update = jest.fn().mockResolvedValue(mockTask);
      await service.update('1', dto as any);
      expect(
        (prisma.task.update as jest.Mock).mock.calls[0][0].data.deadline,
      ).toBeInstanceOf(Date);
    });

    it('should remove deadline if not provided', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTask);
      const dto = {};
      prisma.task.update = jest.fn().mockResolvedValue(mockTask);
      await service.update('1', dto as any);
      expect(
        'deadline' in (prisma.task.update as jest.Mock).mock.calls[0][0].data,
      ).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTask);
      await expect(service.remove('1')).resolves.toEqual(mockTask);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
