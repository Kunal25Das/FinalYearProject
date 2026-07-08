"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  Pin,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function CalendarTab() {
  const { user, userRole } = useAuth();
  const isAdmin = userRole === "college-admin";

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    broadcast: true,
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.title) return;

    setEventSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title,
          date: selectedDate,
          type: "Academic",
          broadcast: eventForm.broadcast,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule event");

      setEventForm({ title: "", broadcast: true });
      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Are you sure you want to cancel this calendar event?"))
      return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");

      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day) => {
    return events.filter((e) => isSameDay(new Date(e.date), day));
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-purple-500" />
            <span>Campus Calendar</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View administrative deadlines, events, and academic schedules.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event ({format(selectedDate, "MMM d")})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grid View */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-white/10 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-500 uppercase pb-2 border-b border-gray-100 dark:border-white/5">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {loading ? (
              <div className="col-span-7 py-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                <span>Loading calendar schedules...</span>
              </div>
            ) : (
              days.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[75px] p-2 flex flex-col justify-between rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 text-purple-400 ring-1 ring-purple-500"
                        : isToday
                          ? "bg-gray-200 dark:bg-white/10 border-purple-500/50 text-gray-950 dark:text-white font-bold"
                          : "bg-white dark:bg-white/2 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                    } ${isCurrentMonth ? "" : "opacity-30"}`}
                  >
                    <span className="text-xs font-semibold">
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1 w-full mt-2">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev._id || ev.id}
                            className="text-[9px] px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-400 border border-purple-500/10 truncate font-medium block"
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] text-gray-500 dark:text-gray-400 block font-semibold pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Selected Date Timeline View */}
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <div className="pb-3 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Schedule Timeline
            </h2>
            <p className="text-xs text-gray-500">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No events marked on this day.
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev._id || ev.id}
                  className="p-4 bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-xl flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-sm text-gray-950 dark:text-white">
                      {ev.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Category:{" "}
                      <span className="text-purple-400 font-medium">
                        {ev.type}
                      </span>
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(ev._id || ev.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {isAdmin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Event Here
            </Button>
          )}
        </Card>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Schedule Event for ${format(selectedDate, "MMMM d, yyyy")}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Event / Milestone Title"
            type="text"
            placeholder="e.g. Practical Lab Examinations"
            value={eventForm.title}
            onChange={(e) =>
              setEventForm({ ...eventForm, title: e.target.value })
            }
            required
            className="bg-white/5 dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={eventForm.broadcast}
              onChange={(e) =>
                setEventForm({ ...eventForm, broadcast: e.target.checked })
              }
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 bg-white/10"
            />
            <span>Broadcast announcement as an official notice</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={eventSubmitting}
            >
              {eventSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
