import {
  Connection,
  PublicKey,
  // TransactionInstruction,
  // Account,
  // Transaction,
} from '@solana/web3.js'
import {
  AccountMetaData,
  InstructionData,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance'

import { BPF_UPGRADEABLE_LOADER_INSTRUCTIONS } from './programs/bpfUpgradeableLoader'
import { GOVERNANCE_INSTRUCTIONS } from './programs/governance'
import { getProgramName } from './programs/names'
import { RAYDIUM_INSTRUCTIONS } from './programs/raydium'
import { SPL_TOKEN_INSTRUCTIONS } from './programs/splToken'
import { SYSTEM_INSTRUCTIONS } from './programs/system'
import { VOTE_STAKE_REGISTRY_INSTRUCTIONS } from './programs/voteStakeRegistry'
import { MARINADE_INSTRUCTIONS } from './programs/marinade'
import { SOLEND_PROGRAM_INSTRUCTIONS } from './programs/solend'
import { ATA_PROGRAM_INSTRUCTIONS } from './programs/associatedTokenAccount'
import { STREAMFLOW_INSTRUCTIONS } from './programs/streamflow'
import { governance as foresightGov } from '@foresight-tmp/foresight-sdk'
import { ConnectionContext } from '@utils/connection'
import { NFT_VOTER_INSTRUCTIONS } from './programs/nftVotingClient'
import { PROGRAM_IDS } from '@castlefinance/vault-sdk'
import { FORESIGHT_INSTRUCTIONS } from './programs/foresight'
import { LIDO_INSTRUCTIONS } from './programs/lido'
import { NAME_SERVICE_INSTRUCTIONS } from './programs/nameService'
import { TOKEN_AUCTION_INSTRUCTIONS } from './programs/tokenAuction'
import { VALIDATORDAO_INSTRUCTIONS } from './programs/validatordao'
import { POSEIDON_INSTRUCTIONS } from './programs/poseidon'
import { MANGO_V4_INSTRUCTIONS } from './programs/mangoV4'
import { DUAL_INSTRUCTIONS } from './programs/dual'
import { SWITCHBOARD_INSTRUCTIONS } from './programs/switchboard'
import { STAKE_INSTRUCTIONS } from './programs/stake'

/**
 * Default governance program id instance
 */
export const DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
export const DEFAULT_GOVERNANCE_PROGRAM_VERSION = 3

export const MANGO_DAO_TREASURY = '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3'

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  AQeo6r6jdwnmf48AMejgoKdUGtV8qzbVJH42Gb5sWdi: 'Deprecated: Mango IDO program',
  '9pDEi3yT9ooT1uw1PApQDYK65advJs4Nt65EJG1m59Yq':
    'Mango Developer Council Mint',
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'Mango DAO MNGO Treasury Vault',
  DiSDgMz4DeNKHXkpqUGoukr1YM9xxc1wH9gusZnMa1ga: 'Mango DAO Dual Realm Deposit',
  '8gjzxiqcU87cvRc7hFiUJgxqLSV7AQnSttfWC5fD9aim':
    'Mango DAO Treasury Council Mint',
  A9xaHx54B9bRYBga4V6LKFrRaARpMJFYVooEXRAanru5:
    'Mango DAO Treasury Council USDC Treasury',
  '7zGXUAeUkY9pEGfApsY26amibvqsf2dmty1cbtxHdfaQ': 'Mango DAO Wallet Governance',
  '9so7UTo6b6LXBSqdDfh18hjVj8Ng5BmLbYXLB7UrhaaJ':
    'Mango Treasury Council Wallet',
  BxZ974q4zsrSThN54rZqNaA6E2CFoj77mUikqK68Lgrf:
    'Mango Treasury Council Wallet Governance',
  FnrgYLrpftdsBj5gd4qeaFwDUQZCg2cfo7aqQ1kJmWJy:
    'Mango Dao -> Dual Dao Vote Wallet',
  EWaYDnKhcqS4tVjyhUBoJR1Yx755imqzBm5tb2vQTNtK:
    'Mango Dao -> Dual Dao Vote Wallet Governance',
  '7D6tGmaMyC8i73Q8X2Fec2S1Zb5rkyai6pctdMqHpHWT':
    'Mango DAO Fast Listing Governance',
  Fmt4596j4uBvYutwQ2ZBw7RGw9EngR8yNijdqemnpiaB: 'Mango DAO Fast Listing Wallet',
  '5tgfd6XgwiXB9otEnzFpXK11m7Q7yZUaAJzWK4oT5UGF': 'Mango DAO Wallet',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3': 'Mango DAO MNGO Treasury',
  Ccg4zf9V2U4PKyx5DBANf9sF2pu4s4XgRNLkaP6yqJZF: 'Mango DAO Checking Wallet',
  Db8aq5EvSS2DXpKjNxkaZChEc3jy7W3wUq4xFy35AWbo:
    'Mango DAO Checking Wallet Governance',
  '3r1tQ2qaR5teYPEyGoHwZeZfMU1zxD5FAAmtAJPbj9xX':
    'Mango DAO Opinion Voting Governance',
  '36LbigK7RRiw12u7rb83Ztb9SFrUFUCDfYPxtfZndtyV':
    'Mango DAO Opinion Voting Wallet',
  '65u1A86RC2U6whcHeD2mRG1tXCSmH2GsiktmEFQmzZgq': 'Mango DAO USDC Governance',
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf':
    'Mango DAO USDC Treasury Vault',
  '6h29sTzK4XsL4Gjo8uXLWXgKLNSXvnnax45RJ4NSCziP': 'Mango DAO USDC Treasury',
  '4WQSYg21RrJNYhF4251XFpoy1uYbMHcMfZNLMXA3x5Mp':
    'Mango DAO Voter Stake Registry Registrar',
  DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE: 'Mango DAO Governance Realm',
  '7Sn4TN4ZkMghVBAhZ88UkyzXoYkMScaE6qtk9eWV3rJz':
    'Mango DAO Governance Program',
  '8tKwcKM4obpoPmTZNZKDt5cCkAatrwHBNteXNrZRvjWj': 'Mango Liquidity Payout Pool',
  '59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy':
    'Mango v3 Insurance Fund Vault',
  '9qFV99WD5TKnpYw8w3xz3mgMBR5anoSZo2BynrGmNZqY': 'Mango v3 Revenue Vault',
  '6GX2brfV7byA8bCurwgcqiGxNEgzjUmdYgarYZZr2MKe': 'Mango v3 Revenue Vault',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd:
    'Mango v3 BTC-PERP Incentive Vault',
  '7Gm5zF6FNJpyhqdwKcEdMQw3r5YzitYUGVDKYMPT1cMy': 'Mango V3 Admin Key',
  MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: 'MNGO Token Mint',
  H7uqouPsJkeEiLpCEoC1qYVVquDrZan6ZfdPK2gS44zm: 'FORE Devnet Token Mint',
  '4ahVJVavHM8DZCtjX6YuKSTFx6KJwRPmVCJtjdQYdUU7': 'FORE Mainnet Token Mint',
  [foresightGov.DEVNET_TREASURY.toBase58()]: 'Foresight Devnet Governance',
  [foresightGov.MAINNET_TREASURY.toBase58()]: 'Foresight Mainnet Governance',
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC Token Mint',

  MyHd6a7HWKTMeJMHBkrbMq4hZwZxwn9x7dxXcopQ4Wd: 'OMH Token',
  '2A7UgheVhmoQqXBAQyG1wCoMpooPuiUf2DK6XFiQTtbG': 'OMH Mint Governance',

  // Metaplex Foundation
  Cmtpx4jmkc9ShvWub4hcAvCqrqvWRpWW9eLUdruyZAN8:
    'Metaplex Foundation Council Mint',
  '2yf8YggL4cUhCygoppFMWWeBuJtmLQE9oHkiiUnXP1uM':
    'Metaplex Foundation Council Mint Governance',
  mtpXxYKnxwJJReD3PiZ1NLCfbMkHgNcJeGsdXFTfoBk:
    'Metaplex Foundation Community Mint',
  '2ZxVbyU35dqtMHgLbZZPoGURf2XuPVmSgmVHY8bTfiMC':
    'Metaplex Foundation Community Mint Governance',

  // Metaplex Genesis
  CMPxgYJPXRA8BRfC41uvv6YvpQwtFvLeV9PXjSLpNhYq: 'Metaplex Genesis Council Mint',
  '68NxN1Vo2TLhA3H33yBjwQE5D5UxqB2iL1HL4dgHyF66':
    'Metaplex Genesis Council Mint Governance',
  mpXGnkKdGs1eRZPKkBQ3GW5G4LsVgcX4RzGa5WPo67v:
    'Metaplex Genesis Community Mint',
  '4A9WiAZyXpBBEYaBv3UNQCKTqmDth7fukGnBoprLLH2i':
    'Metaplex Genesis Community Mint Governance',

  Cfafd52FfHRA5FRkTXmMNyHZfhNkbaHpZ12ggmeTVEMw:
    'Friends and Family Council Mint',
  FAFDfoUkaxoMqiNur9F1iigdBNrXFf4uNmS5XrhMewvf:
    'Friends and Family Community Mint',

  // Physis DAO
  '29epeLvAMyRXtpA1HaoKB1hGcAnrc1NvMCbaZ8AVRwEi': 'Physis DAO Treasury',
  '4i2Yjk5bUiLeVNwqBpkRdFSECSCvMgKoeCSdRSx1TPcz': 'DAO: Rewards (PHY)',
  EUkYhtkRmxQpnKTvGayBJM3Pt1FQNjaMWP3UCUb38hJN: 'DAO: Grants (PHY)',
  '3XwmcRf9R6TFqCwhLkftur8Baq45ZYE7DQDj9WUAPsmN': 'DAO: Governance (PHY)',

  '6Va7K51FRbnPcYZTUwkoFfoYtnfh8qyJaZqT4W1GGxVi': 'Physis EcoSystem Treasury',
  C2KKuAq4UaUFYtm3zcxZMSDUuSEfPSk4yLcq5XaBr4wM: 'EcoSystem: Development (PHY)',
  F6EHstw5jkmHVLLXj9HEx3xCRsY7Whm7JK266jWFrFSB: 'EcoSystem: CapEX (PHY)',
  '4gr1JjLD89VAbmQRrLeFDiLFSv2z2zn1tXRWRX4C3kow': 'EcoSystem: OpEX (PHY)',
  '8eJoFYj8XtwJ9mER7qmb1EEnV8mGYGHyjxRct8ooJXQr': 'EcoSystem: Marketing (PHY)',

  '2jfAMh48b37bBTKkoNwmvNZAqVQc1G7gh5vYv5FoWTUR': 'Physis Team Treasury',
  '8vXYj8B567R8Di7BUvquiGC7usyPMtL756xx6KERfW9K': 'Team: Community (PHY)',
  AiGCc2YEwLNER7DETRwv5e82eqLwPL8FMcmmHEhED5Vr: 'Team: Core (PHY)',
  CpB6PDoxfkg2U8EC8XhyD6TdCAWkhRqZ4Fa3j3UFW6Rv: 'Team: Extraordinary (PHY)',

  BaT8NdFHAhrBpS7gTQX2YgSwazeNLcA4gKooDsAutvCk: 'Physis Alliance Treasury',
  H4WWxBJoDfGWfE212SF5tcyo75zBJnzCRAUmWpRMcxyH: 'Alliance: Partnerships (PHY)',
  '5L84NZfjdfWHkkkUT9bJ8jKqtTMrpKsAobtTW4NKpJB1': 'Alliance: Advisors (PHY)',

  E26u3zGmYtR4tnmbhNSQS6kLVmSizSvPCQyu7qGnTWQ3: 'Physis Reserve Treasury',
  BgDFLAE25QybqyK6TMPdPF7vFTrBu1AjPs2cFkF8R3cb: 'Reserve: Seed (PHY)',
  GDJKzWrkxWHEPPt4k2Ao1TL7S1CEo4xNRnTAVk3jrmbk: 'Reserve: Launchpad (PHY)',

  // GM DAO
  '7WbRWL33mM3pbFLvuqNjBztihQtHWWFPGr4HLHyqViG9': 'Team funds',
  DWhnQm42vCBLkA9RsrBB2spyR3uAJq1BGeroyNMKgnEh: 'Marketing funds',

  // GSAIL
  '39J1sWHCJgWab8pn6zpTqFCYRXTYVqbEkpLimrq8kTYJ':
    'GSAIL VAULT 2022-2026 VESTING SCHEDULE',
  GAMpPYx4DcJdPhnr7sM84gxym4NiNpzo4G6WufpRLemP: 'GSAIL TREASURY VAULT',

  // MonkOG DAO
  CVuCjHrqj97fSTsnSKzEBVPeYzXEEv6uiRjzBLRvnouj: 'MonkOG DAO Treasury Vault',

  // MMCC ClubDAO
  '92tozWPkbybEjPeiGpNFL8onAnT739cxLRQofGVnrmm6': 'ClubDAO DCF Revenue Vault',
  A6HXL3WMWT4gB1QvYJfZgDp2ufTfLkWBaX6Theakdf5h:
    'ClubDAO Main SOL Treasury Vault',
  '9UbiR69cKVVtQEejb5pzwSNJFrtr7pjRoygGaBBjUtpR': 'ClubDAO RB Revenue Vault',
  Dn1G2mh9VdZg9VoX62i545domg25Jbvx7VwuiXNyV6Qe:
    'ClubDAO Main NFT Treasury Vault',

  //MonkeDAO
  DKdBj8KF9sieWq2XWkZVnRPyDrw9PwAHinkCMvjAkRdZ: "MonkeDAO NFT's",
  '7r6xoSMC9xvrmM3LDV6p67hW4MqDmf4iocQB7CarqWGv': 'Primary Treasury Wallet',
  '3Gaxab6KF9SHVq8qvKLAdDQMX6ZYJxctmLL8QYk5gGRE': 'Treasury USDC',
  BQxsFSHwoWAi6MQyUXusvNjD6kAbBtcxGcZZ11zz2vGy: 'Treasury SOL',
  BQ2nz8oWcZ4PuEskvFboUtJDa1AVzdXaJh1vHajgUWiq: 'Marketing Wallet',
  H3fxHgqXBpXjoSnWHPYSsNkVTuZcP9jRXDE6eT6kganp: 'Marketing USDC',
  HAryckvjyViFQEmhmMoCtqqBMJnpXEYViamyDhZUJfnG: 'SMB Royalty Wallet',
  E3KpSoZL3EDeXw8EtgHfi83n663LFfyEZ8r9J7kdaEC2: 'SMB Royalty SOL',
  CNz3mg35f5HQ7wT2XsrBVNcSVdpWSSG8dwVLhCzsmUPo: 'Merch Escrow Wallet',
  '2rhSFgwgwuKYMaQUa5QcHBpaW5zoBL32ib3aqDW9zkcM': 'Merch USDC',
  '6VWfsPjYRGetHhQMJBh7cksKoN7MWimgeyeYHg824jRR': 'UST',
  '2eBFMe5jCG4hw3ooNr3UFQbVs6hE7bacHuuhZg4n8nCP': 'SHDW',
  Gr6PqrrZqiay44937AKthj7FEpShCBb94Jgw89BUr2b2: 'daoSOL',
  '2fEL6au59KfmtarX5cJD4a6EaxRr6gLBvFkE65uEPJ4U': 'DAOJONES',
  FboFh3DkwmAeH4GyM5Ttd8ismd2wq6c8MrRkSsmr5nQW: 'LUNA',
  GnfeSuTwbXcxVnuXJTzx172174PJAHUfXpNgsBdGCncd: 'Solend Holdings',

  // Jungle DeFi Community DAO
  Ebuwy24prHRL3QEAT911wWD8aa493ikZeH7LfYzMQxS1: 'Incoming Protocol Fees/Assets',
  '8jEtEwEYrFyNnHkvEC4xn2GeMKz5rpCtaxovdnD335xD': 'RAY Fee Wallet',
  Gf6zQBC5nYs53KcuTsvPUx6i39eTDt5GoALuvJged6Wt: 'USDC Fee Wallet',
  '2yCZaxgH1Y5P1aXRhe4XfKaL2roRzdDn5dJE67UgJx72': 'stSOL Fee Wallet',
  Crq4ztCBzga78n1KusfiE2HsExGoPUGoHCgXkVSwwsrG: 'I-JFI-Q4/USDC POL',
  '893e6nmHcgrf3wyxhKGMy8wGNBNLU9Eev7yVRapo7jcP': 'JFI/USDC POL',
  '9BJQmMEke66pNEgwNB7M8s7WkMwLJFidUPujc1Xjdwjj': 'I-RAY-Q4/USDC POL',
  '2dFDdEow6sX6jeJKdVoBfiPWjcMDUAYxCsHmk64JZGuy': 'JFI Fee Wallet',
  '5HfKKTngUFzbdRJufnjZJnBpRsWqRj1jJgwouxgQituB': 'BTC Fee Wallet',
  HEpRCwvshWL4zUo35SEPRxYy2ZCEACHLzdHbuv9Q9Gtg: 'USH Fee Wallet',
  HEw5YMeF9ogZDSeRtz7btvE5BF9x53Pq9Cya83GZHR2D: 'mSOL Fee Wallet',
  F9uzuZ46wMxxYZmg4baegfocoSWBX8YDNhqM5HrG6t87: 'USDH Fee Wallet',
  '9uYzWw9rT9EMANe5yHKAsQfCKZP7Hjj46Pp1vmGz1K5s': 'USDT Fee Wallet',
  gE8dBQZJze8zzCxb7iRiiHAvwv68t4vzBJsUMrWUPtx: 'ETH Fee Wallet',
  CP8CMdBczN4GYjm3ygrVGhfU1HwnPxxcmWjPCkwihM74: 'Emission and Expense Reserves',
  Hd65UxhS8sagMyQP3gU1E7N8xsTcQYM7Vpi2gZAMTDE7: 'JFI Reserves',
  '4R1emrnFsWzgawRSN6QFKUTEGG5ZPmE2qDLXgZYMsCMv': 'USDC Reserves',
  '3AtD8oiBUWttbnNCpKk1enRoquN9V88Nv6Rn7ESHPWHa':
    'DAO Instance Authority Governance',
  jdaoDN37BrVRvxuXSeyR7xE5Z9CAoQApexGrQJbnj6V: 'Jungle DeFi Governance Program',

  //Serum DAO
  '5xinfvkvL5NZ6BG3cDtFdTbVuMutqGXkDBuhncfmzPr2': 'Serum SRM Grant Treasury',

  //Kaimana DAO

  '3X9EEzWbpCzRmLxbTFoddux9faLxTMVFwjTSTXQ4W8ar': 'Kaiman dao community wallet',
  '4Amtnu7TjDHYLyKMMvoCTDHW18a2dEMdS3sAoE96JwQz':
    'Kaiman dao community wallet governance',
  FXCgiZvkm9mAr6ZC9NnqNSeWZWZSmHDDZxCmzgaeShki: 'Kaiman dao council wallet',
  yrtHtvgyPgWFrRDDMpBEva2f888kDrGnwHYEdM7fSFT:
    'Kaiman dao council wallet governance',
  '714JsESwkxjDZTaxD2TNe7vqMG52yxug8vaXug5VKBqd':
    'Kaiman dao council mint governance',
  '9rFYGii2nQz74qg5PTYViPj46E82PrJguEC2QvbZVuwk': 'Kaiman dao council mint',

  // Marinade DAO
  '899YG3yk4F66ZgbNWLHriZHTXSKk9e1kvsKEquW7L6Mo': 'Marinade DAO Realm',
  'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey': 'MNDE Token Mint',
  'FsrqQfLGdFVtySSSsyZJUzVBA9bvGZSKyhp7nsJCqgJe': 'Marinade Realm Config Governance',
  '26Pw2qvaHgnvHPD73pWr6EUWchpTF3bEzVbEoDPLS21D': 'Marinade Realm Config Wallet',
  '6MGwpuJ5YE1c8jJaF8FKurQdDJeYRf1adX76dovkXxRs': 'Marinade Council Mint',
  'CnPBhNLpwPDY5rw8Wa8bt8DCkRNJ2GoGVf9xb7VYNrRr': 'Marinade Admin Authorities Governance',
  'BD9XxcmnvbJHgCcX8b2QMXjmcXHQ332NskFvjq6DTByU': 'Marinade Admin Authorities Wallet',
  'M5Fg6GipNvPzWgXNr5wj1EDcp8GB9J53cgyE7YGYLbL': 'Marinade Liquid Staking Admin Authority Governance',
  '42VJbDihcS81YJPbuhHnHgvo1ehu42j8VK9sNwrnAarR': 'Marinade Liquid Staking Admin Authority Wallet',
  '8z6A4qSfL9FFvwX12zqt6HrbzaWthGUqBe4czCn9iXtq': 'Marinade MNDE Treasury Governance',
  'B56RWQGf9RFw7t8gxPzrRvk5VRmB5DoF94aLoJ25YtvG': 'Marinade MNDE Treasury Wallet',
  'GR1LBT4cU89cJWE74CP6BsJTf2kriQ9TX59tbDsfxgSi': 'Marinade MNDE Treasury Vault',
  '23xVZXQrHAZ4rm4nWKAM5eTLeUFmstbs42KF21PA4Ayo': 'Marinade Opinion Voting Governance',
  'AyCAAAd7wsw6zy6cVhDf8gp6Mv4K46T84dUrkg7KX7fy': 'Marinade Opinion Voting Wallet',
  'CWRgRr4udD66JbVtS9u2Gu7LHBi5m6SM3ytvmWobThEQ': 'Marinade Tokadapt Program Governance',
  'AEej7Lywu8EzMznXnxhb1493yCVnmLNXaCKYfUNvQQaJ': 'Marinade Escrow Relocker Program Governance',
  '3cBS14yanCZPRKgdCLnmxHWXFfGjW8bid5zxj7UPqWW5': 'Marinade Liquidity Gauges Program Governance',
  'CLydpgqZty5HQq1uMtbXpH1vtmN7erhdBSPbn12NGLmb': 'Marinade Validator Gauges Program Governance',
  'G6yWqM2RVjhepkVEayeNVqgKNtpMuwtgqDY3s2N3uzas': 'Marinade Referral v1 Program Governance',
  '6XQFdWeogb5C8c1KsSCkK6rzzxLxzxsPQqoXge9oJ9xR': 'Marinade Referral v2 Program Governance',
  '2aQP7NGhktKR92EsHKSoRzcw5FfcZ8oBWgyoGdB3ouww': 'Marinade Directed Stake Program Governance',
  'A8tioq6Joznftd2b6GLY8rrgCka6F81vVztFciWDxEAe': 'Marinade Council Budget Governance',
  'J5BEceL5z1EQ7JBqEFu4BfPN4PYCeQaW3GXrzXFfCzhs': 'Marinade Council Budget Wallet',
  'H988v6sNu4dw911AeUo6fy5RsTkDtyfcTAMNpdq1Mo6u': 'Marinade Council Budget MNDE Vault',
  '2w6ny74cU6yRxkD6ZACh5M1JznLQ1KB6AUsB7zo2NBHX': 'Marinade Voter Stake Registry Program Governance',
  '6egAu2HDLcSgeUYmiBvNLgp7Bd4nPk16gX9MvWuJpeX2': 'Marinade SPL Program Governance',
}

