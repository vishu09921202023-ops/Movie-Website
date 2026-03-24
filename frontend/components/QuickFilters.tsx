'use client';

import { SiteLink } from '@/lib/types';
import Link from 'next/link';

interface QuickFiltersProps {
  links: SiteLink[];
}

export default function QuickFilters({ links }: QuickFiltersProps) {
  const row1 = links.filter((l) => l.row === 1).sort((a, b) => a.order - b.order);
  const row2 = links.filter((l) => l.row === 2).sort((a, b) => a.order - b.order);

  if (links.length === 0) return null;

  const renderRow = (items: SiteLink[]) => (
    <div className="flex flex-wrap gap-2.5">
      {items.map((link, i) => (
        <Link
          key={link._id}
          href={link.url}
          target={link.url.startsWith('http') ? '_blank' : undefined}
          rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="px-4 py-2 rounded-lg font-semibold text-white text-sm hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg animate-fade-in-up"
          style={{ backgroundColor: link.color, animationDelay: `${i * 50}ms`, boxShadow: `0 4px 14px ${link.color}33` }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-3 my-6">
      {row1.length > 0 && renderRow(row1)}
      {row2.length > 0 && renderRow(row2)}
    </div>
  );
}
