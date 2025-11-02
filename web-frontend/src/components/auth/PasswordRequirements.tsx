import React from 'react';
import { CheckIcon } from '@/components/ui';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  const requirements = [
    { test: password.length >= 6, label: 'Ít nhất 6 ký tự' },
    { test: /[A-Z]/.test(password), label: 'Có ít nhất 1 chữ hoa' },
    { test: /[a-z]/.test(password), label: 'Có ít nhất 1 chữ thường' },
    { test: /\d/.test(password), label: 'Có ít nhất 1 số' },
  ];

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <p className="text-sm font-medium text-gray-900 mb-2">Yêu cầu mật khẩu:</p>
      <ul className="text-sm text-gray-600 space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckIcon isActive={req.test} />
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
