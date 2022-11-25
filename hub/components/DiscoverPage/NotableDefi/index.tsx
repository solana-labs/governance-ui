import ChartViolinPlotIcon from '@carbon/icons-react/lib/ChartViolinPlot';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/rXz3mnF.png',
    description:
      'Hubble Protocol is the issuer of USDH, a Solana native crypto-backed stablecoin that anyone can mint by depositing their crypto.',
    iconImgSrc: 'https://i.imgur.com/rk827nw.png',
    name: 'Hubble Protocol',
    publicKey: new PublicKey('AgR2tq1xcbqwmgDcNRaV1BEP5J3kfJfswP5vn6WWe6uC'),
    urlId: 'Hubble Protocol',
  },
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
    bannerImgSrc:
      'https://tulipprotocol.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F7f6ad7fd-3750-4908-b3ee-ac18660a69b6%2F1500x500.jpeg?table=block&id=bfb9c7e5-bc09-4b91-97e1-f211d4fa8eb1&spaceId=b22e9cdb-d148-4721-823e-c7a372f168da&width=1880&userId=&cache=v2',
    description: "Solana's Yield Aggregation Homestead",
    iconImgSrc:
      'https://tulipprotocol.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F7fb0fb44-825e-46f3-aae1-b76cc9684547%2Fnew-logo.png?table=block&id=e0916de3-eca0-429b-ab04-6b9df820f4f1&spaceId=b22e9cdb-d148-4721-823e-c7a372f168da&width=1200&userId=&cache=v2',
    name: 'Tulip',
    publicKey: new PublicKey('413KSeuFUBSWDzfjU9BBqBAWYKmoR8mncrhV84WcGNAk'),
    urlId: 'Tulip',
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
          defi projects
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        Solana DeFi allows for maximal financial inclusion alongside blazing
        fast transaction speeds and ultra low fees.
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
