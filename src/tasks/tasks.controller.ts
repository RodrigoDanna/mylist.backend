import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { AuthGuard } from '@nestjs/passport';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateTaskDto, @Req() req: { user: { sub: string } }) {
    return this.tasksService.create({ ...dto, userId: req.user.sub });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Req() req: { user: { sub: string } },
    @Query()
    query: {
      status?: TaskStatus;
      priority?: TaskPriority;
      orderBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'priority';
      order?: Prisma.SortOrder;
    },
  ) {
    return this.tasksService.findAll({ ...query, userId: req.user.sub });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
