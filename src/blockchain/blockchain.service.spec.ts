import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let providerMock: ethers.JsonRpcProvider;
  let contractMock: ethers.Contract;
  let ifaceMock: ethers.Interface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'FANTOM_RPC_URL':
                  return 'https://rpcapi.fantom.network';
                case 'TEX_CONTRACT_ADDRESS':
                  return '0x16e17Bf68F99DA63326677431efEB1F6FfD46eDe';
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);

    providerMock = new ethers.JsonRpcProvider();
    ifaceMock = new ethers.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ]);
    contractMock = new ethers.Contract(
      '0x16e17Bf68F99DA63326677431efEB1F6FfD46eDe',
      ifaceMock.fragments,
      providerMock,
    );

    jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue(providerMock);
    jest.spyOn(ethers, 'Contract').mockReturnValue(contractMock);
    jest.spyOn(ethers, 'Interface').mockReturnValue(ifaceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBurnEvents', () => {
    it('should fetch burn events', async () => {
      const mockEvents = [
        {
          data: '0x',
          topics: [],
          transactionHash: '0xabc',
          blockNumber: 12345,
          getBlock: jest.fn().mockResolvedValue({ timestamp: 1618293982 }),
        },
      ];

      const decodedEvent = {
        from: '0x123',
        to: '0x0000000000000000000000000000000000000000',
        value: BigInt(100),
      };

      jest.spyOn(contractMock, 'queryFilter').mockResolvedValue(mockEvents);
      jest.spyOn(ifaceMock, 'decodeEventLog').mockReturnValue(decodedEvent);

      const events = await service.getBurnEvents();

      expect(events).toEqual([
        {
          address: '0x123',
          amount: '100',
          transactionHash: '0xabc',
          blockNumber: 12345,
          timestamp: 1618293982,
        },
      ]);
      expect(contractMock.queryFilter).toHaveBeenCalledTimes(1);
      expect(ifaceMock.decodeEventLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBlockNumberByDate', () => {
    it('should fetch block number by date', async () => {
      const mockBlock = {
        timestamp: 1618293982,
      };

      jest.spyOn(providerMock, 'getBlockNumber').mockResolvedValue(12345);
      jest.spyOn(providerMock, 'getBlock').mockResolvedValue(mockBlock);

      const blockNumber = await service.getBlockNumberByDate('2021-04-12T12:30:00Z');

      expect(blockNumber).toBe(12344);
    });
  });
});