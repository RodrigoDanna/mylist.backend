import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  userId: string;
  title: string;
  priority: TaskPriority;
  deadline?: Date;
}

export class UpdateTaskDto {
  title?: string;
  deadline?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}
