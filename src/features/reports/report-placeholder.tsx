type ReportPlaceholderProps = {
  title: string;
};

export function ReportPlaceholder({ title }: ReportPlaceholderProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">Reports are coming soon.</p>
    </main>
  );
}
