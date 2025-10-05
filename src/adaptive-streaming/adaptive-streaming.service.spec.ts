import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveStreamingService } from './adaptive-streaming.service';

describe('AdaptiveStreamingService', () => {
  let service: AdaptiveStreamingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdaptiveStreamingService],
    }).compile();

    service = module.get<AdaptiveStreamingService>(AdaptiveStreamingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
