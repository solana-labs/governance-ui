import SearchIcon from '@carbon/icons-react/lib/Search';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import * as Separator from '@radix-ui/react-separator';
import {
  cloneElement,
  forwardRef,
  useRef,
  useState,
  ForwardedRef,
  ForwardRefRenderFunction,
} from 'react';

import cx from '@hub/lib/cx';

export interface Choice<T> {
  key: string;
  value: T;
}

interface Props<T> {
  className?: string;
  choices: Choice<T>[];
  selected?: string;
  sideOffset?: number;
  filter(text: string, choice: Choice<T>): boolean;
  renderItem(option: Choice<T>): JSX.Element;
  renderTrigger?(option: Choice<T> | undefined, isOpen: boolean): JSX.Element;
  onChange?(item: Choice<T>): void;
}

interface TypeaheadSelect {
  <T>(props: Props<T>, ref: HTMLButtonElement): ReturnType<
    ForwardRefRenderFunction<Props<T>, HTMLButtonElement>
  >;
}

export const TypeaheadSelect: TypeaheadSelect = forwardRef(
  function TypeaheadSelect<T>(
    props: Props<T>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedChoice = props.choices.find(
      (choice) => choice.key === props.selected,
    );

    const choices = props.choices.filter((choice) =>
      props.filter(filter, choice),
    );

    const renderTrigger = props.renderTrigger || props.renderItem;
    const trigger = renderTrigger(selectedChoice, open);

    return (
      <Dropdown.Root
        open={open}
        onOpenChange={(open) => {
          if (open) {
            setTimeout(() => {
              inputRef.current?.focus();
            });
          }

          setOpen(open);
        }}
      >
        <Dropdown.Trigger ref={ref}>
          {cloneElement(trigger, {
            className: cx(
              'rounded',
              'text-left',
              'transition-colors',
              'hover:bg-neutral-200',
              trigger.props.className,
              props.className,
            ),
          })}
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content
            align="start"
            sideOffset={props.sideOffset}
            className={cx(
              'drop-shadow-lg',
              'bg-white',
              'overflow-hidden',
              'rounded',
              'w-48',
              'z-50',
            )}
          >
            <div
              className={cx(
                'flex',
                'gap-x-2',
                'grid-cols-[16px,1fr]',
                'grid',
                'items-center',
                'pl-2',
                'pr-4',
                'py-3',
              )}
              onSelect={(e) => {
                e.stopPropagation();
                e.preventDefault();
                inputRef.current?.focus();
              }}
            >
              <SearchIcon className="h-4 fill-neutral-700 w-4 " />
              <input
                className="border-none outline-none text-sm text-neutral-900 w-full"
                placeholder="Find Realms"
                ref={inputRef}
                tabIndex={1}
                value={filter}
                onChange={(e) => {
                  setFilter(e.currentTarget.value);
                  e.currentTarget.focus();
                }}
              />
            </div>
            <Separator.Root className="h-[1px] bg-neutral-300 w-ful" />
            <div className="max-h-[308px] overflow-y-auto">
              {choices.map((choice) => (
                <button
                  className={cx(
                    'cursor-pointer',
                    'outline-none',
                    'text-left',
                    'transition-colors',
                    'w-full',
                    'hover:bg-neutral-300',
                    choice.key === props.selected && 'bg-neutral-200',
                  )}
                  key={choice.key}
                  tabIndex={1}
                  onClick={() => {
                    props.onChange?.(choice);
                    setOpen(false);
                  }}
                >
                  {props.renderItem(choice)}
                </button>
              ))}
            </div>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    );
  },
);
