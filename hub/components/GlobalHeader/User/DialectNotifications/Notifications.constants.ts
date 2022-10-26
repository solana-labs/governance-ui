import {
  defaultVariables,
  IncomingThemeVariables,
} from '@dialectlabs/react-ui';
import * as anchor from '@project-serum/anchor';

export const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj',
);

export const themeVariables: IncomingThemeVariables = {
  dark: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    button: `${defaultVariables.dark.button} border-none bg-primary-light border-primary-light font-bold rounded-full hover:bg-fgd-1 hover:opacity-100`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      bg: 'bg-bkg-1',
      toggleBackgroundActive: 'bg-primary-light',
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} focus-within:bg-bkg-3 focus-within:border-primary-light`,
    disabledButton: `${defaultVariables.dark.disabledButton} border-primary-light font-bold rounded-full border-fgd-3 text-fgd-3 cursor-not-allowed`,
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14 rounded-md`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
  },
  light: {
    bellButton: `${defaultVariables.light.bellButton} w-10 h-10 border-none bg-transparent shadow-none text-neutral-900 active:bg-neutral-300 hover:bg-neutral-200`,
    iconButton: `${defaultVariables.light.iconButton}`,
    button: `${defaultVariables.light.button} border-none bg-primary-light border-primary-light font-bold rounded-full hover:bg-neutral-900 hover:opacity-100`,
    buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
    colors: defaultVariables.light.colors,
    textStyles: {
      input: `${defaultVariables.light.textStyles.input} text-neutral-900 placeholder:text-fgd-3`,
      body: `${defaultVariables.light.textStyles.body} text-neutral-900`,
      small: `${defaultVariables.light.textStyles.small} text-neutral-900`,
      xsmall: `${defaultVariables.light.textStyles.xsmall}  text-neutral-900`,
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} text-neutral-900 focus-within:bg-transparent focus-within:border-primary-light`,
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
  },
};
