'use client';

import type { MenuItem } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { AvailableTodayBadge } from '@/components/ui/Badge';
import { FiDollarSign, FiUser } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

interface MenuItemCardProps {
  item: MenuItem;
  isOwner?: boolean;
  onToggleAvailability?: (id: string, current: boolean) => void;
  onReportPrice?: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  isOwner = false,
  onToggleAvailability,
  onReportPrice,
}: MenuItemCardProps) {
  const latestReport = item.latest_price_report;

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{item.name}</h4>
            {item.is_available_today && <AvailableTodayBadge />}
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
          )}
          {item.dietary_tags && item.dietary_tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {item.dietary_tags.map((tag) => (
                <span key={tag} className="badge badge-green capitalize text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Price column */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-gray-900 text-lg">{formatPrice(item.price)}</p>
          {item.category && (
            <span className="text-xs text-gray-400">{item.category}</span>
          )}
        </div>
      </div>

      {/* Price Snapshot */}
      {latestReport && (
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 text-xs">
          <FiDollarSign className="text-amber-600 flex-shrink-0" />
          <span className="text-amber-800">
            Customer reported: <strong>{formatPrice(latestReport.reported_price)}</strong>
            {' '}· {timeAgo(latestReport.created_at)}
          </span>
          {latestReport.location_verified && (
            <span className="flex items-center gap-0.5 text-green-700 font-semibold ml-auto">
              <MdVerified /> Verified
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        {isOwner && onToggleAvailability && (
          <button
            onClick={() => onToggleAvailability(item.id, item.is_available_today)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              item.is_available_today
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.is_available_today ? '✅ Mark Unavailable' : '⬜ Mark Available Today'}
          </button>
        )}
        {!isOwner && onReportPrice && (
          <button
            onClick={() => onReportPrice(item)}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
          >
            <FiUser /> Report Price
          </button>
        )}
      </div>
    </div>
  );
}
