import Link from 'next/link';
import Image from 'next/image';
import type { Business } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { ReputationBadge, TransparencyBadge } from '@/components/ui/Badge';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

interface BusinessCardProps {
  business: Business;
  view?: 'grid' | 'list';
}

export default function BusinessCard({ business, view = 'grid' }: BusinessCardProps) {
  if (view === 'list') {
    return (
      <Link href={`/businesses/${business.id}`} className="block">
        <div className="card-hover p-4 flex gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <MdRestaurant className="text-3xl text-orange-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {business.cuisine_type && (
                    <span className="text-xs text-gray-500">{business.cuisine_type}</span>
                  )}
                  {business.price_range && (
                    <span className="text-xs font-medium text-green-600">{business.price_range}</span>
                  )}
                </div>
              </div>
              <ReputationBadge ratingCount={business.rating_count} size="sm" />
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <StarRating score={business.rating_avg} size="sm" showScore showCount={business.rating_count} />
            </div>

            {business.address && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                <FiMapPin className="flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <TransparencyBadge score={business.transparency_score} size="sm" />
              {business.dietary_options?.slice(0, 2).map((opt) => (
                <span key={opt} className="badge badge-gray capitalize">{opt}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/businesses/${business.id}`} className="block">
      <div className="card-hover h-full flex flex-col">
        {/* Cover / Logo area */}
        <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <MdRestaurant className="text-6xl text-orange-200" />
          )}
          {/* Price range badge */}
          {business.price_range && (
            <span className="absolute top-3 right-3 badge badge-green font-bold">
              {business.price_range}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 leading-tight">{business.name}</h3>
            <ReputationBadge ratingCount={business.rating_count} size="sm" />
          </div>

          {business.cuisine_type && (
            <p className="text-xs text-gray-500 mb-2">{business.cuisine_type}</p>
          )}

          <StarRating score={business.rating_avg} size="sm" showScore showCount={business.rating_count} />

          {business.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {business.description}
            </p>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between">
            <TransparencyBadge score={business.transparency_score} size="sm" />
            {business.dietary_options && business.dietary_options.length > 0 && (
              <span className="text-xs text-gray-400">
                {business.dietary_options.slice(0, 2).join(' · ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
