'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { MenuItem } from '@/types';
import { FiDollarSign } from 'react-icons/fi';

interface ReportPriceFormProps {
  menuItem?: MenuItem | null;
  businessId: string;
  userId: string;
  onSuccess?: () => void;
}

export default function ReportPriceForm({ menuItem, businessId, userId, onSuccess }: ReportPriceFormProps) {
  const [price, setPrice] = useState('');
  const [serviceName, setServiceName] = useState(menuItem?.name || '');
  const [locationVerified, setLocationVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    if (!serviceName.trim()) {
      toast.error('Please describe the service or product.');
      return;
    }

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('price_reports').insert({
      business_id: businessId,
      menu_item_id: menuItem?.id || null,
      reporter_id: userId,
      reported_price: parsedPrice,
      location_verified: locationVerified,
      service_name: serviceName.trim(),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit price report.');
      console.error(error);
    } else {
      toast.success('Price reported! Thanks for contributing.');
      setPrice('');
      setServiceName('');
      setLocationVerified(false);
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-orange-50 rounded-xl p-3">
        <p className="text-xs text-orange-600 font-semibold">Report a price for this business</p>
        <p className="text-xs text-gray-500 mt-0.5">Help the community know what to expect.</p>
      </div>

      {/* Service / product name */}
      <div>
        <label className="label">Service or Product *</label>
        <input
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="e.g. Oil change, Haircut, Coffee, Consultation"
          className="input"
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="label">Price You Saw *</label>
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="input pl-8"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={locationVerified}
          onChange={(e) => setLocationVerified(e.target.checked)}
          className="w-4 h-4 rounded accent-orange-500"
        />
        <span className="text-sm text-gray-700">I saw this price in person at the location</span>
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Submitting…' : 'Report Price'}
      </button>
    </form>
  );
}
