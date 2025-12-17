"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function EventsTab() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Annual Hackathon 2025",
      description: "48-hour coding marathon with amazing prizes",
      date: "2025-12-25",
      time: "09:00 AM",
      location: "Main Auditorium",
      status: "upcoming",
      registrations: 45,
      maxParticipants: 100,
      volunteers: [
        { id: 1, name: "Alice Smith", role: "Registration" },
        { id: 2, name: "Bob Johnson", role: "Tech Support" },
      ],
    },
    {
      id: 2,
      title: "Tech Talk: AI in 2025",
      description: "Expert session on latest AI trends",
      date: "2025-12-20",
      time: "03:00 PM",
      location: "Seminar Hall",
      status: "upcoming",
      registrations: 78,
      maxParticipants: 150,
      volunteers: [],
    },
    {
      id: 3,
      title: "Workshop: Web Development",
      description: "Hands-on workshop for beginners",
      date: "2025-12-10",
      time: "10:00 AM",
      location: "Computer Lab",
      status: "completed",
      registrations: 30,
      maxParticipants: 30,
      volunteers: [{ id: 3, name: "Charlie Brown", role: "Instructor" }],
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: 50,
  });

  const handleCreateEvent = () => {
    const event = {
      id: events.length + 1,
      ...newEvent,
      status: "upcoming",
      registrations: 0,
      volunteers: [],
    };
    setEvents([event, ...events]);
    setIsCreateModalOpen(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: 50,
    });
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const registrations = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      registeredAt: "2025-12-15",
      status: "confirmed",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      registeredAt: "2025-12-14",
      status: "confirmed",
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike@example.com",
      registeredAt: "2025-12-13",
      status: "pending",
    },
    {
      id: 4,
      name: "Sarah Connor",
      email: "sarah@example.com",
      registeredAt: "2025-12-12",
      status: "confirmed",
    },
    {
      id: 5,
      name: "Tom Hardy",
      email: "tom@example.com",
      registeredAt: "2025-12-11",
      status: "cancelled",
    },
  ];

  const availableVolunteers = [
    { id: 1, name: "Alice Smith", skills: ["Registration", "Communication"] },
    { id: 2, name: "Bob Johnson", skills: ["Tech Support", "Setup"] },
    { id: 3, name: "Charlie Brown", skills: ["Instruction", "Mentoring"] },
    { id: 4, name: "Diana Prince", skills: ["Photography", "Social Media"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage club events
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === "upcoming"
                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {event.status === "upcoming" ? "Upcoming" : "Completed"}
                </span>
                <div className="flex gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                {event.description}
              </p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Registrations
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {event.registrations}/{event.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(event.registrations / event.maxParticipants) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-sm!"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsViewModalOpen(true);
                  }}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Registrations
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-sm!"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsVolunteerModalOpen(true);
                  }}
                >
                  Volunteers ({event.volunteers.length})
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Event"
      >
        <div className="space-y-4">
          <Input
            label="Event Title"
            placeholder="Enter event title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              rows={3}
              placeholder="Event description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
            />
            <Input
              label="Time"
              type="time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
            />
          </div>
          <Input
            label="Location"
            placeholder="Event venue"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />
          <Input
            label="Max Participants"
            type="number"
            value={newEvent.maxParticipants}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                maxParticipants: parseInt(e.target.value),
              })
            }
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Registrations Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Registrations - ${selectedEvent?.title}`}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Registrations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent.registrations}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available Spots
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {selectedEvent.maxParticipants - selectedEvent.registrations}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500">
                      {reg.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reg.name}
                      </p>
                      <p className="text-xs text-gray-500">{reg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        reg.status === "confirmed"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                          : reg.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                            : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {reg.status}
                    </span>
                    {reg.status === "pending" && (
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-green-100 dark:hover:bg-green-500/20 rounded text-green-500">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-500">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Volunteers Modal */}
      <Modal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        title={`Manage Volunteers - ${selectedEvent?.title}`}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Current Volunteers */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Assigned Volunteers
              </h3>
              {selectedEvent.volunteers.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvent.volunteers.map((vol) => (
                    <div
                      key={vol.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                          {vol.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vol.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Role: {vol.role}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-red-500 text-sm!">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No volunteers assigned yet
                </p>
              )}
            </div>

            {/* Add Volunteers */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Add Volunteers
              </h3>
              <div className="space-y-2">
                {availableVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vol.name}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {vol.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="text-sm!">
                      Assign Role
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
