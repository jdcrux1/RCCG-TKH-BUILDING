export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem 1.5rem' }}>
        {children}
      </div>
    </div>
  );
}