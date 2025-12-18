"use client";

import { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Eye,
  GraduationCap,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function StudentImportTab() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const departments = [
    { id: "cse", name: "Computer Science & Engineering" },
    { id: "ece", name: "Electronics & Communication" },
    { id: "me", name: "Mechanical Engineering" },
    { id: "ce", name: "Civil Engineering" },
    { id: "ee", name: "Electrical Engineering" },
    { id: "it", name: "Information Technology" },
  ];

  const batches = [
    { id: "2025", name: "Batch 2025 (Incoming)" },
    { id: "2024", name: "Batch 2024 (1st Year)" },
    { id: "2023", name: "Batch 2023 (2nd Year)" },
    { id: "2022", name: "Batch 2022 (3rd Year)" },
    { id: "2021", name: "Batch 2021 (4th Year)" },
  ];

  const [importHistory, setImportHistory] = useState([
    {
      id: 1,
      department: "CSE",
      batch: "2024",
      fileName: "cse_2024_students.xlsx",
      studentsImported: 120,
      importedAt: "Dec 15, 2025 10:30 AM",
      importedBy: "Admin",
      status: "success",
    },
    {
      id: 2,
      department: "ECE",
      batch: "2024",
      fileName: "ece_2024_students.xlsx",
      studentsImported: 115,
      importedAt: "Dec 14, 2025 02:15 PM",
      importedBy: "Admin",
      status: "success",
    },
    {
      id: 3,
      department: "ME",
      batch: "2024",
      fileName: "me_2024_students.xlsx",
      studentsImported: 0,
      importedAt: "Dec 13, 2025 11:00 AM",
      importedBy: "Admin",
      status: "failed",
      error: "Invalid email format in row 45",
    },
  ]);

  // Preview data (simulated parsed Excel)
  const previewData = [
    {
      rollNo: "CSE2024001",
      name: "John Doe",
      email: "john.doe@university.edu",
      phone: "9876543210",
    },
    {
      rollNo: "CSE2024002",
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      phone: "9876543211",
    },
    {
      rollNo: "CSE2024003",
      name: "Mike Johnson",
      email: "mike.johnson@university.edu",
      phone: "9876543212",
    },
    {
      rollNo: "CSE2024004",
      name: "Sarah Wilson",
      email: "sarah.wilson@university.edu",
      phone: "9876543213",
    },
    {
      rollNo: "CSE2024005",
      name: "Alex Kumar",
      email: "alex.kumar@university.edu",
      phone: "9876543214",
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setImportSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile || !selectedDepartment || !selectedBatch) return;

    setIsUploading(true);

    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const dept = departments.find((d) => d.id === selectedDepartment);
    const newImport = {
      id: importHistory.length + 1,
      department: dept?.name.split(" ")[0] || selectedDepartment.toUpperCase(),
      batch: selectedBatch,
      fileName: uploadedFile.name,
      studentsImported: Math.floor(Math.random() * 50) + 100,
      importedAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      importedBy: "Admin",
      status: "success",
    };

    setImportHistory([newImport, ...importHistory]);
    setIsUploading(false);
    setImportSuccess(true);
    setUploadedFile(null);
  };

  const handleDownloadTemplate = () => {
    alert("Downloading student import template...");
  };

  const stats = {
    totalImports: importHistory.length,
    totalStudents: importHistory
      .filter((h) => h.status === "success")
      .reduce((sum, h) => sum + h.studentsImported, 0),
    successRate: Math.round(
      (importHistory.filter((h) => h.status === "success").length /
        importHistory.length) *
        100,
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Import
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import student data from Excel and assign to batches
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Import History
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalImports}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Imports
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.totalStudents}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Students Imported
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.successRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Success Rate
          </p>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Import New Students
        </h3>

        {importSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Import Successful!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400/80">
                Students have been added to the batch. They will receive login
                credentials via email.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Department *
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Select a department
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
                Supports .xlsx, .xls, .csv files
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
              Preview Data
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={!selectedDepartment || !selectedBatch || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Students
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
                Roll Number (Unique identifier)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Full Name
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Email Address (for login credentials)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Phone Number
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Optional Columns
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Date of Birth
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Address
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Parent/Guardian Contact
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Blood Group
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Note:</strong> Students will receive their login credentials
            via email after successful import. Default password will be their
            roll number which they can change on first login.
          </p>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Data Preview"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Preview of parsed data from {uploadedFile?.name}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Roll No
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-white/5"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {row.rollNo}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {row.email}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {row.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Showing 5 of 120 records
          </p>
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
        title="Import History"
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {importHistory.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl ${
                item.status === "success"
                  ? "bg-green-50 dark:bg-green-500/10 border border-green-500/20"
                  : "bg-red-50 dark:bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    item.status === "success"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.department} - Batch {item.batch}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.fileName} • {item.importedAt}
                  </p>
                  {item.status === "failed" && (
                    <p className="text-sm text-red-500 mt-1">{item.error}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {item.status === "success" ? (
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {item.studentsImported} imported
                  </p>
                ) : (
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Failed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
