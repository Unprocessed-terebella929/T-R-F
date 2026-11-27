function BaseIcon({ className = 'w-4 h-4', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function BagIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </BaseIcon>
  );
}

export function ArrowOutIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </BaseIcon>
  );
}

export function ArrowUpIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </BaseIcon>
  );
}

export function SearchIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function PlusIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcon>
  );
}

export function CloseIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </BaseIcon>
  );
}

export function TrashIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </BaseIcon>
  );
}

export function LockIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </BaseIcon>
  );
}

export function UploadIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </BaseIcon>
  );
}

export function ShieldIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </BaseIcon>
  );
}

export function RotateIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </BaseIcon>
  );
}

export function OrbitIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-24 12 12)" />
    </BaseIcon>
  );
}

export function FeatherIcon({ className }) {
  return (
    <BaseIcon className={className}>
      <path d="M20 4a6 6 0 0 0-8.5 0L5 10.5V19h8.5L20 12.5A6 6 0 0 0 20 4Z" />
      <path d="M16 8 4 20" />
    </BaseIcon>
  );
}