// TODO: Add this to on-chain metadata to Governance account
// Blacklisted governances which should not be displayed in the UI
// Hidden accounts that are unusable due to wrong configuration e.g
// 60% vote threshold on 5b token supply
// hidden legacy accounts to declutter UI
export const HIDDEN_GOVERNANCES = new Map<string, string>([
  ['HfWc8M6Df5wtLg8xg5vti4QKAo9KG4nL5gKQ8B2sjfYC', ''],
  ['A3Fb876sEiUmDWgrJ1fShASstw8b5wHB6XETzQa8VM7S', ''],
  ['2j2oe8YXdYJyS7G8CeEW5KARijdjjZkuPy5MnN8gBQqQ', ''],
  ['56yqzBEr9BqDGjYPJz9G8LVQrbXsQM2t2Yq3Gk8S56d1', ''],
  ['4styeLGsBRpV4xKsCNMRPb94U7JN8ZXoXJTLZA5hdjo9', ''],
  ['CKWNNwtn5nbsGMkvtRwHDv4QTyoHMByKVd7Ypo2deNpc', ''],
  ['G8JgCHfca7PehBwRp1Q91smJ9CXAd8K9e9CpfVjyD2MP', ''],
])

// TODO: Add this to on-chain metadata to Proposal account
// Blacklisted proposals which should not be displayed in the UI
// hidden legacy accounts to declutter UI
export const HIDDEN_PROPOSALS = new Map<string, string>([
  ['E8XgiVpDJgDf4XgBKjZnMs3S1K7cmibtbDqjw5aNobCZ', ''],
  ['DrhhwYXaY4fvTBoQdNtgwEoTjuQswvDQLfVcgUXgP1Mx', ''],
  ['CfbCUF7cn6UdWRsGPUUtj4CKMBL7qNCdF1WunED4gYA4', ''],
  ['Hzv3N2KtVikNoXz6nH9AWvt7Y9Smn8bRQ2gnAeJDkhm1', ''],
  ['FeFaHN8c3yokUxyJw3F475uegMUoYsYtr4J2DMaS6JZh', ''],
  ['GqoMraqhfK7ezFiKexRVkbYwvCegs9dgFpXn2f7aeePT', ''],
  ['CZnFphcs2UmbqppTEP5PkAAF4DqeyFr7fPQ2bunCey2J', ''],
  ['8ptWWXgb2nLVuMgJ1ZgXJfRaBesBDkyzYarJvWNLECbG', ''],
  ['7P3dtUTSvcQcjtJpZHZKEzrGvvHQdQGJrtKFLNAYHvpv', ''],
  ['EVzN1pfZwniGuyp45ZASHo6rU4Z8xx5kWevzDauR8sWp', ''],
  ['7P3dtUTSvcQcjtJpZHZKEzrGvvHQdQGJrtKFLNAYHvpv', ''],
  ['H5TnbSBNFKJJwKea8tUj7ETcmhRHXQ1N9XCXBSD6Q9P1', ''],
  ['GeMQWvFTasBoui11RqRzMtDPQ9b2BkMK8NzepWzvuXw3', ''],
])

