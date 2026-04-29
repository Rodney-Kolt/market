'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Business } from '@/types';
import { CUISINE_TYPES, PRICE_RANGES, DIETARY_OPTIONS } from '@/lib/utils';
import { FiSave } from 'react-icons/fi';

interface BusinessFormProps {
  userId: string;
  existing?: Partial<Business>;
  onSuccess?: (business: Business) => void;
}

export default function BusinessForm({ userId, existing, onSuccess }: BusinessFormProps) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    address: existing?.address || '',
    contact_phone: existing?.contact_phone || '',
    contact_email: existing?.contact_email || '',
    cuisine_type: existing?.cuisine_type || '',
    price_range: existing?.price_range || '',
    dietary_options: existing?.dietary_options || [] as string[],
    logo_url: existing?.logo_url || '',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleDietary(value: string) {
    setForm((prev) => ({
      ...prev,
      dietary_options: prev.dietary_options.includes(value)
        ? prev.dietary_options.filter((d) => d !== value)
        : [...prev.dietary_options, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Business name is required.');
      return;
    }

    setLoading(true);

    const payload = {
      owner_id: userId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contact_email: form.contact_email.trim() || null,
      cuisine_type: form.cuisine_type || null,
      price_range: form.price_range || null,
      dietary_options: form.dietary_options.length > 0 ? form.dietary_options : null,
      logo_url: form.logo_url.trim() || null,
    };

    let result;
    if (existing?.id) {
      result = await supabase
        .from('businesses')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('businesses')
        .insert(payload)
        .select()
        .single();
    }

    setLoading(false);

    if (result.error) {
      toast.error('Failed to save business. Please try again.');
      console.error(result.error);
    } else {
      toast.success(existing?.id ? 'Business updated!' : 'Business created!');
      onSuccess?.(result.data as Business);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="label">Business Name *</label>
        <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. The Golden Fork" required />
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" placeholder="Tell customers what makes your business special…" />
      </div>

      {/* Address */}
      <div>
        <label className="label">Address</label>
        <input name="address" value={form.address} onChange={handleChange} className="input" placeholder="123 Main St, City, State" />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input name="contact_phone" value={form.contact_phone} onChange={handleChange} className="input" placeholder="+1 (555) 000-0000" type="tel" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="contact_email" value={form.contact_email} onChange={handleChange} className="input" placeholder="hello@yourbusiness.com" type="email" />
        </div>
      </div>

      {/* Cuisine & Price Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Cuisine Type</label>
          <select name="cuisine_type" value={form.cuisine_type} onChange={handleChange} className="input">
            <option value="">Select cuisine…</option>
            {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price Range</label>
          <select name="price_range" value={form.price_range} onChange={handleChange} className="input">
            <option value="">Select range…</option>
            {PRICE_RANGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Logo URL */}
      <div>
        <label className="label">Logo URL (optional)</label>
        <input name="logo_url" value={form.logo_url} onChange={handleChange} className="input" placeholder="https://…" type="url" />
      </div>

      {/* Dietary options */}
      <div>
        <label className="label">Dietary Options</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleDietary(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                form.dietary_options.includes(opt.value)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        <FiSave />
        {loading ? 'Saving…' : existing?.id ? 'Update Business' : 'Create Business'}
      </button>
    </form>
  );
}
