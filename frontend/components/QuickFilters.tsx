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

  return (
    <div className="space-y-4 my-6">
      {/* Row 1 */}
      {row1.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {row1.map((link) => (
            <Link
              key={link._id}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="px-4 py-2 rounded-full font-bold text-white hover:opacity-90 transition"
              style={{ backgroundColor: link.color }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Row 2 */}
      {row2.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {row2.map((link) => (
            <Link
              key={link._id}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="px-4 py-2 rounded-full font-bold text-white hover:opacity-90 transition"
              style={{ backgroundColor: link.color }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
