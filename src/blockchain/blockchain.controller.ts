import { Controller, Get, Query } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('burn-events')
  async getBurnEvents(
    @Query('startBlock') startBlock?: number,
    @Query('endBlock') endBlock?: number
  ) {
    return this.blockchainService.getBurnEvents(startBlock, endBlock);
  }

  @Get('block-number-by-date')
  async getBlockNumberByDate(@Query('date') date: string) {
    return this.blockchainService.getBlockNumberByDate(date);
  }
}