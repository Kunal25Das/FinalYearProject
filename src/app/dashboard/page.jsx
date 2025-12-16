"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext.jsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout.jsx";
import HomeTab from "@/components/dashboard/student/HomeTab.jsx";
import ScheduleTab from "@/components/dashboard/student/ScheduleTab.jsx";
import ClassesTab from "@/components/dashboard/student/ClassesTab.jsx";
import FeedTab from "@/components/dashboard/student/FeedTab.jsx";
import CommunityTab from "@/components/dashboard/student/CommunityTab.jsx";
import WalletTab from "@/components/dashboard/student/WalletTab.jsx";
import HappeningsTab from "@/components/dashboard/student/HappeningsTab.jsx";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "schedule":
        return <ScheduleTab />;
      case "classes":
        return <ClassesTab />;
      case "feed":
        return <FeedTab />;
      case "community":
        return <CommunityTab />;
      case "happenings":
        return <HappeningsTab />;
      case "wallet":
        return <WalletTab />;
      case "profile":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Profile settings coming soon...
            </p>
          </div>
        );
      default:
        return <HomeTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}
