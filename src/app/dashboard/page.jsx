"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext.jsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout.jsx";

// Student Components
import HomeTab from "@/components/dashboard/student/HomeTab.jsx";
import ScheduleTab from "@/components/dashboard/student/ScheduleTab.jsx";
import ClassesTab from "@/components/dashboard/student/ClassesTab.jsx";
import FeedTab from "@/components/dashboard/student/FeedTab.jsx";
import CommunityTab from "@/components/dashboard/student/CommunityTab.jsx";
import WalletTab from "@/components/dashboard/student/WalletTab.jsx";
import HappeningsTab from "@/components/dashboard/student/HappeningsTab.jsx";
import ProfileTab from "@/components/dashboard/student/ProfileTab.jsx";
import SettingsTab from "@/components/dashboard/student/SettingsTab.jsx";

// Club Admin Components
import ClubHomeTab from "@/components/dashboard/clubAdmin/ClubHomeTab.jsx";
import EventsTab from "@/components/dashboard/clubAdmin/EventsTab.jsx";
import MembersTab from "@/components/dashboard/clubAdmin/MembersTab.jsx";
import NoticesTab from "@/components/dashboard/clubAdmin/NoticesTab.jsx";
import AwardsTab from "@/components/dashboard/clubAdmin/AwardsTab.jsx";
import CreateClubTab from "@/components/dashboard/clubAdmin/CreateClubTab.jsx";
import ClubSettingsTab from "@/components/dashboard/clubAdmin/ClubSettingsTab.jsx";

// Event Organizer Components
import OrganizerHomeTab from "@/components/dashboard/eventOrganizer/OrganizerHomeTab.jsx";
import VolunteersTab from "@/components/dashboard/eventOrganizer/VolunteersTab.jsx";
import RegistrationsTab from "@/components/dashboard/eventOrganizer/RegistrationsTab.jsx";

// Faculty Components
import FacultyHomeTab from "@/components/dashboard/faculty/FacultyHomeTab.jsx";
import MyClassesTab from "@/components/dashboard/faculty/MyClassesTab.jsx";
import ResourcesTab from "@/components/dashboard/faculty/ResourcesTab.jsx";
import ClassNoticesTab from "@/components/dashboard/faculty/ClassNoticesTab.jsx";
import ScheduleManagerTab from "@/components/dashboard/faculty/ScheduleManagerTab.jsx";
import FacultyAssignmentsTab from "@/components/dashboard/faculty/AssignmentsTab.jsx";

// Dept Admin (HOD) Components
import DeptAdminHomeTab from "@/components/dashboard/deptAdmin/DeptAdminHomeTab.jsx";
import BatchClassesTab from "@/components/dashboard/deptAdmin/BatchClassesTab.jsx";
import ScheduleUploadTab from "@/components/dashboard/deptAdmin/ScheduleUploadTab.jsx";
import FacultyAssignTab from "@/components/dashboard/deptAdmin/FacultyAssignTab.jsx";
import DeptFacultyTab from "@/components/dashboard/deptAdmin/DeptFacultyTab.jsx";
import DeptNoticesTab from "@/components/dashboard/deptAdmin/DeptNoticesTab.jsx";

// College Admin (Super Admin) Components
import AdminHomeTab from "@/components/dashboard/collegeAdmin/AdminHomeTab.jsx";
import ApprovalsTab from "@/components/dashboard/collegeAdmin/ApprovalsTab.jsx";
import StudentImportTab from "@/components/dashboard/collegeAdmin/StudentImportTab.jsx";
import BatchManagementTab from "@/components/dashboard/collegeAdmin/BatchManagementTab.jsx";
import FacultyManagementTab from "@/components/dashboard/collegeAdmin/FacultyManagementTab.jsx";
import OpportunitiesTab from "@/components/dashboard/collegeAdmin/OpportunitiesTab.jsx";
import AdminNoticesTab from "@/components/dashboard/collegeAdmin/AdminNoticesTab.jsx";

export default function DashboardPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  // Set default tab based on role
  const getDefaultTab = () => {
    if (userRole === "club-admin") return "club-home";
    if (userRole === "event-organizer") return "organizer-home";
    if (userRole === "faculty") return "faculty-home";
    if (userRole === "dept-admin") return "dept-home";
    if (userRole === "college-admin") return "admin-home";
    return "home";
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [hasClub, setHasClub] = useState(true); // Simulating that admin has a club

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

  const renderStudentContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab setActiveTab={setActiveTab} />;
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
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <HomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderClubAdminContent = () => {
    // If admin doesn't have a club yet, show create club page
    if (!hasClub && activeTab !== "create-club") {
      return <CreateClubTab onClubCreated={() => setHasClub(true)} />;
    }

    switch (activeTab) {
      case "club-home":
        return <ClubHomeTab setActiveTab={setActiveTab} />;
      case "events":
        return <EventsTab />;
      case "members":
        return <MembersTab />;
      case "notices":
        return <NoticesTab />;
      case "awards":
        return <AwardsTab />;
      case "create-club":
        return <CreateClubTab onClubCreated={() => setHasClub(true)} />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <ClubSettingsTab />;
      default:
        return <ClubHomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderEventOrganizerContent = () => {
    switch (activeTab) {
      case "organizer-home":
        return <OrganizerHomeTab setActiveTab={setActiveTab} />;
      case "my-events":
        return <EventsTab />;
      case "registrations":
        return <RegistrationsTab />;
      case "volunteers":
        return <VolunteersTab />;
      case "award-coins":
        return <AwardsTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OrganizerHomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderFacultyContent = () => {
    switch (activeTab) {
      case "faculty-home":
        return <FacultyHomeTab setActiveTab={setActiveTab} />;
      case "my-classes":
        return <MyClassesTab />;
      case "assignments":
        return <FacultyAssignmentsTab />;
      case "resources":
        return <ResourcesTab />;
      case "class-notices":
        return <ClassNoticesTab />;
      case "schedule-manager":
        return <ScheduleManagerTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <FacultyHomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderDeptAdminContent = () => {
    switch (activeTab) {
      case "dept-home":
        return <DeptAdminHomeTab setActiveTab={setActiveTab} />;
      case "batch-classes":
        return <BatchClassesTab />;
      case "schedule-upload":
        return <ScheduleUploadTab />;
      case "faculty-assign":
        return <FacultyAssignTab />;
      case "dept-faculty":
        return <DeptFacultyTab />;
      case "dept-notices":
        return <DeptNoticesTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DeptAdminHomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderCollegeAdminContent = () => {
    switch (activeTab) {
      case "admin-home":
        return <AdminHomeTab setActiveTab={setActiveTab} />;
      case "approvals":
        return <ApprovalsTab />;
      case "student-import":
        return <StudentImportTab />;
      case "batch-management":
        return <BatchManagementTab />;
      case "faculty-management":
        return <FacultyManagementTab />;
      case "opportunities":
        return <OpportunitiesTab />;
      case "admin-notices":
        return <AdminNoticesTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <AdminHomeTab setActiveTab={setActiveTab} />;
    }
  };

  const renderTabContent = () => {
    if (userRole === "club-admin") {
      return renderClubAdminContent();
    }
    if (userRole === "event-organizer") {
      return renderEventOrganizerContent();
    }
    if (userRole === "faculty") {
      return renderFacultyContent();
    }
    if (userRole === "dept-admin") {
      return renderDeptAdminContent();
    }
    if (userRole === "college-admin") {
      return renderCollegeAdminContent();
    }
    return renderStudentContent();
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}
