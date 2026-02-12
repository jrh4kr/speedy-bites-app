import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export const FetchTest: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats || []);
        const items = await api.getMenuItems();
        setMenu(items || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Loading remote data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 bg-card rounded-md shadow-sm">
      <h3 className="font-semibold mb-2">Fetch Test (API)</h3>
      <div className="mb-3">
        <strong>Categories:</strong>
        <ul className="list-disc list-inside">
          {categories.map((c: any) => (
            <li key={c.id}>{c.name} {c.display_order ? `(#${c.display_order})` : ''}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Menu (first 6):</strong>
        <ul className="list-disc list-inside">
          {menu.slice(0, 6).map((m: any) => (
            <li key={m.id}>{m.name} — {m.price}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FetchTest;
