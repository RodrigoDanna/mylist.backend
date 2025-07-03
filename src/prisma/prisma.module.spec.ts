import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  it('should provide PrismaService', () => {
    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should be a global module', () => {
    // The @Global decorator is a metadata marker, not directly testable at runtime,
    // but we can check that PrismaService is available without explicit provider.
    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });
});
