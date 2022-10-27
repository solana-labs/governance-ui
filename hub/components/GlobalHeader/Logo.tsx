import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';

import { RealmsLogo } from '@hub/components/branding/RealmsLogo';

interface Props {
  className?: string;
}

export function Logo(props: Props) {
  return (
    <NavigationMenu.Item className={props.className}>
      <Link passHref href="/discover">
        <NavigationMenu.Link>
          <RealmsLogo className="h-8" />
        </NavigationMenu.Link>
      </Link>
    </NavigationMenu.Item>
  );
}
