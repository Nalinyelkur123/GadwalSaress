import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

export const AdminFinance: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/finance/payouts');
      setPayouts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'paid' | 'rejected') => {
    const txRef = status === 'paid' ? `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}` : undefined;
    try {
      await api.put(`/admin/finance/payouts/${id}/status`, {
        status,
        transaction_ref: txRef,
      });
      alert(`Payout request marked as ${status}!`);
      fetchPayouts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update payout.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Seller Payouts & Treasury CRM</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Approve and settle artisan earnings, verify bank IFSC details, and audit transfers.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Weaver Business</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Bank Account & IFSC</th>
              <th className="p-4">Date Requested</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Settlement Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500">No payout requests pending.</td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="hover:bg-ivory-50">
                  <td className="p-4 font-serif font-bold text-charcoal-900">{p.seller_name}</td>
                  <td className="p-4 font-serif font-bold text-base text-brand-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <p className="font-mono">{p.bank_account_number}</p>
                    <p className="text-[10px] text-charcoal-500">IFSC: {p.bank_ifsc} • {p.bank_beneficiary}</p>
                  </td>
                  <td className="p-4 text-charcoal-500">{new Date(p.requested_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'requested' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {p.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'paid')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold"
                        >
                          Approve & Pay
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-[11px] font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.transaction_ref && (
                      <span className="font-mono text-[10px] text-charcoal-500 block">Ref: {p.transaction_ref}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
