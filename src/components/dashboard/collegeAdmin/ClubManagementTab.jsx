"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Search,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  XOctagon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function ClubManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    studentRepresentativeId: "",
    facultyCoordinatorId: "",
  });

  const fetchClubsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load clubs data");

      setClubs(data.clubs || []);
      setStudents(data.students || []);
      setFaculty(data.faculty || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubsData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.studentRepresentativeId ||
      !formData.facultyCoordinatorId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setActioningId("create");
    try {
      const res = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create club");

      setShowCreateModal(false);
      setFormData({
        name: "",
        description: "",
        studentRepresentativeId: "",
        facultyCoordinatorId: "",
      });
      fetchClubsData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDisband = async (id) => {
    if (
      !confirm(
        "Are you sure you want to disband this club? This action is permanent and will revert the student representative's administrative permissions.",
      )
    ) {
      return;
    }

    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/clubs?id=${id}&action=disband`, {
        method: "PUT",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disband club");

      fetchClubsData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.description &&
        club.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || club.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Clubs Directory...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load clubs</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="w-8 h-8 text-purple-500" />
            <span>Clubs & Societies</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Charter new campus clubs, assign coordinators, and manage chartered
            organizations.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Charter Club
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by club name or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Status:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Chartered (Active)</option>
            <option value="disbanded">Disbanded</option>
          </select>
        </div>
      </div>

      {/* Clubs Grid View */}
      {filteredClubs.length === 0 ? (
        <Card className="border border-gray-200 dark:border-white/10 text-center py-16">
          <Building className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No Clubs Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No chartered organizations match your active search terms or
            statuses.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const isDisbanded = club.status === "disbanded";
            return (
              <Card
                key={club._id}
                className="border border-gray-200 dark:border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                      {club.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDisbanded
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}
                    >
                      {club.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {club.description || "No charter description provided."}
                  </p>

                  <div className="space-y-2 border-t border-gray-100 dark:border-white/5 pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400 block">Student Rep</span>
                        <span className="text-white font-medium">
                          {club.studentRepresentative?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400 block">
                          Faculty Coordinator
                        </span>
                        <span className="text-white font-medium">
                          {club.facultyCoordinator?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isDisbanded && (
                  <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleDisband(club._id)}
                      disabled={actioningId !== null}
                      className="w-full text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/10"
                    >
                      <XOctagon className="w-4 h-4" />
                      <span>Disband Club</span>
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Charter Club Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Charter New Campus Club"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Club Name"
            type="text"
            placeholder="e.g. Google Developer Student Clubs (GDSC)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <Input
            label="Club Description"
            type="text"
            placeholder="Enter objective and details of the club"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Appoint Student Representative
            </label>
            <select
              value={formData.studentRepresentativeId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  studentRepresentativeId: e.target.value,
                })
              }
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-955 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="" className="text-gray-950 dark:text-white">
                Select Student
              </option>
              {students.map((s) => (
                <option
                  key={s._id}
                  value={s._id}
                  className="text-gray-950 dark:text-white"
                >
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Appoint Faculty Coordinator
            </label>
            <select
              value={formData.facultyCoordinatorId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  facultyCoordinatorId: e.target.value,
                })
              }
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-955 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="" className="text-gray-950 dark:text-white">
                Select Faculty
              </option>
              {faculty.map((f) => (
                <option
                  key={f._id}
                  value={f._id}
                  className="text-gray-955 dark:text-white"
                >
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={actioningId === "create"}
            >
              {actioningId === "create" ? "Chartering..." : "Charter Club"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
