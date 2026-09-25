type PageHeaderProps = { title: string; lead?: string };

export const PageHeader = ({ title, lead }: PageHeaderProps) => (
  <header className="mb-6">
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
    {lead && <p className="mt-2 max-w-2xl text-muted">{lead}</p>}
  </header>
);
