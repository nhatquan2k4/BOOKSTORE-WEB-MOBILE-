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
    <div className="container mx-auto px-4 py-3">
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600 transition">
          Trang chủ
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-600 transition">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
