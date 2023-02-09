import { useCallback, useState } from 'react';

export enum CreationProgressState {
  Complete = 'Complete',
  Error = 'Error',
  Processing = 'Processing',
  Ready = 'Ready',
}

export interface CreationComplete {
  state: CreationProgressState.Complete;
  transactionsCompleted: number;
}

export interface CreationError {
  state: CreationProgressState.Error;
  error: Error;
}

export interface CreationProcessing {
  state: CreationProgressState.Processing;
  totalTransactions: number;
  transactionsCompleted: number;
  transactionsRemaining: number;
}

export interface CreationReady {
  state: CreationProgressState.Ready;
}

export type CreationProgress =
  | CreationComplete
  | CreationError
  | CreationProcessing
  | CreationReady;

export function useProposalCreationProgress() {
  const [progress, setProgress] = useState<CreationProgress>({
    state: CreationProgressState.Ready,
  });

  const afterBatchSign = useCallback(
    (signedTransactionCount: number) => {
      setProgress({
        state: CreationProgressState.Processing,
        totalTransactions: signedTransactionCount,
        transactionsCompleted: 0,
        transactionsRemaining: signedTransactionCount,
      });
    },
    [setProgress],
  );

  const afterAllTxConfirmed = useCallback(() => {
    setProgress((cur) => ({
      state: CreationProgressState.Complete,
      transactionsCompleted:
        cur.state === CreationProgressState.Processing
          ? cur.totalTransactions
          : 0,
    }));
  }, [setProgress]);

  const afterEveryTxConfirmation = useCallback(() => {
    setProgress((cur) => ({
      state: CreationProgressState.Processing,
      totalTransactions:
        cur.state === CreationProgressState.Processing
          ? cur.totalTransactions
          : 0,
      transactionsCompleted:
        cur.state === CreationProgressState.Processing
          ? cur.transactionsCompleted + 1
          : 0,
      transactionsRemaining:
        cur.state === CreationProgressState.Processing
          ? cur.transactionsRemaining - 1
          : 0,
    }));
  }, [setProgress]);

  const onError = useCallback(
    (error: any) => {
      setProgress({
        state: CreationProgressState.Error,
        error: error instanceof Error ? error : new Error(error),
      });
    },
    [setProgress],
  );

  return {
    progress,
    callbacks: {
      afterBatchSign,
      afterAllTxConfirmed,
      afterEveryTxConfirmation,
      onError,
    },
  };
}
