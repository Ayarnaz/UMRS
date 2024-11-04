export function Avatar({ className = '', children, ...props }) {
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AvatarFallback({ children, className = '', ...props }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 ${className}`} {...props}>
      {children}
    </div>
  );
} 