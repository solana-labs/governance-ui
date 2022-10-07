import * as _Tooltip from '@radix-ui/react-tooltip';

interface Props {
  className?: string;
  asChild?: boolean;
  children: JSX.Element;
  message: React.ReactNode;
}

export function Tooltip(props: Props) {
  return (
    <_Tooltip.Root>
      <_Tooltip.Trigger asChild={props.asChild}>
        {props.children}
      </_Tooltip.Trigger>
      <_Tooltip.Portal>
        <_Tooltip.Content
          className="p-3 bg-white rounded shadow-xl max-w-[256px] text-center z-50"
          side="top"
        >
          <_Tooltip.Arrow className="fill-white" />
          <div className="text-neutral-700 text-xs">{props.message}</div>
        </_Tooltip.Content>
      </_Tooltip.Portal>
    </_Tooltip.Root>
  );
}
