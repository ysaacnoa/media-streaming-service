import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveStreamingController } from './adaptive-streaming.controller';

describe('AdaptiveStreamingController', () => {
  let controller: AdaptiveStreamingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdaptiveStreamingController],
    }).compile();

    controller = module.get<AdaptiveStreamingController>(AdaptiveStreamingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
