"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  GraduationCap,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function StudentImportTab() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const [departments, setDepartments] = useState([]);

  const [batches, setBatches] = useState([]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/stats"); // Stats contains recentActivity of type 'import'
      const data = await res.json();
      if (res.ok) {
        const logs = data.data.recentActivities.filter(
          (act) => act.type === "import",
        );
        setImportHistory(
          logs.map((log) => ({
            id: log._id,
            department: log.details.split(" - ")[1]?.split(" ")[0] || "General",
            batch: log.details.split("Batch ")[1] || "2026",
            fileName: log.action,
            studentsImported: parseInt(log.details.split(" ")[0]) || 0,
            importedAt: new Date(log.createdAt).toLocaleString(),
            importedBy: "Admin",
            status: "success",
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch import history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      if (
        deptRes.ok &&
        deptData.departments &&
        deptData.departments.length > 0
      ) {
        setDepartments(
          deptData.departments.map((d) => ({
            id: d._id,
            name: `${d.code} - ${d.name}`,
          })),
        );
      }

      const batchRes = await fetch("/api/admin/batches");
      const batchData = await batchRes.json();
      if (batchRes.ok && batchData.batches && batchData.batches.length > 0) {
        setBatches(
          batchData.batches.map((b) => ({
            id: b.year,
            name: `Batch ${b.year} (${b.name})`,
          })),
        );
      }
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchMetadata();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleParseCSV = () => {
    if (!csvText.trim()) return;

    const lines = csvText.split("\n");
    const students = [];

    lines.forEach((line) => {
      if (!line.trim()) return;
      // split by comma
      const cols = line.split(",");
      if (cols.length >= 2) {
        students.push({
          rollNo: cols[0]?.trim() || "",
          name: cols[1]?.trim() || "",
          email: cols[2]?.trim() || "",
        });
      }
    });

    setParsedStudents(students);
    setShowPreviewModal(true);
  };

  const handleImportSubmit = async () => {
    if (parsedStudents.length === 0 || !selectedDepartment || !selectedBatch)
      return;

    setIsUploading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: parsedStudents,
          department: selectedDepartment,
          batch: selectedBatch,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import students");
      }

      setImportSuccess(true);
      setMessage(data.message);
      setShowPreviewModal(false);
      setCsvText("");
      setCsvFile(null);
      fetchHistory(); // Reload history
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTemplateDownload = () => {
    const csvContent =
      "RollNo,Name,Email\nCSE2024001,John Doe,john@college.edu\nCSE2024002,Jane Smith,jane@college.edu";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "universe_student_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Import Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import students in bulk into specific departments and batches using
            a CSV file.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-white/10 text-gray-300 self-start"
          onClick={() => {
            fetchHistory();
            setShowHistoryModal(true);
          }}
        >
          View History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurations Card */}
        <Card className="lg:col-span-1 border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <span>Target Allocations</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Batch Year
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleTemplateDownload}
            className="w-full flex items-center justify-center gap-2 border-dashed border-white/20 bg-white/5"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Template</span>
          </Button>
        </Card>

        {/* CSV Import Data Card */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" />
            <span>Upload CSV File</span>
          </h3>
          <p className="text-xs text-gray-400">
            Select a <code>.csv</code> file exported from Excel or Google
            Sheets. The file must have columns: <code>RollNo, Name, Email</code>
            .
          </p>

          <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-12 h-12 text-purple-400 mb-3" />
            {csvFile ? (
              <div>
                <p className="text-sm font-semibold text-white">
                  {csvFile.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(csvFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Click or drag a CSV file here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports only .csv files
                </p>
              </div>
            )}
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/20"
            disabled={!csvText.trim() || !selectedDepartment || !selectedBatch}
            onClick={handleParseCSV}
          >
            Preview and Validate Data
          </Button>
        </Card>
      </div>

      {importSuccess && (
        <Card className="border border-green-500/20 bg-green-500/10 p-5 space-y-3">
          <div className="flex items-center gap-3 text-green-400 font-bold text-lg">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <span>Import Completed Successfully!</span>
          </div>
          <p className="text-sm text-gray-300">{message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportSuccess(false)}
          >
            Dismiss
          </Button>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Confirm Student Import (${parsedStudents.length} Students)`}
      >
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl text-sm grid grid-cols-2 gap-4">
            <div>
              <strong className="text-gray-400">Department:</strong>{" "}
              <span className="text-white uppercase font-bold">
                {selectedDepartment}
              </span>
            </div>
            <div>
              <strong className="text-gray-400">Batch Year:</strong>{" "}
              <span className="text-white font-bold">{selectedBatch}</span>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto border border-white/10 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs text-gray-400 uppercase border-b border-white/10">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {parsedStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-mono text-purple-400">
                      {s.rollNo || "-"}
                    </td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isUploading}
              onClick={handleImportSubmit}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                "Confirm Import"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Import History"
      >
        <div className="space-y-4">
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : importHistory.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              No import history logs found.
            </p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {importHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {hist.fileName}
                      </span>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full uppercase">
                        {hist.department}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Batch {hist.batch} • {hist.studentsImported} students
                      imported on {hist.importedAt}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ))}
            </div>
          )}
          <div className="text-end pt-4">
            <Button variant="ghost" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
