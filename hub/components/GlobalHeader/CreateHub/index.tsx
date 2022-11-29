import AddIcon from '@carbon/icons-react/lib/Add';
import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import CloseIcon from '@carbon/icons-react/lib/Close';
import LaunchIcon from '@carbon/icons-react/lib/Launch';
import WarningIcon from '@carbon/icons-react/lib/Warning';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import * as Button from '@hub/components/controls/Button';
import * as Dialog from '@hub/components/controls/Dialog';
import { Input } from '@hub/components/controls/Input';
import * as Radio from '@hub/components/controls/Radio';
import cx from '@hub/lib/cx';

enum HasDAO {
  Yes = 'Yes',
  No = 'No',
}

interface Props {
  className?: string;
}

export function CreateHub(props: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasDAO, setHasDAO] = useState(HasDAO.Yes);
  const [pk, setPk] = useState('');
  const [pkIsValid, setPkIsValid] = useState(false);
  const router = useRouter();

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <NavigationMenu.Item asChild>
        <Dialog.Trigger asChild>
          <Button.Primary className={cx('w-36', props.className)}>
            <AddIcon className="w-4 h-4 mr-1" />
            Create Hub
          </Button.Primary>
        </Dialog.Trigger>
      </NavigationMenu.Item>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="w-[776px] h-[675px] bg-neutral-100 relative">
            <Dialog.Close className="top-8 right-8" />
            <div className="grid grid-rows-[1fr,40px] gap-y-16 h-full pb-8">
              <div className="pl-16 pt-16 pr-[108px] grid grid-cols-[32px,1fr] gap-x-3">
                <RealmCircle className="h-8 w-8" />
                <div>
                  <div className="text-3xl font-medium text-neutral-900">
                    Before creating your Hub...
                  </div>
                  <div className="mt-14">
                    <div className="font-bold text-neutral-900">
                      Does your organization have a multisig wallet or DAO
                      through SPL Governance?
                    </div>
                    <div className="text-sm text-neutral-500">
                      All wallet addresses in the multisig or DAO council will
                      have admin privileges like moderating the feed and editing
                      the hub.
                    </div>
                  </div>
                  <Radio.Root
                    className="mt-3 space-y-3"
                    value={hasDAO}
                    onValueChange={(val: HasDAO) => setHasDAO(val)}
                  >
                    <Radio.Item
                      checked={hasDAO === HasDAO.Yes}
                      className="text-neutral-900"
                      key={HasDAO.Yes}
                      value={HasDAO.Yes}
                    >
                      Yes
                    </Radio.Item>
                    <Radio.Item
                      checked={hasDAO === HasDAO.No}
                      className="text-neutral-900"
                      key={HasDAO.No}
                      value={HasDAO.No}
                    >
                      No
                    </Radio.Item>
                  </Radio.Root>
                  {hasDAO === HasDAO.Yes && (
                    <div className="mt-10">
                      <div className="font-bold text-neutral-900">
                        What is your multisig's or DAO's public key?
                      </div>
                      <div className="text-sm text-neutral-500">
                        This will link your organization's DAO or multisig to
                        your Hub.
                      </div>
                      <Input
                        className="w-full mt-4"
                        placeholder="e.g. 9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e"
                        value={pk}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setPk(value);

                          try {
                            new PublicKey(value);
                            setPkIsValid(true);
                          } catch {
                            setPkIsValid(false);
                          }
                        }}
                      />
                      {pk &&
                        (pkIsValid ? (
                          <div className="flex items-center space-x-2 mt-1 text-emerald-500">
                            <CheckmarkIcon className="h-4 w-4 fill-current" />
                            <div className="text-xs">Valid Address</div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 mt-1 text-rose-500">
                            <CloseIcon className="h-4 w-4 fill-current" />
                            <div className="text-xs">Invalid Address</div>
                          </div>
                        ))}
                    </div>
                  )}
                  {hasDAO === HasDAO.No && (
                    <div className="mt-8 bg-white py-5 px-6">
                      <div className="flex items-center font-bold text-rose-500 space-x-2">
                        <WarningIcon className="h-4 w-4" />
                        <div>Before you can create your Hub...</div>
                      </div>
                      <div className="mt-1 text-sm text-neutral-700">
                        You must first create your organization’s multisig
                        wallet or DAO. Members of the multisig or council
                        members of the DAO will gain admin privileges like
                        moderating and editing for the Hub and its feed.
                      </div>
                      <div className="mt-6 flex items-center space-x-4">
                        <Button.Secondary
                          className="w-60"
                          onClick={() => {
                            window.open('/realms/new', '_blank');
                          }}
                        >
                          Create Multisig or DAO{' '}
                          <LaunchIcon className="h-4 w-4 ml-1" />
                        </Button.Secondary>
                        <div className="text-xs text-neutral-500">
                          app.realms.today/realms/new
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between px-[108px]">
                <div className="text-xs text-neutral-500">
                  {/* Need help? Email{' '} */}
                  Need help? Post your question on the{' '}
                  <Link passHref href="/realm/rch">
                    <a
                      className="text-sky-500 hover:text-sky-400 transition-colors"
                      onClick={() => {
                        setDialogOpen(false);
                        setPk('');
                        setPkIsValid(false);
                      }}
                    >
                      Realms Org Hub
                    </a>
                  </Link>
                  {/* <a
                    className="underline"
                    href="mailto:realms@solana.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    realms@solana.com
                  </a> */}
                </div>
                <Button.Primary
                  className="w-44"
                  disabled={!pk || !pkIsValid || hasDAO === HasDAO.No}
                  onClick={() => {
                    router.push(`/realm/${pk}/hub/edit?initial=true`);
                    setDialogOpen(false);
                    setPk('');
                    setPkIsValid(false);
                  }}
                >
                  Continue <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button.Primary>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
