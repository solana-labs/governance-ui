interface Props extends React.SVGAttributes<SVGElement> {}

export function DashesSvg(props: Props) {
  return (
    <svg {...props} viewBox="0 0 3 71" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 0.5L1.5 70.5" strokeWidth="2" strokeDasharray="5 4" />
    </svg>
  );
}
