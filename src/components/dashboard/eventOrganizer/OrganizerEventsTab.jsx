"use client";

import { useState } from "react";
import { eventService } from "@/lib/services/eventService";
import { useEffect } from "react";
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
import { clubService } from "@/lib/services/clubService";
import { account } from "@/lib/appwrite";
import { userService } from "@/lib/services/userService";

export default function EventsTab() {
  const [events, setEvents] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentClubId, setCurrentClubId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: 50,
  });
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: 50,
  });

  useEffect(() => {
    const initializeEvents = async () => {
      try {
        const user = await account.get();
        const profile = await userService.getProfile(user.$id);

        if (!profile?.joinedClubs?.length) {
          console.warn("User has no joined clubs");
          return;
        }

        const clubId = profile.joinedClubs[0];
        setCurrentClubId(clubId);
        console.log(clubId);

        const clubEvents = await eventService.getByClubId(clubId);
        console.log(clubEvents);
        setEvents(clubEvents);
      } catch (error) {
        console.error("Error initializing events data:", error);
      }
    };

    initializeEvents();
  }, []);

  const handleCreateEvent = async () => {
    try {
      const createdEvent = await eventService.create({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        maxParticipants: newEvent.maxParticipants,
        status: "upcoming",
        clubId: currentClubId,
      });

      const club = await clubService.getById(currentClubId);
      club.eventCount = (club.eventCount || 0) + 1;
      await clubService.update(club.$id, { eventCount: club.eventCount });

      setEvents([createdEvent, ...events]);

      setIsCreateModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        maxParticipants: 50,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventService.delete(eventId);

      const club = await clubService.getById(currentClubId);
      club.eventCount = (club.eventCount || 0) - 1;
      await clubService.update(club.$id, { eventCount: club.eventCount });

      setEvents(events.filter((e) => e.$id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  const handleUpdateEvent = async () => {
    if (!editData.title || !editData.date || !editData.location) {
      setError("Title, date, and location are required.");
      return;
    }

    try {
      const updated = await eventService.update(selectedEvent.$id, {
        title: editData.title,
        description: editData.description,
        date: editData.date,
        time: editData.time,
        location: editData.location,
        maxParticipants: editData.maxParticipants,
      });

      setEvents(events.map((e) => (e.$id === selectedEvent.$id ? updated : e)));
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event. Please try again.");
    }
  };

  const registrations = [];

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
            key={event.$id}
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
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setEditData({
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        time: event.time,
                        location: event.location,
                        maxParticipants: event.maxParticipants,
                      });
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => handleDeleteEvent(event.$id)}
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
                  {new Date(event.date).toLocaleDateString()}
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

      {/* Edit Event Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        title="Edit Event"
      >
        <div className="space-y-4">
          <Input
            label="Event Title"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              rows={3}
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
            <Input
              label="Time"
              type="time"
              value={editData.time}
              onChange={(e) =>
                setEditData({ ...editData, time: e.target.value })
              }
            />
          </div>
          <Input
            label="Location"
            value={editData.location}
            onChange={(e) =>
              setEditData({ ...editData, location: e.target.value })
            }
          />
          <Input
            label="Max Participants"
            type="number"
            value={editData.maxParticipants}
            onChange={(e) =>
              setEditData({
                ...editData,
                maxParticipants: parseInt(e.target.value),
              })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateEvent}>
              Save Changes
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
    </div>
  );
}
