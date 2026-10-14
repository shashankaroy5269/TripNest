"use client";

import React, { useState } from "react";
import { adminApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  UserPlus,
  ShieldCheck,
  Hotel,
  Luggage,
  User,
  Search,
  Filter,
  Loader2,
  X,
  Lock,
  Mail,
  Phone,
} from "lucide-react";

export default function UsersTab({ users = [], onRefresh, searchQuery = "" }) {
  const { showToast } = useToast();
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "HOTEL_ADMIN",
  });

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesRole;

    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();

    return matchesRole && (name.includes(term) || email.includes(term) || phone.includes(term));
  });

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoadingId(userId);
      await adminApi.toggleUserStatus(userId);
      showToast("User status updated successfully!", "success");
      onRefresh();
    } catch (err) {
      showToast("Error updating user status: " + (err?.message || err), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createUser(newUser);
      showToast("Staff user account created successfully!", "success");
      setIsAddUserOpen(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "HOTEL_ADMIN",
      });
      onRefresh();
    } catch (err) {
      showToast("Failed to create user: " + (err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case "SUPER_ADMIN":
        return {
          icon: ShieldCheck,
          label: "Super Admin",
          color: "bg-purple-50 text-[#5B30D9] border-purple-200",
        };
      case "HOTEL_ADMIN":
        return {
          icon: Hotel,
          label: "Hotel Admin",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "TRIP_MANAGER":
        return {
          icon: Luggage,
          label: "Trip Manager",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          icon: User,
          label: "Customer",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User &amp; Staff Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered customer travelers, assign roles and provision administrator staff
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Role Filters */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            {["ALL", "CUSTOMER", "HOTEL_ADMIN", "TRIP_MANAGER", "SUPER_ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  roleFilter === r
                    ? "bg-[#5B30D9] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3.5">User Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const userId = u._id || u.id;
                  const isSuperAdmin = u.role === "SUPER_ADMIN";
                  const roleBadge = getRoleBadge(u.role);
                  const RoleIcon = roleBadge.icon;
                  const isActing = actionLoadingId === userId;

                  return (
                    <tr key={userId} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B30D9] border border-purple-200/80 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div className="font-bold text-slate-900 text-sm">
                            {u.name}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600">
                        {u.email}
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {u.phone || "—"}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.color}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {u.status || "ACTIVE"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {isSuperAdmin ? (
                          <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                            Primary Admin
                          </span>
                        ) : isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#5B30D9] inline-block" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(userId)}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                              u.status === "ACTIVE"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Block Access" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No users matching search</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your search query or role filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#5B30D9]" />
              Create Staff / User
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Provision a new operational administrator or verified customer
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@tripnest.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    <option value="HOTEL_ADMIN">HOTEL_ADMIN</option>
                    <option value="TRIP_MANAGER">TRIP_MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#5B30D9]/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
