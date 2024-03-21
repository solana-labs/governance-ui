import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { PublicKey } from '@solana/web3.js';
import React, { FC, useRef, useState } from 'react';

import { availablePasses } from '../../../../GatewayPlugin/config';
import Input from '@components/inputs/Input';
import cx from '@hub/lib/cx';

const itemStyles = cx(
  'border',
  'cursor-pointer',
  'gap-x-4',
  'grid-cols-[150px,1fr,20px]',
  'grid',
  'h-14',
  'items-center',
  'px-4',
  'w-full',
  'rounded-md',
  'text-left',
  'transition-colors',
  'dark:bg-neutral-800',
  'dark:border-neutral-700',
  'dark:hover:bg-neutral-700',
);

const labelStyles = cx('font-700', 'dark:text-neutral-50', 'w-full');
const descriptionStyles = cx('dark:text-neutral-400 text-sm');
const iconStyles = cx('fill-neutral-500', 'h-5', 'transition-transform', 'w-4');

// Infer the types from the available passes, giving type safety on the `other` and `default` pass types
type ArrayElement<
  ArrayType extends readonly unknown[]
> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type CivicPass = ArrayElement<typeof availablePasses>;

const isOther = (pass: CivicPass | undefined): boolean =>
  pass?.name === 'Other';
const other = availablePasses.find(isOther) as CivicPass;

// if nothing is selected, Uniqueness is most likely what the user wants
const defaultPass = availablePasses.find(
  (pass) => pass.name === 'Uniqueness',
) as CivicPass;

// If Other is selected, allow the user to enter a custom pass address here.
const ManualPassEntry: FC<{
  manualPassType?: PublicKey;
  onChange: (newManualPassType?: PublicKey) => void;
}> = ({ manualPassType, onChange }) => {
  const [error, setError] = useState<string>();
  const [inputValue, setInputValue] = useState<string>(
    manualPassType?.toBase58() || '',
  );

  return (
    <div className="relative">
      <div className="absolute top-0 left-2 w-0 h-12 border-l dark:border-neutral-700" />
      <div className="pt-10 pl-8">
        <div className="relative">
          <div
            className={cx(
              'absolute',
              'border-b',
              'border-l',
              'top-2.5',
              'h-5',
              'mr-1',
              'right-[100%]',
              'rounded-bl',
              'w-5',
              'dark:border-neutral-700',
            )}
          />
          <Input
            label="Pass Address"
            value={inputValue}
            type="text"
            onChange={(evt) => {
              const value = evt.target.value;
              setInputValue(value);
              try {
                const pk = new PublicKey(value);
                onChange(pk);
                setError(undefined);
              } catch {
                setError('Invalid address');
              }
            }}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

// A dropdown of all the available Civic Passes
const CivicPassDropdown: FC<{
  className?: string;
  previousSelected?: PublicKey;
  onPassTypeChange(value: PublicKey | undefined): void;
}> = (props) => {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const [selectedPass, setSelectedPass] = useState<CivicPass | undefined>(
    !!props.previousSelected
      ? availablePasses.find(
          (pass) => pass.value === props.previousSelected?.toBase58(),
        ) ?? other
      : defaultPass,
  );

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <div>
        <DropdownMenu.Trigger
          className={cx(
            itemStyles,
            props.className,
            open && 'border dark:border-white/40',
          )}
          ref={trigger}
        >
          <div className={labelStyles}>
            {selectedPass?.name || 'Select a Civic Pass'}
          </div>
          <div className={descriptionStyles}>
            {selectedPass?.description || ''}
          </div>
          <ChevronDownIcon className={cx(iconStyles, open && '-rotate-180')} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="dark space-y-0.5 z-20 w-full"
            sideOffset={2}
          >
            {availablePasses.map((config, i) => (
              <DropdownMenu.Item
                className={cx(
                  itemStyles,
                  'w-full',
                  'focus:outline-none',
                  'dark:focus:bg-neutral-700',
                )}
                key={i}
                onClick={() => {
                  setSelectedPass(config);
                  props.onPassTypeChange(
                    config?.value ? new PublicKey(config.value) : undefined,
                  );
                }}
              >
                <div className={labelStyles}>{config.name}</div>
                <div className={descriptionStyles}>{config.description}</div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
      {isOther(selectedPass) && (
        <ManualPassEntry
          onChange={(manualPassType) => {
            setSelectedPass(other);
            props.onPassTypeChange(manualPassType);
          }}
          manualPassType={
            props.previousSelected && selectedPass !== other
              ? props.previousSelected
              : undefined
          }
        />
      )}
    </DropdownMenu.Root>
  );
};

interface Props {
  className?: string;
  currentPassType?: PublicKey;
  onPassTypeChange(value: PublicKey | undefined): void;
}

export function CivicConfigurator(props: Props) {
  return (
    <div className={props.className}>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-24 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            What type of verification?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <CivicPassDropdown
              previousSelected={props.currentPassType}
              onPassTypeChange={props.onPassTypeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
