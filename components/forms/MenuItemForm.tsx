'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { MenuItem } from '@/types';
import { DIETARY_OPTIONS } from '@/lib/utils';
import { FiSave, FiX } from 'react-icons/fi';

const MENU_CATEGORIES = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks', 'Specials', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface MenuItemFormProps {
  businessId: string;
  existing?: Partial<MenuItem>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MenuItemForm({ businessId, existing, onSuccess, onCancel }: MenuItemFormProps) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    price: existing?.price?.toString() || '',
    category: existing?.category || '',
    is_available_today: existing?.is_available_today ?? false,
    dietary_tags: existing?.dietary_tags || [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function toggleTag(value: string) {
    setForm((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(value)
        ? prev.dietary_tags.filter((t) => t !== value)
        : [...prev.dietary_tags, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Item name is required.');
      return;
    }

    setLoading(true);

    const payload = {
      business_id: businessId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: form.price ? parseFloat(form.price) : null,
      category: form.category || null,
      is_available_today: form.is_available_today,
      dietary_tags: form.dietary_tags.length > 0 ? form.dietary_tags : null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    let error;
    if (existing?.id) {
      ({ error } = await db.from('menu_items').update(payload).eq('id', existing.id));
    } else {
      ({ error } = await db.from('menu_items').insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error('Failed to save menu item.');
      console.error(error);
    } else {
      toast.success(existing?.id ? 'Item updated!' : 'Item added!');
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Item Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Grilled Salmon" required />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            <option value="">Select category…</option>
            {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input resize-none" placeholder="Brief description of the item…" />
      </div>

      <div>
        <label className="label">Price ($)</label>
        <input name="price" value={form.price} onChange={handleChange} className="input" placeholder="0.00" type="number" step="0.01" min="0" />
      </div>

      <div>
        <label className="label">Dietary Tags</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleTag(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.dietary_tags.includes(opt.value)
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="is_available_today"
          checked={form.is_available_today}
          onChange={handleChange}
          className="w-4 h-4 rounded accent-orange-500"
        />
        <span className="text-sm font-medium text-gray-700">Available Today</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          <FiSave />
          {loading ? 'Saving…' : existing?.id ? 'Update Item' : 'Add Item'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            <FiX /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}
