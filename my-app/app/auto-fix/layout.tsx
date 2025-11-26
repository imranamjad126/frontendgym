// Standalone layout for auto-fix page - NO Layout wrapper, NO Header, NO Sidebar
// This page must be accessible without login
export default function AutoFixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {children}
    </div>
  );
}

