'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

interface NavigationProps {
  href: string;
  label: string;
  icon: LucideIcon;
  iconColor?: string; // Tailwind color class for icon (e.g., 'text-blue-600')
  iconHoverColor?: string; // Tailwind hover color class (e.g., 'hover:text-blue-700')
}

export function Navigation({ href, label, icon: Icon, iconColor, iconHoverColor }: NavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Parse href to check for query parameters
  const [hrefPath, hrefQuery] = href.split('?');
  const hrefParams = hrefQuery ? new URLSearchParams(hrefQuery) : null;
  
  // Check if pathname matches
  const pathMatches = pathname === hrefPath || (hrefPath !== '/' && pathname.startsWith(hrefPath));
  
  // Check if query parameters match (if href has query params)
  let queryMatches = true;
  if (hrefParams) {
    hrefParams.forEach((value, key) => {
      const currentValue = searchParams.get(key);
      if (currentValue !== value) {
        queryMatches = false;
      }
    });
  } else {
    // If href has no query params, but current page has query params for /members, don't match
    // This prevents /members from being active when /members?filter=deleted is active
    if (pathname === '/members' && searchParams.toString()) {
      queryMatches = false;
    }
  }
  
  const isActive = pathMatches && queryMatches;

  // Determine icon color classes
  // When active, icon should be white to contrast with dark background
  // When inactive, use the provided iconColor or default to slate-600
  const iconColorClass = isActive 
    ? 'text-white' 
    : (iconColor || 'text-slate-600');
  
  // Hover color only applies when not active
  const iconHoverClass = isActive 
    ? '' 
    : (iconHoverColor || 'hover:text-slate-700');

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
        isActive
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className={cn('h-5 w-5', iconColorClass, iconHoverClass)} />
      <span>{label}</span>
    </Link>
  );
}




