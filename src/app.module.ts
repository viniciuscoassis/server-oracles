import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventsModule,
    LeaderboardModule,
    BlockchainModule
  ],
})
export class AppModule {}