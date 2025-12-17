"use client";

import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Coins,
  Clock,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function OrganizerHomeTab({ setActiveTab }) {
  const organizerData = {
    clubName: "Computer Science Club",
    totalEventsManaged: 8,
    activeEvents: 2,
    totalRegistrations: 156,
    volunteersAssigned: 24,
    coinsAwarded: 450,
  };

  const quickStats = [
    {
      label: "Active Events",
      value: organizerData.activeEvents,
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      label: "Total Registrations",
      value: organizerData.totalRegistrations,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Volunteers Assigned",
      value: organizerData.volunteersAssigned,
      icon: Award,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Coins Awarded",
      value: organizerData.coinsAwarded,
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
  ];

  const myEvents = [
    {
      id: 1,
      name: "Hackathon 2025",
      date: "Feb 15, 2025",
      registrations: 85,
      status: "active",
      volunteers: 10,
    },
    {
      id: 2,
      name: "Tech Talk: AI in Healthcare",
      date: "Feb 20, 2025",
      registrations: 42,
      status: "active",
      volunteers: 5,
    },
    {
      id: 3,
      name: "Coding Workshop",
      date: "Jan 28, 2025",
      registrations: 29,
      status: "completed",
      volunteers: 4,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "New registration for Hackathon 2025",
      time: "30 mins ago",
      type: "registration",
    },
    {
      id: 2,
      text: "Volunteer Rahul assigned to Tech Talk",
      time: "2 hours ago",
      type: "volunteer",
    },
    {
      id: 3,
      text: "25 coins awarded to setup team",
      time: "1 day ago",
      type: "coins",
    },
    {
      id: 4,
      text: "Coding Workshop completed successfully",
      time: "2 days ago",
      type: "event",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Event Organizer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Managing events for{" "}
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              {organizerData.clubName}
            </span>
          </p>
        </div>
        <Button onClick={() => setActiveTab("my-events")}>
          <Calendar className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div
                  className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              My Events
            </h2>
          </div>
          <div className="space-y-3">
            {myEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {event.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.status === "active"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {event.status === "active" ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {event.date}
                  </span>
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.registrations}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" /> {event.volunteers}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setActiveTab("my-events")}
          >
            View All Events
          </Button>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "registration"
                      ? "bg-blue-500"
                      : activity.type === "volunteer"
                        ? "bg-green-500"
                        : activity.type === "coins"
                          ? "bg-yellow-500"
                          : "bg-purple-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("my-events")}
          >
            <Calendar className="w-6 h-6 mb-2" />
            Manage Events
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("registrations")}
          >
            <Users className="w-6 h-6 mb-2" />
            Registrations
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("volunteers")}
          >
            <Award className="w-6 h-6 mb-2" />
            Volunteers
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("award-coins")}
          >
            <Coins className="w-6 h-6 mb-2" />
            Award Coins
          </Button>
        </div>
      </Card>
    </div>
  );
}
