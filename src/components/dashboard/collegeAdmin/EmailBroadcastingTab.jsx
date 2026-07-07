"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Send,
  AlertCircle,
  FileText,
  User,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function EmailBroadcastingTab() {
  const [activeSubTab, setActiveSubTab] = useState("compose");
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Compose State
  const [composeData, setComposeData] = useState({
    targetType: "all-students",
    departmentId: "",
    batchId: "",
    recipientEmail: "",
    subject: "",
    body: "",
  });

  // Save Template State
  const [templateName, setTemplateName] = useState("");

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved templates
      const tempRes = await fetch("/api/admin/email-templates");
      const tempData = await tempRes.json();
      if (tempRes.ok) setTemplates(tempData.templates || []);

      // 2. Fetch departments list
      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      if (deptRes.ok && deptData.departments) {
        setDepartments(deptData.departments);
        if (deptData.departments.length > 0) {
          setComposeData((prev) => ({
            ...prev,
            departmentId: deptData.departments[0]._id,
          }));
        }
      }

      // 3. Fetch batches list
      const batchRes = await fetch("/api/admin/batches");
      const batchData = await batchRes.json();
      if (batchRes.ok && batchData.batches) {
        setBatches(batchData.batches);
        if (batchData.batches.length > 0) {
          setComposeData((prev) => ({
            ...prev,
            batchId: batchData.batches[0].year,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load email metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    try {
      const res = await fetch("/api/admin/email-templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate template");

      setComposeData((prev) => ({
        ...prev,
        subject: data.subject || "",
        body: data.body || "",
      }));
      setAiModalOpen(false);
      setAiPrompt("");
      setActiveSubTab("compose");
    } catch (err) {
      alert(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImportTemplate = (template) => {
    // Import action: insert 5 blank spaces in place of any angle bracket placeholders <>
    const cleanSubject = template.subject.replace(/<[^>]+>/g, "     ");
    const cleanBody = template.body.replace(/<[^>]+>/g, "     ");

    setComposeData((prev) => ({
      ...prev,
      subject: cleanSubject,
      body: cleanBody,
    }));
    setActiveSubTab("compose");
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !composeData.subject || !composeData.body) {
      alert(
        "Please fill in the template name, subject, and body before saving.",
      );
      return;
    }

    setActioningId("save");
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          subject: composeData.subject,
          body: composeData.body,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");

      setTemplateName("");
      alert("Template saved successfully!");
      fetchMetadata();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;

    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/email-templates?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete template");

      fetchMetadata();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!composeData.subject || !composeData.body) {
      alert("Please enter subject and message body before broadcasting.");
      return;
    }

    setActioningId("send");
    try {
      const res = await fetch("/api/admin/email-templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      alert(`Email broadcast successfully sent to ${data.count} recipients!`);
      setComposeData((prev) => ({
        ...prev,
        subject: "",
        body: "",
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading communication hub...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-8 h-8 text-purple-500" />
            <span>Email Communication Hub</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Broadcast announcement letters, placement updates, or class
            reminders via customized templates.
          </p>
        </div>
        <Button
          onClick={() => setAiModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI Template
        </Button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveSubTab("compose")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeSubTab === "compose"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white"
          }`}
        >
          Compose Broadcast
        </button>
        <button
          onClick={() => setActiveSubTab("templates")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeSubTab === "templates"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white"
          }`}
        >
          Saved Templates ({templates.length})
        </button>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <Card className="lg:col-span-2 border border-gray-200 dark:border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Compose Email Message
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Recipients Group
                  </label>
                  <select
                    value={composeData.targetType}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        targetType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="all-students">All Students</option>
                    <option value="all-faculty">All Faculty Members</option>
                    <option value="dept-students">Department Students</option>
                    <option value="batch-students">
                      Specific Batch Students
                    </option>
                    <option value="specific-email">
                      Specific Email Address
                    </option>
                  </select>
                </div>

                {composeData.targetType === "specific-email" && (
                  <div className="md:col-span-2">
                    <Input
                      label="Recipient Email Address"
                      type="email"
                      placeholder="e.g. contact@domain.edu"
                      value={composeData.recipientEmail}
                      onChange={(e) =>
                        setComposeData({
                          ...composeData,
                          recipientEmail: e.target.value,
                        })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>
                )}

                {(composeData.targetType === "dept-students" ||
                  composeData.targetType === "batch-students") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Department
                    </label>
                    <select
                      value={composeData.departmentId}
                      onChange={(e) =>
                        setComposeData({
                          ...composeData,
                          departmentId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {composeData.targetType === "batch-students" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Batch Year
                    </label>
                    <select
                      value={composeData.batchId}
                      onChange={(e) =>
                        setComposeData({
                          ...composeData,
                          batchId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      {batches.map((b) => (
                        <option key={b._id} value={b.year}>
                          {b.year} ({b.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Input
                label="Subject Line"
                type="text"
                placeholder="Enter email subject line"
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData({ ...composeData, subject: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
              />

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Message Body
                </label>
                <textarea
                  value={composeData.body}
                  onChange={(e) =>
                    setComposeData({ ...composeData, body: e.target.value })
                  }
                  placeholder="Draft your email notification body here..."
                  rows={8}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={actioningId === "send"}
                >
                  {actioningId === "send" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Broadcast
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Quick Tools & Template Saving */}
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-white/10">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                Save as Template
              </h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Save the subject and body above as a template to easily reload
                and reuse it for future announcements.
              </p>
              <div className="space-y-3">
                <Input
                  label="Template Name"
                  type="text"
                  placeholder="e.g. Exam Schedule Release"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                <Button
                  onClick={handleSaveTemplate}
                  variant="outline"
                  className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                  disabled={actioningId === "save"}
                >
                  {actioningId === "save" ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </Card>

            <Card className="border border-gray-200 dark:border-white/10 bg-purple-600/5">
              <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Assistant Tip</span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Click <strong>AI Template</strong> above to generate complex
                documents (e.g. placements, events). The generator marks empty
                placeholders inside brackets like <code>&lt;Date&gt;</code>.
                Importing the template automatically replaces them with blank
                spaces so you can type directly inside!
              </p>
            </Card>
          </div>
        </div>
      ) : (
        /* Saved Templates Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <Card className="col-span-full border border-gray-200 dark:border-white/10 text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                No Templates Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                No custom templates saved. Draft a message and save it to get
                started.
              </p>
            </Card>
          ) : (
            templates.map((template) => (
              <Card
                key={template._id}
                onClick={() => handleImportTemplate(template)}
                className="border border-gray-200 dark:border-white/10 hover:border-purple-500/40 cursor-pointer flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                      {template.name}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteTemplate(template._id, e)}
                      disabled={actioningId !== null}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-purple-400 line-clamp-1">
                    Subject: {template.subject}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-4 leading-relaxed">
                    {template.body}
                  </p>
                </div>

                <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-3 text-right">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    Use Template &rarr;
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* AI Generate Template Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Template Generator"
      >
        <form onSubmit={handleAiGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              What do you want this email template to be about?
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Invitation letter for campus recruitment drive by Amazon on 15th July, listing CGPA criteria"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAiModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              disabled={aiGenerating}
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
