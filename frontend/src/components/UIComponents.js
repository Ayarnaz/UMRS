import React from 'react';

// Button component
export const Button = ({ children, ...props }) => (
  <button {...props} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    {children}
  </button>
);

// Avatar component
export const Avatar = ({ src, alt, fallback }) => (
  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
    {src ? (
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-500">{fallback}</div>
    )}
  </div>
);

export const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="w-full h-full object-cover" />;

export const AvatarFallback = ({ children }) => (
  <div className="w-full h-full flex items-center justify-center text-gray-500">{children}</div>
);

// Input component
export const Input = (props) => (
  <input {...props} className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
);

// Switch component
export const Switch = ({ checked, onChange }) => (
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'transform translate-x-6' : ''}`}></div>
    </div>
  </label>
);
