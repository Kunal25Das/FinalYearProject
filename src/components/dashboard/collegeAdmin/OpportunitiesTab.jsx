"use client";

import { useState } from "react";
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
  XCircle,
  Star,
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
  const [filterStatus, setFilterStatus] = useState("all");

  const opportunityTypes = [
    "Placement",
    "Internship",
    "Workshop",
    "Hackathon",
    "Research",
    "Scholarship",
  ];

  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: "Software Engineer - Google",
      company: "Google",
      type: "Placement",
      location: "Bangalore, India",
      salary: "₹25-35 LPA",
      deadline: "Dec 25, 2025",
      postedAt: "Dec 10, 2025",
      description:
        "Join Google as a Software Engineer and work on cutting-edge projects.",
      eligibility: "B.Tech/M.Tech CSE/IT with 7.0+ CGPA",
      departments: ["CSE", "IT"],
      applicants: 145,
      selected: 12,
      status: "active",
      featured: true,
    },
    {
      id: 2,
      title: "Data Science Intern",
      company: "Microsoft",
      type: "Internship",
      location: "Hyderabad, India",
      salary: "₹50,000/month",
      deadline: "Dec 20, 2025",
      postedAt: "Dec 5, 2025",
      description:
        "6-month internship opportunity in the Data Science team at Microsoft.",
      eligibility:
        "3rd/4th year B.Tech students with knowledge of Python and ML",
      departments: ["CSE", "IT", "ECE"],
      applicants: 230,
      selected: 0,
      status: "active",
      featured: true,
    },
    {
      id: 3,
      title: "AI/ML Workshop",
      company: "NVIDIA",
      type: "Workshop",
      location: "Online",
      salary: "Free",
      deadline: "Dec 18, 2025",
      postedAt: "Dec 1, 2025",
      description:
        "3-day intensive workshop on AI/ML with NVIDIA tools and frameworks.",
      eligibility: "Open to all engineering students",
      departments: ["All"],
      applicants: 500,
      selected: 500,
      status: "active",
      featured: false,
    },
    {
      id: 4,
      title: "Full Stack Developer",
      company: "Amazon",
      type: "Placement",
      location: "Chennai, India",
      salary: "₹20-30 LPA",
      deadline: "Dec 15, 2025",
      postedAt: "Nov 28, 2025",
      description: "Full Stack Developer role at Amazon Web Services.",
      eligibility: "B.Tech/M.Tech with strong DSA and web development skills",
      departments: ["CSE", "IT"],
      applicants: 180,
      selected: 8,
      status: "closed",
      featured: false,
    },
    {
      id: 5,
      title: "Research Fellowship",
      company: "IISc Bangalore",
      type: "Research",
      location: "Bangalore, India",
      salary: "₹40,000/month",
      deadline: "Jan 10, 2026",
      postedAt: "Dec 12, 2025",
      description: "Research fellowship in Quantum Computing at IISc.",
      eligibility: "M.Tech/PhD students with strong background in Physics/CS",
      departments: ["CSE", "ECE", "Physics"],
      applicants: 45,
      selected: 0,
      status: "active",
      featured: false,
    },
    {
      id: 6,
      title: "Smart India Hackathon 2026",
      company: "Government of India",
      type: "Hackathon",
      location: "Pan India",
      salary: "₹1,00,000 Prize",
      deadline: "Jan 15, 2026",
      postedAt: "Dec 8, 2025",
      description:
        "National level hackathon to solve real-world government problems.",
      eligibility: "All engineering students can participate in teams of 6",
      departments: ["All"],
      applicants: 120,
      selected: 0,
      status: "active",
      featured: true,
    },
  ]);

  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    company: "",
    type: "",
    location: "",
    salary: "",
    deadline: "",
    description: "",
    eligibility: "",
    departments: [],
    featured: false,
  });

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || opp.type === filterType;
    const matchesStatus = filterStatus === "all" || opp.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateOpportunity = () => {
    if (
      !newOpportunity.title ||
      !newOpportunity.company ||
      !newOpportunity.type
    )
      return;

    const opportunity = {
      id: opportunities.length + 1,
      ...newOpportunity,
      postedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      applicants: 0,
      selected: 0,
      status: "active",
    };

    setOpportunities([opportunity, ...opportunities]);
    setShowCreateModal(false);
    setNewOpportunity({
      title: "",
      company: "",
      type: "",
      location: "",
      salary: "",
      deadline: "",
      description: "",
      eligibility: "",
      departments: [],
      featured: false,
    });
  };

  const handleDeleteOpportunity = (id) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      setOpportunities(opportunities.filter((o) => o.id !== id));
    }
  };

  const handleCloseOpportunity = (id) => {
    setOpportunities(
      opportunities.map((o) => (o.id === id ? { ...o, status: "closed" } : o)),
    );
  };

  const stats = {
    total: opportunities.length,
    active: opportunities.filter((o) => o.status === "active").length,
    totalApplicants: opportunities.reduce((sum, o) => sum + o.applicants, 0),
    totalSelected: opportunities.reduce((sum, o) => sum + o.selected, 0),
  };

  const getTypeColor = (type) => {
    const colors = {
      Placement:
        "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
      Internship:
        "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      Workshop:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
      Hackathon:
        "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
      Research:
        "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
      Scholarship:
        "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    };
    return (
      colors[type] ||
      "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Post and manage placements, internships, and other opportunities
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post Opportunity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Posted
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.active}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalApplicants}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Applicants
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-purple-500">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalSelected}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Types
            </option>
            {opportunityTypes.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-white dark:bg-gray-800"
              >
                {type}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Status
            </option>
            <option value="active" className="bg-white dark:bg-gray-800">
              Active
            </option>
            <option value="closed" className="bg-white dark:bg-gray-800">
              Closed
            </option>
          </select>
        </div>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOpportunities.map((opp) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={`relative overflow-hidden ${opp.featured ? "border-l-4 border-l-yellow-500" : ""}`}
              >
                {opp.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                      {opp.company.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {opp.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getTypeColor(opp.type)}`}
                        >
                          {opp.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            opp.status === "active"
                              ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-purple-600 dark:text-purple-400 font-medium">
                        {opp.company}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {opp.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {opp.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Deadline: {opp.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {opp.applicants}
                      </p>
                      <p className="text-xs text-gray-500">Applicants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {opp.selected}
                      </p>
                      <p className="text-xs text-gray-500">Selected</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {(opp.departments[0] === "All"
                      ? ["All Departments"]
                      : opp.departments
                    ).map((dept) => (
                      <span
                        key={dept}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {opp.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloseOpportunity(opp.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteOpportunity(opp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOpportunities.length === 0 && (
          <Card className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No opportunities found matching your criteria
            </p>
          </Card>
        )}
      </div>

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Post New Opportunity"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                placeholder="e.g., Software Engineer - Google"
                value={newOpportunity.title}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company/Organization *
              </label>
              <Input
                placeholder="e.g., Google"
                value={newOpportunity.company}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    company: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={newOpportunity.type}
                onChange={(e) =>
                  setNewOpportunity({ ...newOpportunity, type: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select type
                </option>
                {opportunityTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-white dark:bg-gray-800"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <Input
                placeholder="e.g., Bangalore, India"
                value={newOpportunity.location}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    location: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary/Compensation
              </label>
              <Input
                placeholder="e.g., ₹20-30 LPA"
                value={newOpportunity.salary}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    salary: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </label>
              <Input
                type="date"
                value={newOpportunity.deadline}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    deadline: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe the opportunity..."
                value={newOpportunity.description}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eligibility
              </label>
              <Input
                placeholder="e.g., B.Tech/M.Tech CSE/IT with 7.0+ CGPA"
                value={newOpportunity.eligibility}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    eligibility: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newOpportunity.featured}
                  onChange={(e) =>
                    setNewOpportunity({
                      ...newOpportunity,
                      featured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Featured (will be highlighted)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateOpportunity}
              disabled={
                !newOpportunity.title ||
                !newOpportunity.company ||
                !newOpportunity.type
              }
            >
              Post Opportunity
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Opportunity Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedOpportunity?.title || "Opportunity Details"}
        size="lg"
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                {selectedOpportunity.company.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedOpportunity.title}
                </h3>
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  {selectedOpportunity.company}
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getTypeColor(selectedOpportunity.type)}`}
                  >
                    {selectedOpportunity.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedOpportunity.status === "active"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {selectedOpportunity.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedOpportunity.location}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Compensation</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedOpportunity.salary}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Deadline</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedOpportunity.deadline}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Posted</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedOpportunity.postedAt}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedOpportunity.description}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Eligibility
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedOpportunity.eligibility}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedOpportunity.applicants}
                </p>
                <p className="text-sm text-gray-500">Total Applicants</p>
              </div>
              <div className="text-center p-4 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {selectedOpportunity.selected}
                </p>
                <p className="text-sm text-gray-500">Selected</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
