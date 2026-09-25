import { useEffect, useRef } from "react";

type PageHeaderProps = {
  title: string;
  lead?: string;
  /** Перевести фокус на заголовок при открытии: после перехода фокус не теряется в body. */
  focusOnMount?: boolean;
};

export const PageHeader = ({ title, lead, focusOnMount }: PageHeaderProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus();
  }, [focusOnMount]);

  return (
    <header className="mb-6">
      <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight focus:outline-none sm:text-3xl">
        {title}
      </h1>
      {lead && <p className="mt-2 max-w-2xl text-muted">{lead}</p>}
    </header>
  );
};
