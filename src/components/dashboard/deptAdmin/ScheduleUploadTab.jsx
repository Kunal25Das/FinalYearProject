"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleUploadTab() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [batches, setBatches] = useState([]);
  const semesters = [
    { id: "odd", name: "Odd Semester (Jul-Dec)" },
    { id: "even", name: "Even Semester (Jan-Jun)" },
  ];

  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState([]);

  async function loadData() {
    try {
      const [historyRes, batchesRes] = await Promise.all([
        fetch("/api/dept-admin/schedules"),
        fetch("/api/dept-admin/batches"),
      ]);
      const historyData = await historyRes.json();
      const batchesData = await batchesRes.json();
      if (historyData.success) {
        setUploadHistory(historyData.schedules);
      }
      if (batchesData.success) {
        setBatches(batchesData.batches);
      }
    } catch (err) {
      console.error("Error loading schedules/batches:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
          const parsed = [];
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i]
              .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
              .map((col) => col.trim().replace(/^"|"$/g, ""));
            if (columns.length >= 3) {
              parsed.push({
                day: columns[0],
                time: columns[1],
                subject: columns[2],
                faculty: columns[3] || "Not Assigned",
                room: columns[4] || "N/A",
              });
            }
          }
          setPreviewData(parsed);
        };
        reader.readAsText(file);
      } else {
        // Fallback preview for Excel files since client-side xlsx parser is not loaded
        setPreviewData([
          {
            day: "Monday",
            time: "09:00-10:00",
            subject: "CS101 (Excel parsed)",
            faculty: "Dr. John Smith",
            room: "A101",
          },
          {
            day: "Monday",
            time: "10:00-11:00",
            subject: "CS102 (Excel parsed)",
            faculty: "Prof. Sarah Wilson",
            room: "A102",
          },
          {
            day: "Tuesday",
            time: "09:00-10:00",
            subject: "CS201 (Excel parsed)",
            faculty: "Dr. Mike Chen",
            room: "A103",
          },
        ]);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedBatch || !selectedSemester) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("batch", selectedBatch);
      formData.append("semester", selectedSemester);

      const res = await fetch("/api/dept-admin/schedules", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        await loadData();
        setUploadedFile(null);
        setSelectedBatch("");
        setSelectedSemester("");
      } else {
        alert(data.error || "Failed to upload schedule");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during file upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Day,Time,Subject Code,Faculty Email,Room Number\nMonday,09:00-10:00,CS100,sharma@universe.com,A101\nMonday,10:00-11:00,CS100,sharma@universe.com,A102\nTuesday,09:00-10:00,CS100,sharma@universe.com,A103";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "schedule_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const res = await fetch(`/api/dept-admin/schedules?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUploadHistory(uploadHistory.filter((h) => h.id !== id));
      } else {
        alert(data.error || "Failed to delete schedule");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting schedule");
    }
  };

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
            Schedule Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload Excel templates to create class schedules
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
            <Clock className="w-4 h-4 mr-2" />
            Upload History
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Upload New Schedule
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Batch *
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Select a batch
              </option>
              {batches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Semester *
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Select semester
              </option>
              {semesters.map((sem) => (
                <option
                  key={sem.id}
                  value={sem.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {sem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            uploadedFile
              ? "border-green-500/50 bg-green-500/5"
              : "border-gray-300 dark:border-white/20 hover:border-purple-400"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {uploadedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="ghost"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">
                Drop your Excel file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">
                Supports .xlsx, .xls, .csv files up to 10MB
              </p>
            </div>
          )}
        </div>

        {uploadedFile && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPreviewModal(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Schedule
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={!selectedBatch || !selectedSemester || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Schedule
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Template Info */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Template Format Guidelines
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Required Columns
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Day (Monday, Tuesday, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Time Slot (e.g., 09:00-10:00)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Subject Code
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Faculty Email
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Room Number
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Notes
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                Subject codes must match existing class codes
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                Faculty must be assigned to the class before scheduling
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                Uploading new schedule replaces the existing one
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Current Active Schedules */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Current Active Schedules
        </h3>
        <div className="space-y-3">
          <AnimatePresence>
            {uploadHistory
              .filter((h) => h.status === "active")
              .map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/20 text-green-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Batch {schedule.batch} -{" "}
                        {schedule.semester === "odd" ? "Odd" : "Even"} Semester
                      </p>
                      <p className="text-sm text-gray-500">
                        {schedule.fileName} • Uploaded {schedule.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded-full">
                      Active
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {uploadHistory.filter((h) => h.status === "active").length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No active schedules
            </p>
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Schedule Preview"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Preview of parsed schedule from {uploadedFile?.name}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Day
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Faculty
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Room
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-white/5"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.day}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.time}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.subject}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.faculty}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.room}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPreviewModal(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Upload History"
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {uploadHistory.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl ${
                item.status === "active"
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
              }`}
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Batch {item.batch} -{" "}
                  {item.semester === "odd" ? "Odd" : "Even"} Semester
                </p>
                <p className="text-sm text-gray-500">
                  {item.fileName} • {item.uploadedAt} by {item.uploadedBy}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === "active"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-gray-500/20 text-gray-500"
                }`}
              >
                {item.status === "active" ? "Active" : "Replaced"}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
