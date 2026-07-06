import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_EVENTS;

export const eventService = {
  async listAll() {
    const res = await databases.listDocuments(DB, COL, [
      Query.orderDesc("date"),
    ]);
    return res.documents;
  },

  async getById(eventId) {
    return databases.getDocument(DB, COL, eventId);
  },

  async getByClubId(clubId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("clubId", clubId),
    ]);
    return res.documents;
  },

  async create({
    title,
    description,
    date,
    time,
    location,
    status,
    clubId,
    maxParticipants,
  }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      title,
      description,
      date,
      time,
      location,
      status,
      clubId,
      maxParticipants,
      registrations: 0,
      volunteers: [],
    });
  },

  async update(eventId, updates) {
    return databases.updateDocument(DB, COL, eventId, updates);
  },

  async delete(eventId) {
    return databases.deleteDocument(DB, COL, eventId);
  },
};
