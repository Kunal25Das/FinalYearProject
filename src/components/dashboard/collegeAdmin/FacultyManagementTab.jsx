"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  Award,
  BookOpen,
  UserCheck,
  Upload,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");

  const departments = [
    { id: "cse", name: "Computer Science & Engineering" },
    { id: "ece", name: "Electronics & Communication" },
    { id: "me", name: "Mechanical Engineering" },
    { id: "ce", name: "Civil Engineering" },
    { id: "ee", name: "Electrical Engineering" },
    { id: "it", name: "Information Technology" },
  ];

  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "HOD",
  ];

  const [faculty, setFaculty] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Sharma",
      email: "rajesh.sharma@university.edu",
      phone: "+91 98765 43210",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      designation: "HOD",
      qualification: "Ph.D. in Computer Science",
      specialization: "Machine Learning, Data Science",
      experience: "15 years",
      joinedAt: "Jan 2010",
      classesAssigned: 4,
      status: "active",
      avatar: "RS",
    },
    {
      id: 2,
      name: "Dr. Priya Patel",
      email: "priya.patel@university.edu",
      phone: "+91 98765 43211",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      designation: "Professor",
      qualification: "Ph.D. in Software Engineering",
      specialization: "Software Architecture, Design Patterns",
      experience: "12 years",
      joinedAt: "Aug 2012",
      classesAssigned: 3,
      status: "active",
      avatar: "PP",
    },
    {
      id: 3,
      name: "Prof. Amit Kumar",
      email: "amit.kumar@university.edu",
      phone: "+91 98765 43212",
      department: "ECE",
      departmentFull: "Electronics & Communication",
      designation: "HOD",
      qualification: "Ph.D. in Electronics",
      specialization: "VLSI Design, Embedded Systems",
      experience: "18 years",
      joinedAt: "Jun 2006",
      classesAssigned: 2,
      status: "active",
      avatar: "AK",
    },
    {
      id: 4,
      name: "Dr. Meera Singh",
      email: "meera.singh@university.edu",
      phone: "+91 98765 43213",
      department: "ME",
      departmentFull: "Mechanical Engineering",
      designation: "Associate Professor",
      qualification: "Ph.D. in Thermal Engineering",
      specialization: "Heat Transfer, Thermodynamics",
      experience: "10 years",
      joinedAt: "Mar 2014",
      classesAssigned: 5,
      status: "active",
      avatar: "MS",
    },
    {
      id: 5,
      name: "Mr. Vikram Rao",
      email: "vikram.rao@university.edu",
      phone: "+91 98765 43214",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      designation: "Assistant Professor",
      qualification: "M.Tech in Computer Science",
      specialization: "Web Technologies, Cloud Computing",
      experience: "5 years",
      joinedAt: "Jul 2019",
      classesAssigned: 6,
      status: "active",
      avatar: "VR",
    },
    {
      id: 6,
      name: "Dr. Sunita Verma",
      email: "sunita.verma@university.edu",
      phone: "+91 98765 43215",
      department: "IT",
      departmentFull: "Information Technology",
      designation: "Professor",
      qualification: "Ph.D. in Information Systems",
      specialization: "Database Systems, Data Mining",
      experience: "14 years",
      joinedAt: "Feb 2010",
      classesAssigned: 3,
      status: "on-leave",
      avatar: "SV",
    },
  ]);

  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    qualification: "",
    specialization: "",
    experience: "",
  });

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDepartment === "all" ||
      f.department.toLowerCase() === filterDepartment;
    const matchesDesig =
      filterDesignation === "all" || f.designation === filterDesignation;
    return matchesSearch && matchesDept && matchesDesig;
  });

  const handleAddFaculty = () => {
    if (
      !newFaculty.name ||
      !newFaculty.email ||
      !newFaculty.department ||
      !newFaculty.designation
    )
      return;

    const dept = departments.find((d) => d.id === newFaculty.department);
    const member = {
      id: faculty.length + 1,
      name: newFaculty.name,
      email: newFaculty.email,
      phone: newFaculty.phone || "Not provided",
      department: newFaculty.department.toUpperCase(),
      departmentFull: dept?.name || newFaculty.department,
      designation: newFaculty.designation,
      qualification: newFaculty.qualification || "Not specified",
      specialization: newFaculty.specialization || "Not specified",
      experience: newFaculty.experience || "New",
      joinedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      classesAssigned: 0,
      status: "active",
      avatar: newFaculty.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };

    setFaculty([member, ...faculty]);
    setShowAddModal(false);
    setNewFaculty({
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience: "",
    });
  };

  const handleDeleteFaculty = (id) => {
    if (confirm("Are you sure you want to remove this faculty member?")) {
      setFaculty(faculty.filter((f) => f.id !== id));
    }
  };

  const stats = {
    totalFaculty: faculty.length,
    activeFaculty: faculty.filter((f) => f.status === "active").length,
    hods: faculty.filter((f) => f.designation === "HOD").length,
    avgExperience: Math.round(
      faculty.reduce((sum, f) => sum + parseInt(f.experience) || 0, 0) /
        faculty.length,
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Faculty Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage faculty accounts across all departments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalFaculty}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Faculty
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.activeFaculty}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center border-l-4 border-l-purple-500">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.hods}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">HODs</p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.avgExperience}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg. Years Exp.
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Departments
            </option>
            {departments.map((dept) => (
              <option
                key={dept.id}
                value={dept.id}
                className="bg-white dark:bg-gray-800"
              >
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Designations
            </option>
            {designations.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-gray-800">
                {d}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Faculty Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredFaculty.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {member.designation}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      member.status === "active"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {member.status === "active" ? "Active" : "On Leave"}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building className="w-4 h-4" />
                    <span>{member.departmentFull}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Award className="w-4 h-4" />
                    <span>{member.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{member.classesAssigned} classes assigned</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedFaculty(member);
                      setShowViewModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => handleDeleteFaculty(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFaculty.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No faculty members found matching your criteria
          </p>
        </Card>
      )}

      {/* Add Faculty Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Faculty"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                placeholder="e.g., Dr. John Doe"
                value={newFaculty.name}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="faculty@university.edu"
                value={newFaculty.email}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={newFaculty.phone}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                value={newFaculty.department}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, department: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select department
                </option>
                {departments.map((dept) => (
                  <option
                    key={dept.id}
                    value={dept.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Designation *
              </label>
              <select
                value={newFaculty.designation}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, designation: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select designation
                </option>
                {designations.map((d) => (
                  <option
                    key={d}
                    value={d}
                    className="bg-white dark:bg-gray-800"
                  >
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualification
              </label>
              <Input
                placeholder="e.g., Ph.D. in Computer Science"
                value={newFaculty.qualification}
                onChange={(e) =>
                  setNewFaculty({
                    ...newFaculty,
                    qualification: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specialization
              </label>
              <Input
                placeholder="e.g., Machine Learning, Data Science"
                value={newFaculty.specialization}
                onChange={(e) =>
                  setNewFaculty({
                    ...newFaculty,
                    specialization: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience
              </label>
              <Input
                placeholder="e.g., 10 years"
                value={newFaculty.experience}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, experience: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> The faculty member will receive login
              credentials via email. Default password will be set which they can
              change on first login.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddFaculty}
              disabled={
                !newFaculty.name ||
                !newFaculty.email ||
                !newFaculty.department ||
                !newFaculty.designation
              }
            >
              Add Faculty
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Faculty Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Faculty Details"
        size="lg"
      >
        {selectedFaculty && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                {selectedFaculty.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.name}
                </h3>
                <p className="text-purple-600 dark:text-purple-400">
                  {selectedFaculty.designation}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFaculty.departmentFull}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFaculty.email}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Phone</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFaculty.phone}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Qualification</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFaculty.qualification}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFaculty.experience}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl col-span-2">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Specialization</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFaculty.specialization}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-linear-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {selectedFaculty.classesAssigned}
                </p>
                <p className="text-sm text-gray-500">Classes Assigned</p>
              </div>
              <div className="text-center p-4 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {selectedFaculty.status === "active" ? "Active" : "Leave"}
                </p>
                <p className="text-sm text-gray-500">Status</p>
              </div>
              <div className="text-center p-4 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {selectedFaculty.joinedAt}
                </p>
                <p className="text-sm text-gray-500">Joined</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