export const DEFAULT_NATIVE_SOL_MINT =
  'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u'

export const DEFAULT_NFT_TREASURY_MINT =
  'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw'

export function getAccountName(accountPk: PublicKey | string) {
  const key = typeof accountPk === 'string' ? accountPk : accountPk.toBase58()
  return ACCOUNT_NAMES[key] ?? getProgramName(accountPk)
}

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'
export const WSOL_MINT_PK = new PublicKey(WSOL_MINT)

//Hidden accounts that has some shit coins with 0 value inside but freeze authority
//blocks closing them
const HIDDEN_MNGO_TREASURES = [
  'GZQSF4Fh9xK7rf9WBEhawXYFw8qPXeatZLUqVQeuW3X8',
  'J6jYLFDWeeGwg4u2TXhKDCcH4fSzJFQyDE2VSv2drRkg',
  'HXxjhCQwm496HAXsHBWfuVkiXBLinHJqUbVKomCjKsfo',
  'EwPgko6gXD5PAgQaFo1KD7R9tPUEgRcTAfsGvgdhkP4Z',
  '6VYcrmbK4QNC7WpfVRXBAXP59ZH2FkUMBoMYhtgENGMn',
  '4Z8nAK9grjokaUqJNtw2AEkYAR1vcw8pkCWZcbVEEdh5',
  'FTiWWq3cgETfPkYqP36xFUhT7KMoFYyCiPKeYQU1e4U8',
  'FrkLPsCadx4tE4qDobbu2GTD5ffjWBpormHbLLy35PUS',
  'CaoFkVyPJugKMdzDT1NGnsQJ8dWe4kZFaETCbtWz1QBr',
  'PuXf9LNrmtVDhBTxteNTWS8D2SpzbhYvidkSatjRArt',
]

