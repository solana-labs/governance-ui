import ChartViolinPlotIcon from '@carbon/icons-react/lib/ChartViolinPlot';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/mN0eY0k.png',
    description:
      'Raydium is an Automated Market Maker (AMM) built on the Solana blockchain for the Serum Decentralized Exchange (DEX).',
    iconImgSrc:
      'https://raw.githubusercontent.com/raydium-io/media-assets/ac2e46c4d8fc72d935cab0878992ce9a99b88589/logo.svg',
    name: 'Raydium',
    publicKey: new PublicKey('GDBJ3qv4tJXiCbz5ASkSMYq6Xfb35MdXsMzgVaMnr9Q7'),
    urlId: 'Raydium',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'Solend is the autonomous interest rate machine for lending on Solana',
    iconImgSrc: 'https://i.imgur.com/knGCZ5f.png',
    name: 'Solend DAO',
    publicKey: new PublicKey('7sf3tcWm58vhtkJMwuw2P3T6UBX7UE5VKxPMnXJUZ1Hn'),
    urlId: 'SLND',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    // description:
    //   'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: 'https://trade.mango.markets/assets/icons/logo.svg',
    name: 'Mango DAO',
    publicKey: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
    urlId: 'MNGO',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    // description:
    //   'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc:
      'https://miro.medium.com/fit/c/176/176/1*-mdTTAgsSuBYSfDqG6Fd1w.png',
    name: 'Orca DAO',
    publicKey: new PublicKey('66Du7mXgS2KMQBUk6m9h3TszMjqZqdWhsG3Duuf69VNW'),
    urlId: 'ORCA',
  },
];

interface Props {
  className?: string;
}

export function NotableDefi(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ChartViolinPlotIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          notable defi projects
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        The rapidly evolving Solana DeFi industry features multiple innovations
        in FinTech allowing for maximal financial inclusion while boasting
        blazing fast transaction speeds and ultra low fees
      </div>
      <div
        className={cx(
          'grid',
          'mt-6',
          'gap-3',
          'items-center',
          'md:grid-cols-2',
          'lg:grid-cols-4',
          'xl:grid-cols-2',
          '2xl:grid-cols-4',
        )}
      >
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 w-full 2xl:max-w-[290px] h-56" key={i}>
            <SmallCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
