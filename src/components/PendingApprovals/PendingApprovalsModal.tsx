import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Clock,
  Mail,
  Phone,
  Building,
  Shield,
  AlertCircle,
  Calendar,
  Sparkles,
  Search,
  Check,
  Ban
} from 'lucide-react';

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    appUsers,
    approveUser,
    rejectUser,
    primaryUserRole,
  } = useApp();

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [detailModalUser, setDetailModalUser] = useState<AppUser | null>(null);
  const [approveModalUser, setApproveModalUser] = useState<AppUser | null>(null);
  const [rejectModalUser, setRejectModalUser] = useState<AppUser | null>(null);

  // Approval Form fields
  const [assignedRole, setAssignedRole] = useState<UserRole>('salesperson');
  const [assignedBranch, setAssignedBranch] = useState('Main Store');

  // Rejection Form field
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen) return null;

  const pendingUsers = appUsers.filter((u) => u.status === 'pending');

  const openApproveDialog = (user: AppUser) => {
    setApproveModalUser(user);
    setAssignedRole(user.requestedRole || user.role || 'salesperson');
    setAssignedBranch(user.branch || 'Main Store');
  };

  const handleConfirmApproval = () => {
    if (!approveModalUser) return;
    // Security check: Administrator cannot assign Super Admin role
    if (primaryUserRole === 'administrator' && assignedRole === 'super_admin') {
      alert('Security Restriction: Administrators cannot assign the Super Administrator role.');
      return;
    }

    approveUser(approveModalUser.id, assignedRole, assignedBranch);
    setApproveModalUser(null);
  };

  const openRejectDialog = (user: AppUser) => {
    setRejectModalUser(user);
    setRejectionReason('');
  };

  const handleConfirmRejection = () => {
    if (!rejectModalUser) return;
    rejectUser(rejectModalUser.id, rejectionReason.trim());
    setRejectModalUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-slate-800 dark:to-slate-900 p-6 text-white flex items-center justify-between border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <UserCheck className="w-6 h-6 text-rose-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Pending User Registrations</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  {pendingUsers.length} Pending
                </span>
              </div>
              <p className="text-xs text-rose-100/80 mt-0.5">
                Review, approve, or reject new user registration requests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                No Pending Approvals
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                All account registration requests have been reviewed and processed. New user sign-ups will appear here for authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 tracking-wider">
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Business Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Requested Role</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                    {pendingUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{usr.fullName}</span>
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-extrabold">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#6A1B9A]" />
                            <span>{usr.businessName || usr.branch || 'Main Store'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{usr.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{usr.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 text-[#6A1B9A] dark:text-purple-300 font-black text-[11px] uppercase">
                            {usr.requestedRole ? usr.requestedRole.replace('_', ' ') : usr.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(usr.registrationDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openApproveDialog(usr)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                          </button>
                          <button
                            onClick={() => openRejectDialog(usr)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-extrabold text-xs rounded-xl border border-rose-200 dark:border-rose-900 transition inline-flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => setDetailModalUser(usr)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition inline-flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* APPROVAL CONFIGURATION DIALOG */}
        {approveModalUser && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Approve User Registration
                  </h3>
                </div>
                <button
                  onClick={() => setApproveModalUser(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{approveModalUser.fullName}</div>
                <div className="text-slate-500">{approveModalUser.email} • {approveModalUser.phone}</div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmed Role
                  </label>
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="salesperson">Sales Person</option>
                    <option value="manager">Manager</option>
                    <option value="administrator">Administrator</option>
                    {primaryUserRole === 'super_admin' && (
                      <option value="super_admin">Super Administrator</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Store Branch
                  </label>
                  <select
                    value={assignedBranch}
                    onChange={(e) => setAssignedBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Main Store">Main Store</option>
                    <option value="Lekki Branch">Lekki Branch</option>
                    <option value="Ikeja Branch">Ikeja Branch</option>
                    <option value="Victoria Island Branch">Victoria Island Branch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setApproveModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApproval}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition"
                >
                  Activate & Approve User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION DIALOG */}
        {rejectModalUser && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Reject User Registration
                  </h3>
                </div>
                <button
                  onClick={() => setRejectModalUser(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to reject the registration for <strong className="text-slate-900 dark:text-white">{rejectModalUser.fullName}</strong>?
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Unverified staff phone number or unauthorized branch request."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejection}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAILS VIEW MODAL */}
        {detailModalUser && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Registration Application Details
                  </h3>
                </div>
                <button
                  onClick={() => setDetailModalUser(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">Full Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{detailModalUser.fullName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">Business Name</span>
                  <span className="font-extrabold text-[#6A1B9A] dark:text-purple-300">{detailModalUser.businessName || detailModalUser.branch || 'Main Store'}</span>
                </div>

                {detailModalUser.businessAddress && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Business Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalUser.businessAddress}</span>
                  </div>
                )}

                {detailModalUser.businessPhone && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Business Phone</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalUser.businessPhone}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">User Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalUser.email}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">User Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalUser.phone}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">Requested Role</span>
                  <span className="font-extrabold uppercase text-[#6A1B9A] dark:text-purple-300">{detailModalUser.requestedRole ? detailModalUser.requestedRole.replace('_', ' ') : detailModalUser.role}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">Registration Date</span>
                  <span className="text-slate-500">{new Date(detailModalUser.registrationDate).toLocaleString()}</span>
                </div>

                <div className="flex justify-between pb-2">
                  <span className="text-slate-400 font-bold">Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase">
                    {detailModalUser.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDetailModalUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
