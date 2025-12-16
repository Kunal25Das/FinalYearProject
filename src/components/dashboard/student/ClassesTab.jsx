"use client";

import { useState } from "react";
import { FileText, Download, Upload, CheckCircle, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ClassesTab() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const classes = [
    {
      id: 1,
      name: "Computer Networks",
      code: "CS401",
      faculty: "Dr. Smith",
      credits: 4,
      color: "from-blue-500 to-cyan-500",
      notices: [
        {
          id: 1,
          title: "Assignment Due",
          date: "2025-12-20",
          content: "Submit assignment on network protocols",
        },
      ],
      resources: [
        {
          id: 1,
          name: "Lecture 1 - Introduction.pdf",
          size: "2.4 MB",
          uploadDate: "2025-12-10",
        },
        {
          id: 2,
          name: "Network Protocols.pdf",
          size: "5.1 MB",
          uploadDate: "2025-12-12",
        },
      ],
      assignments: [
        {
          id: 1,
          title: "Network Protocol Analysis",
          dueDate: "2025-12-20",
          status: "pending",
        },
        {
          id: 2,
          title: "Router Configuration",
          dueDate: "2025-12-15",
          status: "submitted",
        },
      ],
    },
    {
      id: 2,
      name: "Data Structures",
      code: "CS302",
      faculty: "Prof. Johnson",
      credits: 3,
      color: "from-purple-500 to-pink-500",
      notices: [],
      resources: [
        {
          id: 1,
          name: "Trees and Graphs.pdf",
          size: "3.2 MB",
          uploadDate: "2025-12-08",
        },
      ],
      assignments: [
        {
          id: 1,
          title: "Binary Tree Implementation",
          dueDate: "2025-12-18",
          status: "submitted",
        },
      ],
    },
    {
      id: 3,
      name: "Database Systems",
      code: "CS403",
      faculty: "Dr. Williams",
      credits: 4,
      color: "from-orange-500 to-red-500",
      notices: [
        {
          id: 1,
          title: "Lab Cancelled",
          date: "2025-12-16",
          content: "Tomorrow's lab is cancelled",
        },
      ],
      resources: [
        {
          id: 1,
          name: "SQL Basics.pdf",
          size: "1.8 MB",
          uploadDate: "2025-12-05",
        },
        {
          id: 2,
          name: "Normalization.pdf",
          size: "2.1 MB",
          uploadDate: "2025-12-09",
        },
      ],
      assignments: [],
    },
  ];

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Classes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {classes.length} classes this semester
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => handleClassClick(classItem)}
          >
            <Card hover className="cursor-pointer relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${classItem.color}`}
              />
              <div className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.code} • {classItem.credits} Credits
                    </p>
                  </div>
                  {classItem.notices.length > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {classItem.faculty}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Resources
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {classItem.resources.length}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Assignments
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {classItem.assignments.length}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Notices
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {classItem.notices.length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Class Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClass?.name}
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Class Info */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Course Code
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedClass.code}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faculty
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedClass.faculty}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Credits
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedClass.credits}
                </p>
              </div>
            </div>

            {/* Notices */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notices
              </h3>
              {selectedClass.notices.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No notices yet
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedClass.notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {notice.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notice.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {notice.date}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resources
              </h3>
              <div className="space-y-2">
                {selectedClass.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {resource.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {resource.size} • Uploaded {resource.uploadDate}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="!p-2">
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Assignments
              </h3>
              {selectedClass.assignments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No assignments yet
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedClass.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {assignment.status === "submitted" ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {assignment.dueDate}
                          </p>
                        </div>
                      </div>
                      {assignment.status === "pending" && (
                        <Button variant="primary" className="!py-2 !px-4">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
