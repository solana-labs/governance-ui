import ChevronRight from '@carbon/icons-react/lib/ChevronRight';
import { useEffect, useState } from 'react';

import cx from '@hub/lib/cx';

export enum Severity {
  Normal,
  Warning,
  Error,
}

export interface Message {
  severity: Severity;
  text: string;
}

export class Logger {
  private readonly cbs: ((messages: Message[]) => void)[] = [];
  messages: Message[] = [];

  onUpdate(cb: (messages: Message[]) => void) {
    this.cbs.push(cb);
  }

  log(text: string) {
    const message = { text, severity: Severity.Normal };
    this.messages.push(message);
    this.publish();
    console.log(message);
  }

  warn(text: string) {
    const message = { text, severity: Severity.Warning };
    this.messages.push(message);
    this.publish();
    console.warn(message);
  }

  error(text: string) {
    const message = { text, severity: Severity.Error };
    this.messages.push(message);
    this.publish();
    console.error(message);
  }

  private publish() {
    for (const cb of this.cbs) {
      cb(this.messages);
    }
  }
}

interface Props {
  className?: string;
  logger: Logger;
}

export function Logs(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<Message[]>([]);

  useEffect(() => {
    props.logger.onUpdate(setLogs);
  }, [props.logger]);

  return (
    <section className={props.className}>
      <button
        className={cx(
          'flex',
          'items-center',
          'text-sky-500',
          'text-xs',
          'transition-colors',
          'hover:text-sky-400',
        )}
        onClick={() => setExpanded((cur) => !cur)}
      >
        <div>{expanded ? 'Hide Logs' : 'View Logs'}</div>
        <ChevronRight
          className={cx(
            'h-4',
            'text-current',
            'transition-transform',
            'w-4',
            expanded && 'rotate-90',
          )}
        />
      </button>
      <div
        className={cx(
          'bg-slate-900',
          'flex-col-reverse',
          'flex',
          'font-mono',
          'mt-2',
          'px-4',
          'rounded-md',
          'space-y-1',
          'text-sm',
          'transition-all',
          expanded ? 'h-[600px]' : 'h-0',
          expanded ? 'overflow-y-auto' : 'overflow-y-hidden',
          expanded ? 'py-2' : 'py-0',
        )}
      >
        {logs
          .slice()
          .reverse()
          .map((log, i) => (
            <div
              key={i}
              className={cx(
                'text-neutral-200',
                log.severity === Severity.Warning && 'text-yellow-200',
                log.severity === Severity.Error && 'text-rose-400',
              )}
            >
              {log.text}
            </div>
          ))}
      </div>
    </section>
  );
}
