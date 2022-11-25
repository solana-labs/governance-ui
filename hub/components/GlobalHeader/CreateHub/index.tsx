import AddIcon from '@carbon/icons-react/lib/Add';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useState } from 'react';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import * as Button from '@hub/components/controls/Button';
import * as Dialog from '@hub/components/controls/Dialog';
import { ExternalLink } from '@hub/components/icons/ExternalLink';
import cx from '@hub/lib/cx';

import img from './image.png';

interface Props {
  className?: string;
}

export function CreateHub(props: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <NavigationMenu.Item asChild>
        <Dialog.Trigger asChild>
          <Button.Primary className={cx('w-32', props.className)}>
            <AddIcon className="w-4 h-4 mr-1" />
            Create Hub
          </Button.Primary>
        </Dialog.Trigger>
      </NavigationMenu.Item>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="w-[776px] h-[675px] bg-neutral-100 relative">
            <Dialog.Close className="top-8 right-8" />
            <div className="p-16 grid grid-cols-[32px,1fr] gap-x-3">
              <RealmCircle className="h-8 w-8" />
              <div>
                <div className="text-3xl font-medium text-neutral-900">
                  Build, grow, & maintain
                  <br />
                  your community
                </div>
                <div className="mt-3 text-sm text-neutral-700">
                  We are building the new standard for enabling modern
                  communities to
                  <br />
                  share ideas, make decisions, and collectively manage
                  treasuries.
                  <br />
                  <br />
                  Please fill out key information for your hub through the form
                  linked below.
                </div>
                <div className="grid grid-cols-[152px,1fr] mt-8 gap-x-4 items-center">
                  <Button.Primary
                    onClick={() => {
                      window.open(
                        'https://forms.gle/g4kfwtgz5RK9NsLh7',
                        '_blank',
                      );
                    }}
                  >
                    Fill out form{' '}
                    <ExternalLink className="h-4 w-4 ml-2 fill-current" />
                  </Button.Primary>
                  <div className="text-xs text-neutral-500">
                    We are currently beta testing and are accepting new
                    communities on an invite-only basis. Please fill out the
                    form to receive an invite.
                  </div>
                </div>
              </div>
            </div>
            <img
              className="absolute bottom-0 left-16 w-[700px]"
              src={img.src}
            />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
