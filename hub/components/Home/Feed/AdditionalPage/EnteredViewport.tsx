import { useEffect, useRef, useState } from 'react';

interface Props {
  className?: string;
  onEnteredViewport?(): void;
}

export function EnteredViewport(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (ref.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const item = entries[0];

          if (!entered && item.intersectionRatio === 1) {
            setEntered(true);
            props.onEnteredViewport?.();
          }
        },
        { threshold: [1] },
      );

      observer.current.observe(ref.current);
    }

    return () => observer.current?.disconnect();
  }, [entered]);

  return <div className={props.className} ref={ref} />;
}
