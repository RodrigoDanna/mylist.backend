import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { Task, Prisma, TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskDto): Promise<Task> {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      priority,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const where: Prisma.TaskWhereInput = {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      priority,
    };

    const orderByClause: Prisma.TaskOrderByWithRelationInput = {
      [orderBy]: order,
    };

    const result = (await this.prisma.task.findMany({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      orderBy: orderByClause,
    })) as Task[];

    return result;
  }

  async findOne(id: string): Promise<Task> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Task> {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }

  async markAsComplete(id: string): Promise<Task> {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: { status: 'concluida' },
    });
  }
}
