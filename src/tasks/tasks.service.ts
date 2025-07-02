import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { Task, Prisma, TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDeadline(data: { deadline?: string | Date }) {
    if (data.deadline) {
      const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
      if (typeof data.deadline === 'string' && yyyymmdd.test(data.deadline)) {
        data.deadline = new Date(`${String(data.deadline)}T00:00:00Z`);
      }
    } else {
      delete data.deadline;
    }
  }

  async create(data: CreateTaskDto): Promise<Task> {
    if (
      !data.title ||
      typeof data.title !== 'string' ||
      data.title.trim() === ''
    ) {
      throw new BadRequestException('O título é obrigatório');
    }
    this.normalizeDeadline(data);
    return await this.prisma.task.create({ data });
  }

  async findAll(params: {
    userId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    orderBy?: 'createdAt' | 'deadline' | 'updatedAt' | 'priority';
    order?: Prisma.SortOrder;
  }): Promise<Task[]> {
    const {
      userId,
      status,
      priority,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const where: Prisma.TaskWhereInput = {
      userId,
      status,
      priority,
    };

    const orderByClause: Prisma.TaskOrderByWithRelationInput = {
      [orderBy]: order,
    };

    const result = await this.prisma.task.findMany({
      where,
      orderBy: orderByClause,
    });

    return result;
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);
    this.normalizeDeadline(data);
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Task> {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}
