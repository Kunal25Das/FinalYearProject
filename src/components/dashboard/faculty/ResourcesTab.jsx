"use client";

import { useState } from "react";
import {
  Upload,
  Search,
  FolderOpen,
  Download,
  Eye,
  Trash2,
  Plus,
  BookOpen,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ResourcesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    classId: "",
    type: "notes",
  });

  const myClasses = [
    { id: "all", name: "All Classes" },
    { id: "1", name: "Data Structures (CS-A 2024)" },
    { id: "2", name: "Algorithm Design (CS-B 2024)" },
    { id: "3", name: "Database Systems (CS-A 2023)" },
    { id: "4", name: "Computer Networks (CS-C 2024)" },
  ];

  const resourceTypes = [
    { value: "all", label: "All Types", icon: "📁" },
    { value: "notes", label: "Lecture Notes", icon: "📝" },
    { value: "slides", label: "Slides/PPT", icon: "📊" },
    { value: "code", label: "Code Examples", icon: "💻" },
    { value: "assignment", label: "Assignment", icon: "📋" },
    { value: "video", label: "Video Link", icon: "🎥" },
  ];

  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Week 1 - Introduction to Data Structures",
      type: "notes",
      classId: "1",
      className: "Data Structures",
      date: "Dec 10, 2025",
      size: "2.4 MB",
      downloads: 45,
    },
    {
      id: 2,
      title: "Linked List Implementation",
      type: "code",
      classId: "1",
      className: "Data Structures",
      date: "Dec 12, 2025",
      size: "156 KB",
      downloads: 42,
    },
    {
      id: 3,
      title: "Sorting Algorithms Overview",
      type: "slides",
      classId: "2",
      className: "Algorithm Design",
      date: "Dec 8, 2025",
      size: "5.1 MB",
      downloads: 52,
    },
    {
      id: 4,
      title: "Dynamic Programming Examples",
      type: "code",
      classId: "2",
      className: "Algorithm Design",
      date: "Dec 11, 2025",
      size: "89 KB",
      downloads: 48,
    },
    {
      id: 5,
      title: "SQL Basics Presentation",
      type: "slides",
      classId: "3",
      className: "Database Systems",
      date: "Dec 5, 2025",
      size: "3.8 MB",
      downloads: 38,
    },
    {
      id: 6,
      title: "Normalization Exercise",
      type: "assignment",
      classId: "3",
      className: "Database Systems",
      date: "Dec 13, 2025",
      size: "450 KB",
      downloads: 40,
    },
    {
      id: 7,
      title: "Assignment 1 - Arrays and Strings",
      type: "assignment",
      classId: "1",
      className: "Data Structures",
      date: "Dec 14, 2025",
      size: "320 KB",
      downloads: 44,
    },
    {
      id: 8,
      title: "OSI Model Explained",
      type: "video",
      classId: "4",
      className: "Computer Networks",
      date: "Dec 9, 2025",
      size: "Link",
      downloads: 50,
    },
  ]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "all" || resource.classId === selectedClass;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesClass && matchesType;
  });

  const getTypeIcon = (type) => {
    const found = resourceTypes.find((r) => r.value === type);
    return found ? found.icon : "📁";
  };

  const handleUpload = () => {
    if (uploadForm.title && uploadForm.classId) {
      const targetClass = myClasses.find((c) => c.id === uploadForm.classId);
      const newResource = {
        id: Date.now(),
        title: uploadForm.title,
        type: uploadForm.type,
        classId: uploadForm.classId,
        className: targetClass?.name.split(" (")[0] || "",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        size: "1.2 MB",
        downloads: 0,
      };
      setResources([newResource, ...resources]);
      setShowUploadModal(false);
      setUploadForm({ title: "", description: "", classId: "", type: "notes" });
    }
  };

  const handleDelete = (resourceId) => {
    setResources(resources.filter((r) => r.id !== resourceId));
  };

  // Group resources by class
  const groupedResources = filteredResources.reduce((acc, resource) => {
    const className = resource.className;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(resource);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Share and manage learning materials
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {resources.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Resources
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {
              resources.filter((r) => r.type === "notes" || r.type === "slides")
                .length
            }
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Notes & Slides
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {resources.filter((r) => r.type === "assignment").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assignments
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {resources.reduce((sum, r) => sum + r.downloads, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Downloads
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {myClasses.map((cls) => (
                <option
                  key={cls.id}
                  value={cls.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {resourceTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-white dark:bg-gray-800"
                >
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Resources grouped by class */}
      {Object.keys(groupedResources).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(
            ([className, classResources]) => (
              <Card key={className}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  {className}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({classResources.length} resources)
                  </span>
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {classResources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">
                            {getTypeIcon(resource.type)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {resource.title}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>{resource.date}</span>
                              <span>•</span>
                              <span>{resource.size}</span>
                              <span>•</span>
                              <span>{resource.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="p-2!">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" className="p-2!">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="p-2! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => handleDelete(resource.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            ),
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No resources found</p>
          <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload First Resource
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Resource"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Class *
            </label>
            <select
              value={uploadForm.classId}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, classId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Choose a class...
              </option>
              {myClasses
                .filter((c) => c.id !== "all")
                .map((cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Title *
            </label>
            <Input
              placeholder="e.g., Week 3 - Binary Search Trees"
              value={uploadForm.title}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {resourceTypes
                .filter((t) => t.value !== "all")
                .map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setUploadForm({ ...uploadForm, type: type.value })
                    }
                    className={`p-3 rounded-lg border text-center transition-all ${
                      uploadForm.type === type.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                        : "border-gray-200 dark:border-white/10 hover:border-purple-300"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      {type.label}
                    </p>
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add a description..."
              value={uploadForm.description}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 text-center cursor-pointer hover:border-purple-400 transition-colors">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Drag & drop files here
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">
              PDF, DOC, PPT, ZIP up to 50MB
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
