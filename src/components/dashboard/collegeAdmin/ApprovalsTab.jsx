"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Calendar,
  Clock,
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

  const requestTypes = [
    { id: "all", name: "All Types" },
    { id: "club-admin", name: "Club Admin" },
    { id: "event-organizer", name: "Event Organizer" },
  ];

  const [requests, setRequests] = useState([
    {
      id: 1,
      type: "club-admin",
      typeName: "Club Admin",
      name: "Robotics Club",
      description:
        "A club dedicated to building robots and participating in competitions like Robocon.",
      requestedBy: "John Doe",
      email: "john.doe@university.edu",
      phone: "+91 98765 43210",
      department: "Computer Science",
      batch: "2023",
      requestDate: "Dec 17, 2025",
      status: "pending",
      documents: ["proposal.pdf", "constitution.pdf"],
      additionalInfo:
        "We have 25 interested members and faculty advisor Dr. Smith has agreed to guide us.",
    },
    {
      id: 2,
      type: "event-organizer",
      typeName: "Event Organizer",
      name: "TechFest 2026",
      description:
        "Annual technical festival featuring hackathons, workshops, and tech talks.",
      requestedBy: "Sarah Wilson",
      email: "sarah.wilson@university.edu",
      phone: "+91 98765 43211",
      department: "Electronics",
      batch: "2022",
      requestDate: "Dec 16, 2025",
      status: "pending",
      documents: ["event_plan.pdf", "budget.xlsx"],
      additionalInfo:
        "Expected footfall: 5000+ students from various colleges.",
    },
    {
      id: 3,
      type: "club-admin",
      typeName: "Club Admin",
      name: "Photography Club",
      description:
        "A creative space for photography enthusiasts to learn and showcase their work.",
      requestedBy: "Mike Chen",
      email: "mike.chen@university.edu",
      phone: "+91 98765 43212",
      department: "Arts",
      batch: "2024",
      requestDate: "Dec 15, 2025",
      status: "pending",
      documents: ["proposal.pdf"],
      additionalInfo:
        "We plan to organize monthly photo walks and exhibitions.",
    },
    {
      id: 4,
      type: "club-admin",
      typeName: "Club Admin",
      name: "AI Research Club",
      description:
        "Focus on AI/ML research projects and paper reading sessions.",
      requestedBy: "Alex Kumar",
      email: "alex.kumar@university.edu",
      phone: "+91 98765 43213",
      department: "Computer Science",
      batch: "2022",
      requestDate: "Dec 10, 2025",
      status: "approved",
      documents: ["proposal.pdf", "research_plan.pdf"],
      additionalInfo: "Faculty advisors: Dr. Lee and Dr. Patel.",
      approvedDate: "Dec 12, 2025",
      approvedBy: "Admin",
    },
    {
      id: 5,
      type: "event-organizer",
      typeName: "Event Organizer",
      name: "Cultural Night",
      description: "Inter-college cultural competition.",
      requestedBy: "Emily Brown",
      email: "emily.brown@university.edu",
      phone: "+91 98765 43214",
      department: "Management",
      batch: "2023",
      requestDate: "Dec 8, 2025",
      status: "rejected",
      documents: ["event_plan.pdf"],
      additionalInfo: "Need auditorium booking.",
      rejectedDate: "Dec 9, 2025",
      rejectedBy: "Admin",
      rejectionReason:
        "Insufficient budget planning. Please resubmit with detailed financial breakdown.",
    },
  ]);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || req.type === typeFilter;
    const matchesStatus = req.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApprove = (request) => {
    setRequests(
      requests.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: "approved",
              approvedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              approvedBy: "Admin",
            }
          : r,
      ),
    );
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    setRequests(
      requests.map((r) =>
        r.id === selectedRequest.id
          ? {
              ...r,
              status: "rejected",
              rejectedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              rejectedBy: "Admin",
              rejectionReason: rejectReason,
            }
          : r,
      ),
    );

    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Approvals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve club admin and event organizer requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`text-center cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.pending}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </Card>
        <Card
          className={`text-center cursor-pointer transition-all ${statusFilter === "approved" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setStatusFilter("approved")}
        >
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.approved}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
        </Card>
        <Card
          className={`text-center cursor-pointer transition-all ${statusFilter === "rejected" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => setStatusFilter("rejected")}
        >
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
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
              placeholder="Search by name or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {requestTypes.map((type) => (
                <option
                  key={type.id}
                  value={type.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.type === "club-admin"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-blue-500/20 text-blue-500"
                        }`}
                      >
                        {request.typeName}
                      </span>
                      {request.status === "pending" && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {request.status === "approved" && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {request.status === "rejected" && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {request.requestedBy}
                      </span>
                      <span>{request.department}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {request.requestDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      onClick={() => viewDetails(request)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {request.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          className="text-green-500 hover:bg-green-500/10"
                          onClick={() => handleApprove(request)}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => openRejectModal(request)}
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <Card className="text-center py-12">
            <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No {statusFilter} requests found
            </p>
          </Card>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRequest(null);
        }}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRequest.type === "club-admin"
                    ? "bg-purple-500/20 text-purple-500"
                    : "bg-blue-500/20 text-blue-500"
                }`}
              >
                {selectedRequest.typeName}
              </span>
              {selectedRequest.status === "approved" && (
                <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                  Approved on {selectedRequest.approvedDate}
                </span>
              )}
              {selectedRequest.status === "rejected" && (
                <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">
                  Rejected on {selectedRequest.rejectedDate}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedRequest.name}
            </h2>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase">Requested By</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.requestedBy}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Department</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.department}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.phone}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedRequest.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Additional Information
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedRequest.additionalInfo}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.documents.map((doc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>

            {selectedRequest.status === "rejected" &&
              selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                    Rejection Reason
                  </h4>
                  <p className="text-red-600 dark:text-red-400/80">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

            <div className="flex gap-3 pt-4">
              {selectedRequest.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openRejectModal(selectedRequest);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedRequest);
                      setShowDetailsModal(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
          setRejectReason("");
        }}
        title="Reject Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
              <p className="text-red-700 dark:text-red-400">
                You are about to reject the request for{" "}
                <strong>{selectedRequest.name}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
