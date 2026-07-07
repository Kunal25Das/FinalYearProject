"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  ShieldAlert,
  Building2,
  Globe,
  Mail,
  MapPin,
  User,
  Search,
  RefreshCw,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SuperAdminRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load requests");
      }
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

  const handleApprove = async (requestId) => {
    setActioningId(requestId);
    try {
      const res = await fetch("/api/admin/approve-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve request");
      }
      // Remove from list
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (
      !confirm("Are you sure you want to reject this institute signup request?")
    )
      return;
    setActioningId(requestId);
    try {
      const res = await fetch("/api/admin/reject-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject request");
      }
      // Remove from list
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Institute Registration Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve pending college and university setups on
            UniVerse.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 text-gray-500 hover:text-white hover:bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 self-start transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by institute name, admin name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 flex gap-3 items-center">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No Pending Requests
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no pending registrations matching your search filter.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredRequests.map((req) => (
            <Card
              key={req._id}
              className="border border-gray-200 dark:border-white/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {req.name}
                    </h3>
                    {req.website && (
                      <a
                        href={req.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-purple-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Globe className="w-4 h-4" />
                        {req.website}
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{req.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>
                      <strong>Admin:</strong> {req.adminName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{req.adminEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                <Button
                  variant="primary"
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                  onClick={() => handleApprove(req._id)}
                  disabled={actioningId !== null}
                >
                  <Check className="w-5 h-5" />
                  {actioningId === req._id ? "Approve..." : "Approve"}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 rounded-xl flex items-center gap-2"
                  onClick={() => handleReject(req._id)}
                  disabled={actioningId !== null}
                >
                  <X className="w-5 h-5" />
                  {actioningId === req._id ? "Reject..." : "Reject"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