//owner and desired accounts we want to show
const MNGO_AUXILIARY_TOKEN_ACCOUNTS = [
  {
    owner: '58apybWwtWwgVfARs7uJ75Vs1csPimnCCFth7cKwTJAe',
    accounts: ['DiSDgMz4DeNKHXkpqUGoukr1YM9xxc1wH9gusZnMa1ga'],
  },
  {
    owner: '9so7UTo6b6LXBSqdDfh18hjVj8Ng5BmLbYXLB7UrhaaJ',
    accounts: ['A9xaHx54B9bRYBga4V6LKFrRaARpMJFYVooEXRAanru5'],
  },
]

export const AUXILIARY_TOKEN_ACCOUNTS = {
  Mango: MNGO_AUXILIARY_TOKEN_ACCOUNTS,
}

export const HIDDEN_TREASURES = [...HIDDEN_MNGO_TREASURES]

export const ALL_CASTLE_PROGRAMS = [
  PROGRAM_IDS['devnet-parity'],
  PROGRAM_IDS['devnet-staging'],
  PROGRAM_IDS['mainnet'],
]

interface AccountDescriptor {
  name: string
  important?: boolean
}

export interface InstructionDescriptorFactory {
  name: string
  accounts: AccountDescriptor[]
  getDataUI: (
    connection: Connection,
    data: Uint8Array,
    accounts: AccountMetaData[]
  ) => Promise<JSX.Element>
}

