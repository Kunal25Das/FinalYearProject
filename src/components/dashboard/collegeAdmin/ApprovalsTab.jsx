"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ApprovalsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const requestTypes = [
    { id: "all", name: "All Types" },
    { id: "club-admin", name: "Club Rep" },
    { id: "event-organizer", name: "Event Organizer" },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state status
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
      );
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest((prev) => ({ ...prev, status: "approved" }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || !selectedRequest) return;

    const id = selectedRequest.id;
    setActioningId(id);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          action: "reject",
          rejectReason: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "rejected", rejectReason: rejectReason }
            : r,
        ),
      );
      setSelectedRequest((prev) => ({
        ...prev,
        status: "rejected",
        rejectReason: rejectReason,
      }));
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || req.type === typeFilter;
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Approvals list...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load approvals</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Approvals Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review registration requests for clubs and event organizers in your
          institute.
        </p>
      </div>

      {/* Filters & Search */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests by club name, requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Filter by Type */}
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none border-none cursor-pointer"
              >
                {requestTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200 dark:border-white/10">
          <ShieldCheck className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Requests Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            No pending or processed requests match your search criteria.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border border-gray-200 dark:border-white/10 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                          {req.typeName}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                          {req.name}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          req.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : req.status === "approved"
                              ? "bg-green-500/10 border-green-500/20 text-green-500"
                              : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() +
                          req.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {req.description}
                    </p>

                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Requested By:
                        </span>
                        <span>
                          {req.requestedBy} ({req.department})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Date:
                        </span>
                        <span>{req.requestDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowDetailsModal(true);
                      }}
                      className="text-purple-500 hover:bg-purple-500/10 mr-auto flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </Button>

                    {req.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={actioningId !== null}
                          className="text-green-500 hover:bg-green-500/10 p-2 rounded-xl"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowRejectModal(true);
                          }}
                          disabled={actioningId !== null}
                          className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl"
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full">
                  {selectedRequest.typeName}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {selectedRequest.name}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedRequest.status === "pending"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : selectedRequest.status === "approved"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
              >
                {selectedRequest.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Requester
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {selectedRequest.requestedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedRequest.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedRequest.phone}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Department
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {selectedRequest.department}
                  </p>
                  <p className="text-xs text-gray-500">
                    Batch {selectedRequest.batch}
                  </p>
                </div>
              </div>

              {selectedRequest.status === "rejected" &&
                selectedRequest.rejectReason && (
                  <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
                    <h4 className="text-xs font-bold text-red-400 uppercase">
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-red-300/90 mt-1">
                      {selectedRequest.rejectReason}
                    </p>
                  </div>
                )}

              {selectedRequest.additionalInfo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    Additional Information
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {selectedRequest.additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {selectedRequest.status === "pending" && (
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <Button
                  variant="primary"
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setShowDetailsModal(false);
                  }}
                  disabled={actioningId !== null}
                >
                  Approve Request
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRejectModal(true);
                  }}
                  disabled={actioningId !== null}
                >
                  Reject Request
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Reason for Rejection"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-sm text-gray-400">
            Please provide a detailed reason for rejecting the request. The user
            will be notified of this reason via email.
          </p>

          <div>
            <textarea
              required
              rows={4}
              placeholder="e.g. Insufficient member signatures or advisor approval..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={actioningId !== null}
            >
              {actioningId ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
