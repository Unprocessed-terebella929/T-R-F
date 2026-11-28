export function Reveal({ children, className = '' }) {
  return <div className={`reveal-visible ${className}`}>{children}</div>;
}
