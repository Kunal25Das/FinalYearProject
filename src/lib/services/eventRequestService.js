import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_EVENT_REQUESTS;

export const eventRequestService = {
  async sendRequest({
    clubId,
    eventId,
    eventName,
    studentId,
    studentName,
    studentEmail,
  }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      clubId,
      eventId,
      eventName,
      studentId,
      studentName,
      studentEmail,
      status: "pending",
      message: "Event Joining Request",
      requestedAt: new Date().toISOString(),
    });
  },

  async getStudentRequest(eventId, studentId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("eventId", eventId),
      Query.equal("studentId", studentId),
    ]);
    return res.documents[0] || null;
  },

  async getClubRequests(clubId) {
    const queries = [
      Query.equal("clubId", clubId),
      Query.orderDesc("$createdAt"),
    ];
    if (status) queries.push(Query.equal("status", status));

    const res = await databases.listDocuments(DB, COL, queries);
    return res.documents;
  },

  async approve(requestDocId) {
    return databases.updateDocument(DB, COL, requestDocId, {
      status: "accepted",
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
