import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="flex text-center pl-8 pr-20 lg:pl-0 lg:pr-0 justify-center items-center p-2.5 bg-[#EBEFF1] dark:bg-[#2E2E37] text-xs text-black/35 dark:text-white/35">
      <Link href="https://jup.ag" passHref>
        <a target="_blank">
          Jupiter: The Key Liquidity Aggregator and Swap Infrastructure for
          Solana
        </a>
      </Link>
    </footer>
  );
};

export default Footer;
