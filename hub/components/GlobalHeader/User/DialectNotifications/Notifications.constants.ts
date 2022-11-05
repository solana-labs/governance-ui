import {
  defaultVariables,
  IncomingThemeVariables,
} from '@dialectlabs/react-ui';
import { PublicKey } from '@solana/web3.js';

export const REALMS_PUBLIC_KEY = new PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj',
);

export const themeVariables: IncomingThemeVariables = {
  dark: {
    bellButton: `${defaultVariables.dark.bellButton} bg-transparent !shadow-none text-neutral-700 h-10 rounded-full w-10 hover:bg-bkg-3`,
    iconButton: `${defaultVariables.dark.iconButton} hover:opacity-100 bg-transparent`,
    adornmentButton: `${defaultVariables.dark.adornmentButton} bg-sky-500 hover:!bg-sky-400 active:bg-sky-500 rounded transition-colors`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      ...defaultVariables.dark.colors,
      label: 'text-white/80',
      toggleThumb: 'bg-white',
      toggleBackground: 'bg-zinc-300',
      toggleBackgroundActive: 'bg-sky-500',
    },
    textStyles: {
      ...defaultVariables.dark.textStyles,
      input: `${defaultVariables.dark.textStyles.input}`,
    },
    outlinedInput: `${defaultVariables.dark.outlinedInput} h-12 rounded focus-within:border-sky-500`,
    disabledButton: `${defaultVariables.dark.disabledButton} border-sky-500 font-bold rounded-full border-fgd-3 text-fgd-3 cursor-not-allowed`,
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14 rounded-md`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
  },
  light: {
    bellButton: `${defaultVariables.light.bellButton} w-10 h-10 border-none bg-transparent shadow-none text-neutral-600 active:bg-neutral-300 hover:bg-neutral-200`,
    iconButton: `${defaultVariables.light.iconButton} hover:opacity-100 bg-transparent`,
    buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
    adornmentButton: `${defaultVariables.light.adornmentButton} bg-sky-500 hover:!bg-sky-400 active:bg-sky-500 rounded transition-colors`,
    colors: {
      ...defaultVariables.light.colors,
      label: 'text-neutral-900',
      toggleThumb: 'bg-white',
      toggleBackground: 'bg-zinc-300',
      toggleBackgroundActive: 'bg-sky-500',
    },
    textStyles: {
      input: `${defaultVariables.light.textStyles.input} text-neutral-900 placeholder:text-fgd-3`,
      body: `${defaultVariables.light.textStyles.body} text-neutral-900`,
      small: `${defaultVariables.light.textStyles.small} text-neutral-900`,
      xsmall: `${defaultVariables.light.textStyles.xsmall} text-neutral-900`,
      label: `${defaultVariables.light.textStyles.label} dt-text-sm dt-font-bold`,
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} h-12 rounded text-neutral-900 focus-within:border-sky-500`,
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:shadow-md`,
    modalWrapper: `${defaultVariables.light.modalWrapper} sm:top-14`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
  },
};
