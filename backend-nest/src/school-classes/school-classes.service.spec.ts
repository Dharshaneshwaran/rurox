import { Test, TestingModule } from '@nestjs/testing';
import { SchoolClassesService } from './school-classes.service';

describe('SchoolClassesService', () => {
  let service: SchoolClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolClassesService],
    }).compile();

    service = module.get<SchoolClassesService>(SchoolClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
