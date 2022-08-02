import { ReactNode } from 'react-markdown/lib/react-markdown';
import Input from './Input';

const InputNumberWithMaxButton = ({
  value = '',
  label,
  onChange,
  className,
  error = '',
  disabled,
  min,
  max,
}: {
  value: ReactNode;
  label: string;
  onChange: (nb: number) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}) => {
  return (
    <div className="flex flex-col">
      <Input
        label={label}
        value={value}
        className={className}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        type="number"
        min={min}
        max={max}
      />

      {typeof max !== 'undefined' ? (
        <div
          className="hover:text-white text-fgd-2 text-xs pointer mt-2"
          onClick={() => {
            onChange(max);
          }}
        >
          Max: {max}
        </div>
      ) : null}
    </div>
  );
};

export default InputNumberWithMaxButton;
