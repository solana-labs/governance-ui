interface Props extends React.SVGAttributes<SVGElement> {}

export function ExternalLink(props: Props) {
  return (
    <svg {...props} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 2V3H12.293L9 6.293L9.707 7L13 3.707V7H14V2H9Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5C3 4.44772 3.44772 4 4 4H7V5H4V12H11V9H12V12C12 12.5523 11.5523 13 11 13H4C3.44772 13 3 12.5523 3 12V5Z"
      />
    </svg>
  );
}
