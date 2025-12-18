"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  BookOpen,
  Award,
  Eye,
  MoreVertical,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function DeptFacultyTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const designations = [
    { id: "all", name: "All Designations" },
    { id: "professor", name: "Professor" },
    { id: "associate", name: "Associate Professor" },
    { id: "assistant", name: "Assistant Professor" },
  ];

  const [facultyList] = useState([
    {
      id: 1,
      name: "Dr. John Smith",
      designation: "Professor",
      designationId: "professor",
      email: "john.smith@university.edu",
      phone: "+91 98765 43210",
      specialization: ["Computer Networks", "Cyber Security"],
      qualification: "Ph.D. in Computer Science, MIT",
      experience: "15 years",
      currentLoad: 12,
      maxLoad: 16,
      assignedClasses: [
        { code: "CS302", name: "Computer Networks", batch: "2022" },
        { code: "CS401", name: "Network Security", batch: "2021" },
      ],
      publications: 45,
      joinedDate: "2010",
      avatar: null,
    },
    {
      id: 2,
      name: "Prof. Sarah Wilson",
      designation: "Associate Professor",
      designationId: "associate",
      email: "sarah.wilson@university.edu",
      phone: "+91 98765 43211",
      specialization: ["Data Science", "Machine Learning"],
      qualification: "Ph.D. in Data Science, Stanford",
      experience: "10 years",
      currentLoad: 14,
      maxLoad: 16,
      assignedClasses: [
        { code: "CS102", name: "Digital Logic Design", batch: "2024" },
        { code: "CS303", name: "Data Mining", batch: "2022" },
      ],
      publications: 32,
      joinedDate: "2015",
      avatar: null,
    },
    {
      id: 3,
      name: "Dr. Mike Chen",
      designation: "Assistant Professor",
      designationId: "assistant",
      email: "mike.chen@university.edu",
      phone: "+91 98765 43212",
      specialization: ["Algorithms", "Data Structures"],
      qualification: "Ph.D. in Computer Science, CMU",
      experience: "6 years",
      currentLoad: 10,
      maxLoad: 14,
      assignedClasses: [
        { code: "CS201", name: "Data Structures", batch: "2023" },
      ],
      publications: 18,
      joinedDate: "2019",
      avatar: null,
    },
    {
      id: 4,
      name: "Prof. Emily Brown",
      designation: "Associate Professor",
      designationId: "associate",
      email: "emily.brown@university.edu",
      phone: "+91 98765 43213",
      specialization: ["Object-Oriented Programming", "Software Engineering"],
      qualification: "Ph.D. in Software Engineering, UC Berkeley",
      experience: "12 years",
      currentLoad: 8,
      maxLoad: 14,
      assignedClasses: [
        { code: "CS202", name: "Object Oriented Programming", batch: "2023" },
      ],
      publications: 28,
      joinedDate: "2013",
      avatar: null,
    },
    {
      id: 5,
      name: "Dr. Alex Kumar",
      designation: "Professor",
      designationId: "professor",
      email: "alex.kumar@university.edu",
      phone: "+91 98765 43214",
      specialization: ["Artificial Intelligence", "Deep Learning"],
      qualification: "Ph.D. in AI, IIT Bombay",
      experience: "18 years",
      currentLoad: 12,
      maxLoad: 16,
      assignedClasses: [
        { code: "CS401", name: "Machine Learning", batch: "2021" },
        { code: "CS402", name: "Deep Learning", batch: "2021" },
      ],
      publications: 67,
      joinedDate: "2007",
      avatar: null,
    },
    {
      id: 6,
      name: "Dr. Lisa Park",
      designation: "Assistant Professor",
      designationId: "assistant",
      email: "lisa.park@university.edu",
      phone: "+91 98765 43215",
      specialization: ["Database Systems", "Big Data"],
      qualification: "Ph.D. in Information Systems, NUS",
      experience: "4 years",
      currentLoad: 6,
      maxLoad: 14,
      assignedClasses: [
        { code: "CS301", name: "Database Management", batch: "2022" },
      ],
      publications: 12,
      joinedDate: "2021",
      avatar: null,
    },
  ]);

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesDesignation =
      designationFilter === "all" || f.designationId === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  const openDetails = (faculty) => {
    setSelectedFaculty(faculty);
    setShowDetailsModal(true);
  };

  const stats = {
    total: facultyList.length,
    professors: facultyList.filter((f) => f.designationId === "professor")
      .length,
    associates: facultyList.filter((f) => f.designationId === "associate")
      .length,
    assistants: facultyList.filter((f) => f.designationId === "assistant")
      .length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Department Faculty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage faculty members
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Faculty
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-purple-500">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.professors}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Professors</p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.associates}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Associate Prof.
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.assistants}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assistant Prof.
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {designations.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Faculty Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredFaculty.map((faculty, index) => (
            <motion.div
              key={faculty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {faculty.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {faculty.name}
                    </h3>
                    <p className="text-sm text-purple-500">
                      {faculty.designation}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {faculty.specialization.slice(0, 2).map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Teaching Load</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {faculty.currentLoad}/{faculty.maxLoad} hrs
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Classes</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {faculty.assignedClasses.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${faculty.email}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4 text-gray-500" />
                      </a>
                      <a
                        href={`tel:${faculty.phone}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetails(faculty)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFaculty.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No faculty members found
          </p>
        </Card>
      )}

      {/* Faculty Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedFaculty(null);
        }}
        title="Faculty Details"
        size="lg"
      >
        {selectedFaculty && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedFaculty.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.name}
                </h3>
                <p className="text-purple-500">{selectedFaculty.designation}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Since {selectedFaculty.joinedDate}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedFaculty.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedFaculty.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Qualification
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedFaculty.qualification}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Experience
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedFaculty.experience}
                </p>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">
                Specialization
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFaculty.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-500/20 text-purple-500 text-sm rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-xl text-center">
                <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.currentLoad}/{selectedFaculty.maxLoad}
                </p>
                <p className="text-xs text-gray-500">Teaching Hours</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl text-center">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.assignedClasses.length}
                </p>
                <p className="text-xs text-gray-500">Classes</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-xl text-center">
                <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.publications}
                </p>
                <p className="text-xs text-gray-500">Publications</p>
              </div>
            </div>

            {/* Assigned Classes */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">
                Assigned Classes
              </p>
              <div className="space-y-2">
                {selectedFaculty.assignedClasses.map((cls, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cls.code}
                      </span>
                      <span className="text-gray-500 ml-2">- {cls.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Batch {cls.batch}
                    </span>
                  </div>
                ))}
                {selectedFaculty.assignedClasses.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No classes assigned
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
