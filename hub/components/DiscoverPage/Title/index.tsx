interface Props {
  className?: string;
}

export function Title(props: Props) {
  return (
    <div className={props.className}>
      <div className="text-3xl font-medium text-neutral-900">
        Discover the next big project.
      </div>
      <div className="text-3xl font-medium text-neutral-500">
        Become a part of the community and join the conversation.
      </div>
    </div>
  );
}