export interface InstructionDescriptor {
  name: string
  accounts: AccountDescriptor[]
  dataUI: JSX.Element
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
  ...SPL_TOKEN_INSTRUCTIONS,
  ...BPF_UPGRADEABLE_LOADER_INSTRUCTIONS,
  ...RAYDIUM_INSTRUCTIONS,
  ...MARINADE_INSTRUCTIONS,
  ...LIDO_INSTRUCTIONS,
  ...SWITCHBOARD_INSTRUCTIONS,
  ...SOLEND_PROGRAM_INSTRUCTIONS,
  ...FORESIGHT_INSTRUCTIONS,
  ...ATA_PROGRAM_INSTRUCTIONS,
  ...SYSTEM_INSTRUCTIONS,
  ...VOTE_STAKE_REGISTRY_INSTRUCTIONS,
  ...NFT_VOTER_INSTRUCTIONS,
  ...STREAMFLOW_INSTRUCTIONS,
  ...NAME_SERVICE_INSTRUCTIONS,
  ...TOKEN_AUCTION_INSTRUCTIONS,
  ...VALIDATORDAO_INSTRUCTIONS,
  ...POSEIDON_INSTRUCTIONS,
  ...MANGO_V4_INSTRUCTIONS,
  ...DUAL_INSTRUCTIONS,
  ...STAKE_INSTRUCTIONS,
}

