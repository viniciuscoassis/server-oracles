import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  async findAll() {
    return await this.generateLeaderboard();
  }

  async findByRace(raceId: string) {
    // Implementar lógica específica para corrida, se necessário
    return await this.generateLeaderboard();
  }

  async findByDateRange(startDate?: string, endDate?: string) {
    let startBlock, endBlock;
    if (startDate) {
      startBlock = await this.blockchainService.getBlockNumberByDate(startDate);
    }
    if (endDate) {
      endBlock = await this.blockchainService.getBlockNumberByDate(endDate);
    }
    const events = await this.blockchainService.getBurnEvents(startBlock, endBlock);
    return this.generateLeaderboard(events);
  }

  private async generateLeaderboard(events = null) {
    if (!events) {
      events = await this.blockchainService.getBurnEvents();
    }

    const burnMap = new Map();

    events.forEach(event => {
      const amount = parseInt(event.amount);
      if (burnMap.has(event.address)) {
        burnMap.set(event.address, burnMap.get(event.address) + amount);
      } else {
        burnMap.set(event.address, amount);
      }
    });

    const leaderboard = Array.from(burnMap, ([address, amount]) => ({ address, amount }));
    return leaderboard.sort((a, b) => b.amount - a.amount);
  }
}