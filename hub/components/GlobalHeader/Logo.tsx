import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import { RealmsLogo } from '@hub/components/branding/RealmsLogo';

interface Props {
  className?: string;
  compressed?: boolean;
}

export function Logo(props: Props) {
  return (
    <NavigationMenu.Item className={props.className}>
      <Link passHref href="/discover">
        <NavigationMenu.Link>
          {props.compressed ? (
            <RealmCircle className="h-8" />
          ) : (
            <RealmsLogo className="h-8" />
          )}
        </NavigationMenu.Link>
      </Link>
    </NavigationMenu.Item>
  );
}
