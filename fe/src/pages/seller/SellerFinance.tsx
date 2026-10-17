import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const SellerFinance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller/finance');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount) return;
    setRequesting(true);
    try {
      await api.post('/seller/finance/request-payout', {
        amount: parseFloat(payoutAmount),
      });
      alert('Payout request submitted successfully! Funds will be transferred upon admin verification.');
      setPayoutModalOpen(false);
      setPayoutAmount('');
      fetchFinance();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to request payout.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-charcoal-500">Loading ledger...</div>;
  }

  const { ledger, payouts, summary } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Financial Ledger & Payouts</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Transparent transaction breakdown, platform commission tracking, and bank settlements.
        </p>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Total Gross Sales</span>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            ₹{summary.grossSales.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-charcoal-500">Commission deducted: ₹{summary.totalCommission.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Available Payout Balance</span>
          <div className="font-serif font-bold text-2xl text-brand-900">
            ₹{summary.availableBalance.toLocaleString('en-IN')}
          </div>
          <button
            onClick={() => setPayoutModalOpen(true)}
            disabled={summary.availableBalance <= 0}
            className="text-xs font-bold text-brand-700 hover:underline disabled:text-charcoal-400 block pt-1"
          >
            Withdraw to Bank Account →
          </button>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Total Settled Payouts</span>
          <div className="font-serif font-bold text-2xl text-emerald-700">
            ₹{summary.totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Transferred to registered bank account</p>
        </div>
      </div>

      {/* TRANSACTION LEDGER TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-ivory-300 font-serif font-bold text-sm text-charcoal-900">
          Order Commission Ledger
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Gross Sales</th>
              <th className="p-4">Platform Fee (10%)</th>
              <th className="p-4">Net Payout</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {ledger.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-ivory-50">
                <td className="p-4 text-charcoal-500">{new Date(entry.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-mono font-medium">{entry.order_id}</td>
                <td className="p-4 font-semibold">₹{entry.gross_sales.toLocaleString('en-IN')}</td>
                <td className="p-4 text-charcoal-500">-₹{entry.platform_commission.toLocaleString('en-IN')}</td>
                <td className="p-4 font-serif font-bold text-brand-900">₹{entry.net_earnings.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    entry.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                    entry.status === 'available' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {entry.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WITHDRAWAL MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-sm w-full p-6 border border-ivory-300 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">Request Bank Payout</h3>
            <p className="text-xs text-charcoal-500">
              Available balance: <b>₹{summary.availableBalance.toLocaleString('en-IN')}</b>
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  max={summary.availableBalance}
                  min={1}
                  required
                  placeholder="Enter amount"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
                >
                  {requesting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