export async function getInstructionDescriptor(
  connection: ConnectionContext,
  instruction: InstructionData,
  realm?: ProgramAccount<Realm> | undefined
) {
  let descriptors: any
  if (
    (realm && instruction.programId.equals(realm.owner)) ||
    instruction.programId.equals(new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID))
  ) {
    descriptors =
      GOVERNANCE_INSTRUCTIONS['GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw']
  } else {
    descriptors = INSTRUCTION_DESCRIPTORS[instruction.programId.toBase58()]
  }

  // Make it work for program with one instruction like ATA program
  // and for the one with multiple instructions
  const descriptor = !instruction.data.length
    ? descriptors
    : descriptors && descriptors[instruction.data[0]]
      ? descriptors[instruction.data[0]]
      : //backup if first number is same for couple of instructions inside same idl
      descriptors && descriptors[`${instruction.data[0]}${instruction.data[1]}`]
        ? descriptors[`${instruction.data[0]}${instruction.data[1]}`]
        : descriptors

  const dataUI = (descriptor?.getDataUI &&
    (await descriptor?.getDataUI(
      connection.current,
      instruction.data,
      instruction.accounts,
      instruction.programId,
      connection.cluster
    ))) ?? <>{JSON.stringify(instruction.data)}</>
  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  }
}
