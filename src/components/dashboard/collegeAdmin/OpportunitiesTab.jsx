"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle,
  Award,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function OpportunitiesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "Placement",
    location: "On-Campus",
    salary: "",
    deadline: "",
    description: "",
    eligibility: "",
    departmentsText: "CSE, IT",
  });

  const opportunityTypes = [
    "Placement",
    "Internship",
    "Workshop",
    "Hackathon",
    "Research",
    "Scholarship",
  ];

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpportunities(data.opportunities || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActioningId("create");

    const departments = formData.departmentsText
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .filter((d) => d !== "");

    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          type: formData.type,
          location: formData.location,
          salary: formData.salary,
          deadline: formData.deadline,
          description: formData.description,
          eligibility: formData.eligibility,
          departments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCreateModal(false);
      setFormData({
        title: "",
        company: "",
        type: "Placement",
        location: "On-Campus",
        salary: "",
        deadline: "",
        description: "",
        eligibility: "",
        departmentsText: "CSE, IT",
      });
      fetchOpportunities(); // Reload list
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/opportunities?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpportunities((prev) =>
        prev.filter((opp) => opp._id !== id && opp.id !== id),
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || opp.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Job Boards & Placements...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load opportunities</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Placement & Career Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Publish recruitment drives, internships, scholarships, and academic
            workshops.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          <span>Publish Opportunity</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterType === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              All Types
            </button>
            {opportunityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200 dark:border-white/10">
          <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Opportunities Posted
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Publish job profiles or internship details to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredOpportunities.map((opp) => (
              <motion.div
                key={opp._id || opp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border border-gray-200 dark:border-white/10 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                          {opp.type}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                          {opp.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-400 mt-0.5">
                          {opp.company}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {opp.description}
                    </p>

                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{opp.salary}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          Deadline:{" "}
                          {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setShowViewModal(true);
                      }}
                      className="text-purple-400 hover:bg-purple-500/10 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(opp._id || opp.id)}
                      disabled={actioningId !== null}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Publish Opportunity"
      >
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"
        >
          <Input
            label="Job / Event Title"
            type="text"
            placeholder="e.g. Software Engineer Intern"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="bg-white/5 border-white/10 text-white focus:border-purple-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company / Institution"
              type="text"
              placeholder="e.g. Google"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {opportunityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              type="text"
              placeholder="e.g. Bangalore, India"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <Input
              label="Stipend / Salary Package"
              type="text"
              placeholder="e.g. ₹50,000/month or 25 LPA"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Application Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <Input
              label="Target Departments"
              type="text"
              placeholder="e.g. CSE, IT, ECE"
              value={formData.departmentsText}
              onChange={(e) =>
                setFormData({ ...formData, departmentsText: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />
          </div>

          <Input
            label="Eligibility criteria"
            type="text"
            placeholder="e.g. B.Tech/M.Tech CSE with 7.0+ CGPA"
            value={formData.eligibility}
            onChange={(e) =>
              setFormData({ ...formData, eligibility: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white focus:border-purple-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a brief role outline and skills requirements..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
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
              disabled={actioningId !== null}
            >
              {actioningId === "create" ? "Posting..." : "Publish Drive"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Opportunity Details"
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full">
                  {selectedOpportunity.type}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {selectedOpportunity.title}
                </h3>
                <p className="text-sm font-semibold text-gray-400 mt-0.5">
                  {selectedOpportunity.company}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-500">Job Description</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                  {selectedOpportunity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Package / Stipend
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {selectedOpportunity.salary}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Location
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {selectedOpportunity.location}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Eligibility
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {selectedOpportunity.eligibility}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">
                    Deadline
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {new Date(
                      selectedOpportunity.deadline,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedOpportunity.departments &&
                selectedOpportunity.departments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-500">
                      Target Departments
                    </h4>
                    <div className="flex gap-2 mt-1.5">
                      {selectedOpportunity.departments.map((dept) => (
                        <span
                          key={dept}
                          className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-purple-400"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="text-end">
              <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
