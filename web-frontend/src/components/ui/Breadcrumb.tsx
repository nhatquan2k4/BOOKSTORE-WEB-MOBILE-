import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Trang chủ
          </Link>
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.href ? (
                <Link href={item.href} className="hover:text-blue-600 transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium line-clamp-1">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
