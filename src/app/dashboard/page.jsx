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
import CalendarTab from "@/components/dashboard/student/CalendarTab.jsx";

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

// College Admin Components
import AdminHomeTab from "@/components/dashboard/collegeAdmin/AdminHomeTab.jsx";
import ApprovalsTab from "@/components/dashboard/collegeAdmin/ApprovalsTab.jsx";
import StudentImportTab from "@/components/dashboard/collegeAdmin/StudentImportTab.jsx";
import BatchManagementTab from "@/components/dashboard/collegeAdmin/BatchManagementTab.jsx";
import FacultyManagementTab from "@/components/dashboard/collegeAdmin/FacultyManagementTab.jsx";
import OpportunitiesTab from "@/components/dashboard/collegeAdmin/OpportunitiesTab.jsx";
import AdminNoticesTab from "@/components/dashboard/collegeAdmin/AdminNoticesTab.jsx";
import UserManagementTab from "@/components/dashboard/collegeAdmin/UserManagementTab.jsx";
import ClubManagementTab from "@/components/dashboard/collegeAdmin/ClubManagementTab.jsx";
import DepartmentManagementTab from "@/components/dashboard/collegeAdmin/DepartmentManagementTab.jsx";
import EmailBroadcastingTab from "@/components/dashboard/collegeAdmin/EmailBroadcastingTab.jsx";

// Super Admin Components
import SuperAdminRequestsTab from "@/components/dashboard/superAdmin/SuperAdminRequestsTab.jsx";

const getDefaultTab = (role) => {
  if (role === "super-admin") return "super-requests";
  if (role === "college-admin") return "admin-home";
  if (role === "club-admin") return "club-home";
  if (role === "event-organizer") return "organizer-home";
  if (role === "faculty") return "faculty-home";
  if (role === "dept-admin") return "dept-home";
  return "home";
};

export default function DashboardPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  const [activeTab, rawSetActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "home";
    }
    return "home";
  });
  const [hasClub, setHasClub] = useState(true);

  // Synchronized tab update handler
  const setActiveTab = (newTab) => {
    rawSetActiveTab(newTab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") !== newTab) {
        params.set("tab", newTab);
        window.history.pushState(
          null,
          "",
          `${window.location.pathname}?${params.toString()}`,
        );
      }
    }
  };

  // Sync tab search param on back/forward or mount
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        rawSetActiveTab(tabParam);
      }
    };
    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  // Set active tab when role is loaded, if no search param is set
  useEffect(() => {
    if (userRole) {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tab")) {
        const defaultTab = getDefaultTab(userRole);
        setTimeout(() => {
          rawSetActiveTab(defaultTab);
        }, 0);
        params.set("tab", defaultTab);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${params.toString()}`,
        );
      }
    }
  }, [userRole]);

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

  const renderSuperAdminContent = () => {
    switch (activeTab) {
      case "super-home":
      case "super-requests":
        return <SuperAdminRequestsTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <SuperAdminRequestsTab />;
    }
  };

  const renderStudentContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab setActiveTab={setActiveTab} />;
      case "calendar":
        return <CalendarTab />;
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
    if (!hasClub && activeTab !== "create-club") {
      return <CreateClubTab onClubCreated={() => setHasClub(true)} />;
    }

    switch (activeTab) {
      case "club-home":
        return <ClubHomeTab setActiveTab={setActiveTab} userRole={userRole} />;
      case "events":
        return <EventsTab userRole={userRole} />;
      case "members":
        return <MembersTab userRole={userRole} />;
      case "notices":
        return <NoticesTab userRole={userRole} />;
      case "awards":
        return <AwardsTab userRole={userRole} />;
      case "create-club":
        return <CreateClubTab onClubCreated={() => setHasClub(true)} />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <ClubSettingsTab userRole={userRole} />;
      default:
        return <ClubHomeTab setActiveTab={setActiveTab} userRole={userRole} />;
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
      case "calendar":
        return <CalendarTab />;
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
      case "calendar":
        return <CalendarTab />;
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
      case "calendar":
        return <CalendarTab />;
      case "department-management":
        return <DepartmentManagementTab />;
      case "club-management":
        return <ClubManagementTab />;
      case "email-broadcast":
        return <EmailBroadcastingTab />;
      case "approvals":
        return <ApprovalsTab />;
      case "user-management":
        return <UserManagementTab />;
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
    if (userRole === "super-admin") {
      return renderSuperAdminContent();
    }
    if (userRole === "college-admin") {
      return renderCollegeAdminContent();
    }
    if (userRole === "club-admin" || userRole === "club-advisor") {
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
    return renderStudentContent();
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}
