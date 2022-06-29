import { SearchIcon } from '@heroicons/react/outline';
import { TrashIcon } from '@heroicons/react/outline';

const SearchInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col relative ${className ?? ''}`}>
      <SearchIcon className="w-5 h-5 absolute left-2.5 top-2.5 text-fgd-3" />

      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 focus:outline-none focus:border-primary-light bg-bkg-1 p-3 w-full border border-fgd-3 text-sm text-fgd-1 rounded-md h-10"
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
      />

      {value.trim().length ? (
        <TrashIcon
          className="w-5 h-5 absolute right-2.5 top-2.5 text-fgd-3 pointer hover:text-white"
          onClick={() => onChange('')}
        />
      ) : null}
    </div>
  );
};

export default SearchInput;
