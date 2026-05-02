const cardStyle = {
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  padding: '1.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  fontSize: '0.875rem'
};

export function MetricCard({ title, value, subtitle, icon: Icon }: { 
  title: string; 
  value: string; 
  subtitle?: string;
  icon?: any;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        {Icon && <Icon style={{ width: 20, height: 20, color: '#9ca3af' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.5rem' }}>
        <p style={{ fontSize: '1.5rem font-semibold color: #111827' }}>{value}</p>
      </div>
      {subtitle && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>{subtitle}</p>}
    </div>
  );
}

export function DataTable({ headers, children }: { 
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {headers.map((header, i) => (
              <th 
                key={i} 
                style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: 'white' }}>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ background: '#f3f4f6', borderRadius: '50%', padding: '1rem', width: 64, height: 64, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ width: 32, height: 32, color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>No data</h3>
      <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>{message}</p>
    </div>
  );
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  className = ''
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    minHeight: '44px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  };
  
  const variants = {
    primary: { background: '#2563eb', color: 'white' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db' },
    ghost: { background: 'transparent', color: '#374151' }
  };
  
  const style = { ...baseStyle, ...variants[variant] };
  
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export function Input({ 
  label, 
  name, 
  type = 'text',
  required = false,
  placeholder,
  defaultValue
}: { 
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        style={inputStyle}
      />
    </div>
  );
}

export function Select({ 
  label, 
  name, 
  options,
  required = false,
  defaultValue = ''
}: { 
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
        {label}
      </label>
      <select
        name={name}
        id={name}
        required={required}
        defaultValue={defaultValue}
        style={inputStyle}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}