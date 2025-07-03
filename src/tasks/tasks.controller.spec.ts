import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskPriority } from '@prisma/client';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<TasksService>;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile();
    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with userId', async () => {
      const req = { user: { sub: 'user1' } };
      const dto = {
        userId: req.user.sub,
        title: 'Test',
        priority: TaskPriority.baixa,
      };
      (service.create as jest.Mock).mockResolvedValue('created-task');
      const result = await controller.create(dto, req);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create as jest.Mock).toHaveBeenCalledWith({
        ...dto,
        userId: 'user1',
      });
      expect(result).toBe('created-task');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with userId and query', async () => {
      const req = { user: { sub: 'user1' } };
      (service.findAll as jest.Mock).mockResolvedValue(['task1']);
      const result = await controller.findAll(req, {});
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll as jest.Mock).toHaveBeenCalledWith({
        userId: 'user1',
      });
      expect(result).toEqual(['task1']);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue('task1');
      const result = await controller.findOne('id1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne as jest.Mock).toHaveBeenCalledWith('id1');
      expect(result).toBe('task1');
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const dto = { title: 'Updated' };
      (service.update as jest.Mock).mockResolvedValue('updated-task');
      const result = await controller.update('id1', dto as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update as jest.Mock).toHaveBeenCalledWith('id1', dto);
      expect(result).toBe('updated-task');
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      (service.remove as jest.Mock).mockResolvedValue('removed-task');
      const result = await controller.remove('id1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove as jest.Mock).toHaveBeenCalledWith('id1');
      expect(result).toBe('removed-task');
    });
  });
});
