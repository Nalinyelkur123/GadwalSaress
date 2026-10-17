import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  requireApprovedSeller?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApprovedSeller = false,
}) => {
  const { user, seller, isLoading, quickSwitchRole, setIsAuthModalOpen } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-serif text-xs text-charcoal-600">Verifying authorized marketplace session...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Visitor Check
  if (!user) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-warm-lg">
          <ShieldAlert size={36} className="mx-auto text-brand-700" />
          <h2 className="font-serif font-bold text-xl text-charcoal-900">Sign In Required</h2>
          <p className="text-xs text-charcoal-600">
            Please sign in or create an account to view this private page.
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
            >
              Sign In to Your Account
            </button>
            <Link to="/" className="block text-xs text-charcoal-500 hover:underline pt-2">
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role Authorization Check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-warm-lg">
          <ShieldAlert size={36} className="mx-auto text-red-600" />
          <h2 className="font-serif font-bold text-xl text-charcoal-900">Access Restricted</h2>
          <p className="text-xs text-charcoal-600">
            Your current account role (<b>{user.role}</b>) does not have authorization to access this area.
          </p>
          <div className="space-y-2 pt-2">
            {allowedRoles.includes('admin') && (
              <button
                onClick={() => quickSwitchRole('admin')}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
              >
                Switch to Super Admin
              </button>
            )}
            {allowedRoles.includes('seller') && (
              <button
                onClick={() => quickSwitchRole('seller')}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
              >
                Switch to Master Weaver
              </button>
            )}
            <Link to="/" className="block text-xs text-charcoal-500 hover:underline pt-2">
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Seller Status & KYC Guard
  if (requireApprovedSeller && user.role === 'seller' && seller) {
    if (seller.status === 'suspended') {
      return (
        <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-red-200 max-w-md w-full text-center space-y-4 shadow-warm-lg">
            <AlertTriangle size={36} className="mx-auto text-red-600" />
            <h2 className="font-serif font-bold text-xl text-charcoal-900">Account Suspended</h2>
            <p className="text-xs text-charcoal-600">
              Your weaver storefront has been suspended by marketplace compliance. Please reach out to <a href="mailto:support@gadwalweaves.in" className="text-brand-700 font-bold underline">support@gadwalweaves.in</a>.
            </p>
          </div>
        </div>
      );
    }

    if (seller.kyc_status === 'pending') {
      return (
        <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-amber-200 max-w-lg w-full text-center space-y-4 shadow-warm-lg">
            <Clock size={40} className="mx-auto text-amber-600" />
            <h2 className="font-serif font-bold text-xl text-charcoal-900">Application Under Review</h2>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Welcome, <b>{seller.business_name}</b>! Your pit-loom artisan application has been submitted and is currently being audited by marketplace operations.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg text-left text-xs text-amber-900 space-y-1">
              <p><b>Status:</b> Pending Administrative Approval</p>
              <p><b>Registered Loom:</b> {seller.pickup_address?.street_address}, {seller.location}</p>
              <p><b>Estimated Review:</b> Within 24-48 business hours</p>
            </div>
            <p className="text-[11px] text-charcoal-500">
              Once approved, you will gain full access to publish sarees, manage pit loom inventory, and fulfill orders.
            </p>
            <div className="pt-2">
              <Link to="/" className="text-xs text-brand-700 font-semibold hover:underline">
                ← Browse Customer Storefront in the meantime
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (seller.kyc_status === 'rejected') {
      return (
        <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-red-200 max-w-md w-full text-center space-y-4 shadow-warm-lg">
            <AlertTriangle size={36} className="mx-auto text-red-600" />
            <h2 className="font-serif font-bold text-xl text-charcoal-900">Corrections Required</h2>
            <p className="text-xs text-charcoal-600">
              Your weaver application was not approved during initial inspection. Please review your details and contact our onboarding team.
            </p>
            <Link to="/seller/profile" className="px-4 py-2 bg-brand-700 text-white rounded text-xs font-semibold inline-block">
              Update Profile Details
            </Link>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
