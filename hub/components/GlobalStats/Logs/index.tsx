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
  return <div></div>;
}
