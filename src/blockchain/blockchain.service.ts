import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private iface: ethers.Interface;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('FANTOM_RPC_URL');
    const contractAddress = this.configService.get<string>('TEX_CONTRACT_ADDRESS');
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 value)"
      // Adicione o ABI completo do seu contrato se necessário
    ];

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.iface = new ethers.Interface(abi);
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  async getBurnEvents(startBlock?: number, endBlock?: number) {
    const burnAddress = "0x0000000000000000000000000000000000000000"; // Endereço padrão para queima

    const filter = this.contract.filters.Transfer(null, burnAddress);
    const events = await this.contract.queryFilter(filter, startBlock, endBlock);

    return await Promise.all(events.map(async event => {
      const decodedEvent = this.iface.decodeEventLog('Transfer', event.data, event.topics);
      return {
        address: decodedEvent.from,
        amount: BigInt(decodedEvent.value).toString(), // Convertendo para string para evitar problemas de precisão
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: (await event.getBlock()).timestamp
      };
    }));
  }

  async getBlockNumberByDate(date: string): Promise<number> {
    const timestamp = new Date(date).getTime() / 1000;
    let blockNumber = await this.provider.getBlockNumber();
    while (true) {
      const block = await this.provider.getBlock(blockNumber);
      if (block.timestamp < timestamp) {
        return blockNumber;
      }
      blockNumber--;
    }
  }
}