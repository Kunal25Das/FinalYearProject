"use client";

import { useState, useEffect } from "react";
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

  const resourceTypes = [
    { value: "all", label: "All Types", icon: "📁" },
    { value: "notes", label: "Lecture Notes", icon: "📝" },
    { value: "slides", label: "Slides/PPT", icon: "📊" },
    { value: "code", label: "Code Examples", icon: "💻" },
    { value: "assignment", label: "Assignment", icon: "📋" },
    { value: "video", label: "Video Link", icon: "🎥" },
  ];

  const [resources, setResources] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadResources() {
    try {
      const res = await fetch("/api/faculty/resources");
      const data = await res.json();
      if (data.success) {
        setResources(data.resources);
        setMyClasses(data.myClasses);
      }
    } catch (err) {
      console.error("Error loading resources:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

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

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.classId) {
      alert("Title and Class are required");
      return;
    }

    try {
      const res = await fetch("/api/faculty/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type,
          classId: uploadForm.classId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadResources();
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          classId: "",
          type: "notes",
        });
      } else {
        alert(data.error || "Failed to upload resource");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while uploading resource");
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const res = await fetch(`/api/faculty/resources?id=${resourceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadResources();
      } else {
        alert(data.error || "Failed to delete resource");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting resource");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
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
                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
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
              <option
                value=""
                className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
              >
                Choose a class...
              </option>
              {myClasses
                .filter((c) => c.id !== "all")
                .map((cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
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
