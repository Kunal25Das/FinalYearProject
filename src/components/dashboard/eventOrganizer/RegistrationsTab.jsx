"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Eye,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { eventRequestService } from "@/lib/services/eventRequestService";
import { useAuth } from "@/contexts/AuthContext";

export default function RegistrationsTab() {
  const { userProfile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const clubId = userProfile?.joinedClubs[0];

  useEffect(() => {
    if (!clubId) return;

    const load = async () => {
      setLoading(true);
      try {
        const docs = await eventRequestService.getClubRequests(clubId);
        const mapped = docs.map((doc) => ({
          id: doc.$id,
          eventId: doc.eventId,
          event: doc.eventName,
          name: doc.studentName,
          email: doc.studentEmail,
          status: doc.status,
          registeredAt: new Date(doc.requestedAt).toLocaleString(),
        }));
        setRegistrations(mapped);
      } catch (err) {
        console.error("Failed to load registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clubId, userProfile]);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent =
      selectedEvent === "all" || reg.eventId === selectedEvent;
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleStatusChange = async (regId, newStatus) => {
    setActionId(regId);
    try {
      if (newStatus === "accepted") {
        await eventRequestService.approve(regId);
      } else if (newStatus === "rejected") {
        await eventRequestService.reject(regId);
      }
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === regId ? { ...reg, status: newStatus } : reg,
        ),
      );
    } catch (err) {
      console.error("Failed to update registration status:", err);
      alert(err.message);
    } finally {
      setActionId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-green-500/20 text-green-600 dark:text-green-400",
          icon: CheckCircle,
          label: "Confirmed",
        };
      case "pending":
        return {
          color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
          icon: Clock,
          label: "Pending",
        };
      case "attended":
        return {
          color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
          icon: CheckCircle,
          label: "Attended",
        };
      case "cancelled":
        return {
          color: "bg-red-500/20 text-red-600 dark:text-red-400",
          icon: XCircle,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
          icon: Clock,
          label: status,
        };
    }
  };

  const stats = {
    total: registrations.length,
    accepted: registrations.filter((r) => r.status === "accepted").length,
    pending: registrations.filter((r) => r.status === "pending").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  const events = [
    { id: "all", name: "All Events" },
    ...Array.from(
      new Map(
        registrations.map((r) => [r.eventId, { id: r.eventId, name: r.event }]),
      ).values(),
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Event Registrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage participant registrations
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Registrations
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.accepted}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.rejected}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {events.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {event.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-white dark:bg-gray-800">
                All Status
              </option>
              <option value="accepted" className="bg-white dark:bg-gray-800">
                Accepted
              </option>
              <option value="pending" className="bg-white dark:bg-gray-800">
                Pending
              </option>
              <option value="rejected" className="bg-white dark:bg-gray-800">
                Rejected
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* Registrations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Participant
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Event
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Registered
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredRegistrations.map((reg, index) => {
                  const statusConfig = getStatusConfig(reg.status);
                  const StatusIcon = statusConfig.icon;
                  const isActing = actionId === reg.id;

                  return (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {reg.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {reg.name}
                            </p>
                            <p className="text-sm text-gray-500">{reg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 dark:text-white">
                          {reg.event}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {reg.registeredAt}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="py-1! px-2!"
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="py-1! px-2!"
                            onClick={() =>
                              (window.location.href = `mailto:${reg.email}`)
                            }
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          {reg.status === "pending" && (
                            <>
                              <Button
                                variant="primary"
                                className="py-1! px-3! text-sm!"
                                disabled={isActing}
                                onClick={() =>
                                  handleStatusChange(reg.id, "accepted")
                                }
                              >
                                {isActing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Accept"
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                className="py-1! px-3! text-sm! text-red-600"
                                disabled={isActing}
                                onClick={() =>
                                  handleStatusChange(reg.id, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No registrations found
            </p>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Registration Details"
      >
        {selectedRegistration && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                {selectedRegistration.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedRegistration.name}
                </h3>
                <p className="text-gray-500">{selectedRegistration.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Event
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRegistration.event}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Registered At
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRegistration.registeredAt}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedRegistration.status).color}`}
                >
                  {getStatusConfig(selectedRegistration.status).label}
                </span>
              </div>
            </div>

            {selectedRegistration.status === "pending" && (
              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Update Status
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={actionId === selectedRegistration.id}
                    onClick={async () => {
                      await handleStatusChange(
                        selectedRegistration.id,
                        "accepted",
                      );
                      setSelectedRegistration({
                        ...selectedRegistration,
                        status: "accepted",
                      });
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-red-500!"
                    disabled={actionId === selectedRegistration.id}
                    onClick={async () => {
                      await handleStatusChange(
                        selectedRegistration.id,
                        "rejected",
                      );
                      setSelectedRegistration({
                        ...selectedRegistration,
                        status: "rejected",
                      });
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
