import { Test, TestingModule } from '@nestjs/testing';
import { SchoolClassesController } from './school-classes.controller';

describe('SchoolClassesController', () => {
  let controller: SchoolClassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolClassesController],
    }).compile();

    controller = module.get<SchoolClassesController>(SchoolClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
