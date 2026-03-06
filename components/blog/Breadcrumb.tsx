import { Fragment } from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-gray-400">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-forest transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 line-clamp-1">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
