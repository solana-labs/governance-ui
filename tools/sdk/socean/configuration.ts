import { newProgramMap } from '@saberhq/anchor-contrib';
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib';
import { Connection, PublicKey } from '@solana/web3.js';
import { EndpointTypes } from '@models/types';
import { BondingJSON, BondingProgram } from './programs/bonding';
import { DescendingAuctionJSON, DescendingAuctionProgram } from './programs';
import { Wallet } from '@project-serum/common';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';

export type SoceanPrograms = {
  Bonding: BondingProgram;
  DescendingAuction: DescendingAuctionProgram;
};

export type SupportedCluster = Extract<EndpointTypes, 'devnet' | 'mainnet'>;

type MultiClusterPubkey = {
  [key in SupportedCluster]: PublicKey;
};

class SoceanConfiguration {
  public readonly bondingProgramId: MultiClusterPubkey = {
    devnet: new PublicKey('76kLhv2TPJ6aCnHMEcm1kHrsBEsqo4wjCp5mz3prThkk'),

    mainnet: new PublicKey('bon4Kh3x1uQK16w9b9DKgz3Aw4AP1pZxBJk55Q6Sosb'),
  };

  public readonly descendingAuctionProgramId: MultiClusterPubkey = {
    devnet: new PublicKey('CwuWwv57X9Yerfhkh9oEDJzr1qgyDFYr2mkyZ3HH8jjJ'),

    mainnet: new PublicKey('desGPJHB9jXNpbqrV4j6Zcpvf4Zu8ijyYpowBFVDMtF'),
  };

  public readonly bondingProgramInstructions = {
    mintBondedTokens: 242,
  };

  public readonly descendingAuctionProgramInstructions = {
    depositToAuctionPool: 177,
    purchase: 21,
  };

  public loadPrograms(
    provider: SolanaAugmentedProvider,
    cluster: SupportedCluster,
  ): SoceanPrograms {
    return newProgramMap<SoceanPrograms>(
      provider,

      {
        // IDLs
        Bonding: BondingJSON,
        DescendingAuction: DescendingAuctionJSON,
      },

      {
        // Addresses
        Bonding: this.bondingProgramId[cluster],
        DescendingAuction: this.descendingAuctionProgramId[cluster],
      },
    );
  }

  public getSoceanPrograms({
    connection,
    wallet,
    cluster,
  }: {
    connection: Connection;
    wallet: SignerWalletAdapter;
    cluster: EndpointTypes;
  }) {
    if (cluster === 'localnet') {
      throw new Error('unsupported cluster for Socean programs loading');
    }
    const programs = this.loadPrograms(
      new SolanaAugmentedProvider(
        SolanaProvider.init({ connection, wallet: wallet as Wallet }),
      ),
      cluster as SupportedCluster,
    );
    if (!programs) throw new Error('Socean Configuration error: no programs');
    return programs;
  }
}

export default new SoceanConfiguration();
