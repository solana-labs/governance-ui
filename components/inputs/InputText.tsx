import Input from './Input';

const InputText = ({
  value,
  label,
  onChange,
  className,
  error = '',
  disabled,
}: {
  value: string | undefined;
  label?: string;
  onChange: (text: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="flex flex-col">
      <Input
        label={label}
        value={value ?? ""}
        className={className}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value?.toString() ?? "")}
        error={error}
        type="text"
      />
    </div>
  );
};

export default InputText;
