import { PublicKey } from '@solana/web3.js';
import { SPL_TOKENS } from '@utils/splTokens';

export interface IPoolInfo {
  amm: PublicKey;
  feeAccount: PublicKey;
  pythAccount: PublicKey;
  pythPcAccount: PublicKey;
  pythBaseDecimal: number;
  configAccount: PublicKey;

  lpToken: {
    mint: PublicKey;
    decimals: number;
  };

  tokenA: {
    tokenAccount: PublicKey;
    mint: PublicKey;
    decimals: number;
  };

  tokenB: {
    tokenAccount: PublicKey;
    mint: PublicKey;
    decimals: number;
  };
}

export type PoolNames =
  | 'UXD-USDC'
  | 'SOL-USDC'
  | 'SOL-USDT'
  | 'BTC-USDC'
  | 'ETH-USDC'
  | 'RAY-USDC'
  | 'USDT-USDC'
  | 'UST-USDC'
  | 'SOL-UXD'
  | 'stSOL-UXD';

// Translation
// pool coin = token A
// pool pc = token B

export const PoolList: { [poolLabel in PoolNames]: IPoolInfo } = {
  'SOL-UXD': {
    amm: new PublicKey('GjnY1NbZafYu6VSK2ELh5NRZs7udGAUR2KoAB7pYxJak'),
    feeAccount: new PublicKey('ZRfAnqPSnyY4USGnoeJTNrriqPfudm2a9811vYHYniQ'),
    configAccount: new PublicKey(
      '3BUS8iaWzGjtCueoChEsu1N8Fh9QeQp8foJsU4tdKkJ7',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      '6qyKHAbqFUGqukKDXK47f7ZFxfg3zsX3LYCaiTgwnCxk',
    ),
    pythBaseDecimal: 11,
    lpToken: {
      mint: new PublicKey('E9e9UPZvzLCtPNWimJk8T7JDKX6hvHWGe2ZTY1848bQf'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '4byV1TrowZopVezaBLL5cMbAaU3TZ5BQdtitHFWDBfuE',
      ),
      mint: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '4JciXWsVimE9tqnmgQ8AjZqYZwiF6fx6zCxWf9PCrZ2n',
      ),
      mint: SPL_TOKENS.UXD.mint,
      decimals: SPL_TOKENS.UXD.decimals,
    },
  },
  'UXD-USDC': {
    amm: new PublicKey('5BJUhcBnysAmCpaU6pABof7FUqxx7ZnCZXbctpP48o3C'),
    feeAccount: new PublicKey('9pKxj6GTTdJ2biQ6uTyv7CTmVmnjz6cXGCz7rXg7Nm2N'),
    configAccount: new PublicKey(
      '86MM38X9P5mxzRHFVX8ahtB9dCFKSk8AFhb33f5Zz8VW',
    ),
    pythAccount: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    pythBaseDecimal: 8,
    lpToken: {
      mint: new PublicKey('DM2Grhnear76DwNiRUSfeiFMt6jSj2op9GWinQDc7Yqh'),
      decimals: 6,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '5BUkh9e3JF9yUvSw6P3HHqkdMuujRG942hYNSkAEghFs',
      ),
      mint: SPL_TOKENS.UXD.mint,
      decimals: SPL_TOKENS.UXD.decimals,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        'BbwCGgAHEUfu7PUEz8hR877aK2snseqorfLbvtcVbjhj',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'SOL-USDC': {
    amm: new PublicKey('amgK1WE8Cvae4mVdj4AhXSsknWsjaGgo1coYicasBnM'),
    feeAccount: new PublicKey('AD5DFr1AXMB9h6fw5KFtkEfwf7kYSAiaSueeu4NGrLKY'),
    configAccount: new PublicKey(
      '2iT9h99mhDqetoZGNj7KKrqBnoDmFvAytGrnFYuR7MwN',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    ),
    pythBaseDecimal: 11,
    lpToken: {
      mint: new PublicKey('3WzrkFYq4SayCrhBw8BgsPiTVKTDjyV6wRqP7HL9Eyyw'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '2uySTNgvGT2kwqpfgLiSgeBLR3wQyye1i1A2iQWoPiFr',
      ),
      mint: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '32SjGNjesiCZgmZb4YxAGgjnym6jAvTWbqihR4CvvXkZ',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'SOL-USDT': {
    amm: new PublicKey('2x8Bmv9wj2a4LxADBWKiLyGRgAosr8yJXuZyvS8adirK'),
    feeAccount: new PublicKey('GFj8cNTP4mzWG7ywyJ35Ls2V8CbqDk3p4xNT1pAawoCh'),
    configAccount: new PublicKey(
      'Hor7j9oYfNH6EJgmnXQRiQSahduR5p4bfKyCZaQUqNKd',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    pythBaseDecimal: 11,
    lpToken: {
      mint: new PublicKey('BRchiwrv9yCr4jAi6xF4epQdtNtmJH93rrerpHpMhK1Z'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '5pH2DBMZg7y5bN4J3oLKRETGXyVYPJpeaCH6AkdAcxqp',
      ),
      mint: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '7Cct2MJUwruQef5vQrP2bxYCNyVajJ3SiC1GYUmwmjUm',
      ),
      mint: SPL_TOKENS.USDT.mint,
      decimals: SPL_TOKENS.USDT.decimals,
    },
  },
  'BTC-USDC': {
    amm: new PublicKey('HeH3s7B3a6nynim1rBGS6TRaYECgSNjt7Kp65mhW9P4k'),
    feeAccount: new PublicKey('5HpNeHBBpg6x7fzTgbvP9UukQmDmvxbggwqo951BYkba'),
    configAccount: new PublicKey(
      'HuLmRVTfYjNYYGBpPtJEk7JKkosbbPF4zzBHnf3TfyCn',
    ),
    pythAccount: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    pythPcAccount: new PublicKey(
      'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    ),
    pythBaseDecimal: 8,
    lpToken: {
      mint: new PublicKey('BzuTSoWFHrnRQvn4sr5ErPQyMaRB9g2rsbKCruGtcvMa'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        'FAFShq3gZYXWtk5EkeKPKcwSkz2rjfMDuD1i7KiYwjVM',
      ),
      mint: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
      decimals: 6,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '3ReY1xscSAEV9Qg1NshkU4KRWQs33nu5JMg8AnoU7duG',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'ETH-USDC': {
    amm: new PublicKey('E32Z6DYwJELMTrVJVchN8PWbyhSoC3bRorMb7Cw2R9Xz'),
    feeAccount: new PublicKey('5yXQ399ti5rKMcRMAZvFUqAgKHUP55bvhoYWd9bVrnu9'),
    configAccount: new PublicKey(
      '5JXrQpWAPNrvVN1R6Mz9MhA1EYUB948kceZjCxRzQzf5',
    ),
    pythAccount: new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'),
    pythPcAccount: new PublicKey(
      'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    ),
    pythBaseDecimal: 10,
    lpToken: {
      mint: new PublicKey('8FxRyaE8X6ENLmNbaBvgS6vMsN1GJ8J7CmKy8K8uN6wM'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        'BRFwAToCofwzP29jVGzb6VZ4AGpw867AE5VsXfMsmEGk',
      ),
      mint: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
      decimals: 8,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        'FDCjDSbFCVRVBsWkJWfgZ9x3Dizm1MJjtzYw3R2fxXRv',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'RAY-USDC': {
    amm: new PublicKey('FcxHANr1dguexPZ2PoPGBajgiednXFMYHGGx4YMgedkM'),
    feeAccount: new PublicKey('DyR91PiiRopbdcizbjdXejodjxEeVSs4uCkyhL7wCvxw'),
    configAccount: new PublicKey(
      '2EXv6K3cYDMXXKFfzGjqnjkbngUymnVwBoC4kwrCKwFy',
    ),
    pythAccount: new PublicKey('AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB'),
    pythPcAccount: new PublicKey(
      'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB',
    ),
    pythBaseDecimal: 8,
    lpToken: {
      mint: new PublicKey('HUpvKUafPCMwhua6QtHXk1V8D6LZYyQmUKYPFZgRiiiX'),
      decimals: 6,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        'BhG9r4CkTBRtpLtxA8Hd72vCkikqyVhiq8pFunZNERV8',
      ),
      mint: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
      decimals: 6,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '8HAVXU7bdS2SEkkrqFBdWPFxFTrWxtu4GTjP46BDzdTc',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'USDT-USDC': {
    amm: new PublicKey('Cm3L8YhKq9h1SYoQLJnxKJbMtw62nF2CHy3yjAFuwVGy'),
    feeAccount: new PublicKey('BBAsd3c1Nr4VAZE1Z9fwZKNRuaySyKsK5yiACgLKoNA6'),
    configAccount: new PublicKey(
      '62hK67DcFR2ywxtiAzxj4C1v5i2BtxzVt5ArNBgwYeUz',
    ),
    pythAccount: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    pythBaseDecimal: 8,
    lpToken: {
      mint: new PublicKey('9d5GhGFbbX5LGYyXxPDMvsREgF69cFTGv6jxqtKkE58j'),
      decimals: 6,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        'Hn9BgYCSxTyCPnKpjnjHVzqQG4szceDaCpQedjW4Ug3c',
      ),
      mint: SPL_TOKENS.USDT.mint,
      decimals: SPL_TOKENS.USDT.decimals,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '74ZXM4EgYcovVijnCuceXJrGCNu3KJPniRSvBpZzDig',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },
  'UST-USDC': {
    amm: new PublicKey('DVJHq6RB56Ertd9cBwJ99cckQ3g192TCuSLphWuXs6yh'),
    feeAccount: new PublicKey('9unwWtiQJFsJJp9UjFcdGYTrzttGBc4GPgd7h6PSRswn'),
    configAccount: new PublicKey(
      '9v1viMjw6fWfBdKacU861ncyXUP9SChm8BK1wtiDkoJx',
    ),
    pythAccount: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    pythPcAccount: new PublicKey(
      'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    ),
    pythBaseDecimal: 8,
    lpToken: {
      mint: new PublicKey('GgXkVjtMrPbc6AvUwjApcnLsR63SeD1BPB7nSSjzH5CX'),
      decimals: 6,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '6Qqdyy6RtbTA75aZHVxuBBS37u24uZyeptCBErGhQhHL',
      ),
      mint: new PublicKey('9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i'),
      decimals: 6,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        '9cbaGjEJBz7CuvwLsMdPZXMFovQJ91pDDqZSuWsPRMVY',
      ),
      mint: SPL_TOKENS.USDC.mint,
      decimals: SPL_TOKENS.USDC.decimals,
    },
  },

  'stSOL-UXD': {
    amm: new PublicKey('CMu86zkJtcqYTBgKMf1fJWhcowQBVmysNsWthXZNZpYZ'),
    feeAccount: new PublicKey('tdTP4XEKYyfxTPg3EuRZbrZmm7p882u7BBWPaNahraP'),
    configAccount: new PublicKey(
      'GVZZaF3YPRSkG8CB1hC4bGYrg6g7LEiWmPpKH4BE4b2n',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey('tRCderESn7r9UARDATUxMesd282QjkpwM9pkmizFbWE'),
    pythBaseDecimal: 11,
    lpToken: {
      mint: new PublicKey('AFBYo7dFZzS18dKg965VVdoiV7cmSj9AX81uwCEYFyvA'),
      decimals: 9,
    },
    tokenA: {
      tokenAccount: new PublicKey(
        '4QydTFxiZ4art8Fo67L4UnvGHWJSQAh6a1JXPuxk5aaT',
      ),
      mint: new PublicKey('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'),
      decimals: 9,
    },
    tokenB: {
      tokenAccount: new PublicKey(
        'C92rvQ4zXhYb3pHsN2dNnH5jW35UTFYbuZd1YDWzZhDc',
      ),
      mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
      decimals: 6,
    },
  },
};
