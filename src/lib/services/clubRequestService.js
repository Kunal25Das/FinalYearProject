import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_CLUB_REQUESTS;

export const clubRequestService = {
  async sendRequest({
    clubId,
    clubName,
    studentId,
    studentName,
    studentEmail,
  }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      clubId,
      clubName,
      studentId,
      studentName,
      studentEmail,
      status: "pending",
      message: "Joining Request",
      requestedAt: new Date().toISOString(),
    });
  },

  async getStudentRequest(clubId, studentId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("clubId", clubId),
      Query.equal("studentId", studentId),
    ]);
    return res.documents[0] || null;
  },

  async getClubRequests(clubId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("clubId", clubId),
      Query.equal("status", "pending"),
      Query.orderDesc("$createdAt"),
    ]);
    return res.documents;
  },

  async approve(requestDocId) {
    return databases.updateDocument(DB, COL, requestDocId, {
      status: "approved",
    });
  },

  async reject(requestDocId) {
    return databases.updateDocument(DB, COL, requestDocId, {
      status: "rejected",
    });
  },

  async cancel(requestDocId) {
    return databases.deleteDocument(DB, COL, requestDocId);
  },
};
