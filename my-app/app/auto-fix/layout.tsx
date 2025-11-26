// No layout wrapper for auto-fix page - make it completely standalone
export default function AutoFixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

