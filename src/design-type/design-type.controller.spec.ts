import { Test, TestingModule } from '@nestjs/testing';
import { DesignTypeController } from './design-type.controller';
import { DesignTypeService } from './design-type.service';

describe('DesignTypeController', () => {
  let controller: DesignTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignTypeController],
      providers: [DesignTypeService],
    }).compile();

    controller = module.get<DesignTypeController>(DesignTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
