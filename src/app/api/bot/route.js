import { Bot, webhookCallback } from "grammy";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Notice from "@/models/Notice";
import ClubEvent from "@/models/ClubEvent";
import Class from "@/models/Class";
import Schedule from "@/models/Schedule";
import ScheduleOverride from "@/models/ScheduleOverride";

// Force Serverless Function runtime to execute dynamically without caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is missing");
}

const bot = new Bot(token);

// Register a global error handler to prevent webhook crashes
bot.catch((err) => {
  console.error("Telegram Bot Error:", err);
});

// ==========================================
// Helper functions for modular bot commands
// ==========================================

async function handleHelp(ctx) {
  const helpText =
    `ℹ️ Available Bot Commands:\n\n` +
    `• /login <email> <password> : Pairs your Telegram account with your student portal by logging in. Example: /login alex@example.com mypassword123\n` +
    `• /classes : Fetches your dynamic class schedule and rescheduling overrides for the next 48 hours.\n` +
    `• /classOn <day> : Fetches classes scheduled for a specific day. Example: /classOn Monday\n` +
    `• /news : Lists the latest three announcements and important circulars.\n` +
    `• /events : Shows upcoming club competitions, hackathons, and volunteer opportunities.\n` +
    `• Ask any question to chat with AI guide.`;
  await ctx.reply(helpText);
}

async function handleNews(ctx) {
  try {
    await dbConnect();
    const notices = await Notice.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(3);

    if (notices.length === 0) {
      await ctx.reply("📢 No recent notices found.");
      return;
    }

    const noticeLines = notices.map((n, idx) => {
      const type = n.type ? `[${n.type.toUpperCase()}]` : "";
      return `${idx + 1}. ${type} *${n.title}*\n${n.content}`;
    });

    await ctx.reply(
      `📢 *Latest Campus Notices:*\n\n${noticeLines.join("\n\n")}`,
      {
        parse_mode: "Markdown",
      },
    );
  } catch (err) {
    console.error("Fetch bot news error:", err);
    await ctx.reply("❌ Failed to load notices. Please try again later.");
  }
}

async function handleEvents(ctx) {
  try {
    await dbConnect();
    const events = await ClubEvent.find({ status: "upcoming" })
      .sort({ date: 1 })
      .limit(3);

    if (events.length === 0) {
      await ctx.reply("🎉 No upcoming events found.");
      return;
    }

    const eventLines = events.map((e, idx) => {
      const d = new Date(e.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${idx + 1}. *${e.title}*\n📅 ${d} at ${e.time}\n📍 Location: ${e.location}`;
    });

    await ctx.reply(
      `🎉 *Upcoming Campus Events:*\n\n${eventLines.join("\n\n")}`,
      {
        parse_mode: "Markdown",
      },
    );
  } catch (err) {
    console.error("Fetch bot events error:", err);
    await ctx.reply("❌ Failed to load events. Please try again later.");
  }
}

async function handleClasses(ctx, targetDayName = null) {
  try {
    await dbConnect();

    // Find user by Telegram Chat ID
    const student = await User.findOne({
      telegramChatId: ctx.chat.id.toString(),
    });
    if (!student) {
      await ctx.reply(
        "🔒 Account not linked. Please log in first by typing:\n" +
          "/login your-email@example.com your-password",
      );
      return;
    }

    if (!student.batch || !student.department) {
      await ctx.reply(
        "⚠️ Student profile is missing batch or department configurations.",
      );
      return;
    }

    // Resolve student classes
    const classes = await Class.find({
      batch: student.batch,
      department: student.department,
      institute: student.institute,
    });

    if (classes.length === 0) {
      await ctx.reply("📅 No classes assigned to your batch.");
      return;
    }

    const classCodes = classes.map((c) => c.code.toLowerCase());
    const classMapByCode = {};
    classes.forEach((c) => {
      classMapByCode[c.code.toLowerCase()] = c;
    });

    // Fetch schedules
    const activeSchedules = await Schedule.find({
      department: student.department,
      institute: student.institute,
      batch: student.batch,
      status: "active",
    });

    // Resolve Faculty
    const facultyUsers = await User.find({ role: "faculty" }, "name email");
    const facultyMap = {};
    facultyUsers.forEach((f) => {
      if (f.email) facultyMap[f.email.toLowerCase().trim()] = f.name;
      if (f.name) facultyMap[f.name.toLowerCase().trim()] = f.name;
    });

    // Resolve target dates
    let targetDates = [];
    const today = new Date();
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    if (targetDayName) {
      const normalizedDay = targetDayName.toLowerCase().trim();
      if (normalizedDay === "today") {
        targetDates = [today];
      } else if (normalizedDay === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        targetDates = [tomorrow];
      } else if (weekdays.includes(normalizedDay)) {
        const targetIdx = weekdays.indexOf(normalizedDay);
        // Find the next occurrence of this weekday in the next 7 days (including today)
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          if (checkDate.getDay() === targetIdx) {
            targetDates.push(checkDate);
            break;
          }
        }
      }
    }

    // Default to Today + Tomorrow if no valid targetDate is found
    if (targetDates.length === 0) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDates = [today, tomorrow];
    }

    const schedulesList = [];
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    targetDates.forEach((currentDate) => {
      const dayName = daysOfWeek[currentDate.getDay()];
      const dateString = currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      activeSchedules.forEach((sched) => {
        sched.scheduleData.forEach((slot) => {
          if (slot.day.toLowerCase() === dayName.toLowerCase()) {
            const slotSubjectLower = slot.subject.toLowerCase();
            if (classCodes.includes(slotSubjectLower)) {
              const matchedClass = classMapByCode[slotSubjectLower];
              const rawFac = (slot.faculty || "").toLowerCase().trim();
              const facultyName =
                facultyMap[rawFac] || slot.faculty || "Not Assigned";

              schedulesList.push({
                classId: matchedClass._id.toString(),
                subject: matchedClass.name,
                code: matchedClass.code,
                date: dateString,
                day: slot.day,
                time: slot.time,
                room: slot.room || "TBD",
                faculty: facultyName,
                status: "scheduled",
              });
            }
          }
        });
      });
    });

    // Load overrides
    const overrides = await ScheduleOverride.find({
      classId: { $in: classes.map((c) => c._id) },
    }).populate("classId");

    const finalSchedules = [];
    const overridesMap = {};
    overrides.forEach((o) => {
      if (o.classId) {
        const oDateStr = new Date(o.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const key = `${o.classId._id.toString()}_${oDateStr}_${o.originalTime}`;
        overridesMap[key] = o;
      }
    });

    schedulesList.forEach((slot) => {
      const overrideKey = `${slot.classId}_${slot.date}_${slot.time}`;
      const matchedOverride = overridesMap[overrideKey];

      if (matchedOverride) {
        if (matchedOverride.actionType === "cancel") {
          finalSchedules.push({
            ...slot,
            status: "cancelled",
            cancelReason: matchedOverride.reason || "Cancelled",
          });
        } else if (matchedOverride.actionType === "reschedule") {
          finalSchedules.push({
            ...slot,
            status: "rescheduled",
            rescheduleReason: matchedOverride.reason || "Rescheduled",
          });

          const newDateStr = new Date(
            matchedOverride.newDate,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          finalSchedules.push({
            classId: slot.classId,
            subject: slot.subject,
            code: slot.code,
            date: newDateStr,
            day: new Date(matchedOverride.newDate).toLocaleDateString("en-US", {
              weekday: "long",
            }),
            time: matchedOverride.newTime,
            room: slot.room,
            faculty: slot.faculty,
            status: "rescheduled",
          });
        }
      } else {
        finalSchedules.push(slot);
      }
    });

    if (finalSchedules.length === 0) {
      if (targetDayName) {
        await ctx.reply(`📅 No classes scheduled for ${targetDayName}.`);
      } else {
        await ctx.reply("📅 No classes scheduled for today or tomorrow.");
      }
      return;
    }

    // Format output lines
    const scheduleGroups = {};
    finalSchedules.forEach((s) => {
      if (!scheduleGroups[s.date]) scheduleGroups[s.date] = [];
      scheduleGroups[s.date].push(s);
    });

    let messageText = "📅 *Your Timetable & Schedule overrides:*\n\n";
    Object.keys(scheduleGroups).forEach((dateKey) => {
      messageText += `*${dateKey}:*\n`;
      scheduleGroups[dateKey].forEach((s) => {
        let statusTag = "";
        if (s.status === "cancelled") statusTag = " ❌ [CANCELLED]";
        if (s.status === "rescheduled") statusTag = " 🔄 [RESCHEDULED]";

        messageText +=
          ` • *${s.time}* - ${s.subject} (${s.code})${statusTag}\n` +
          `   Room: ${s.room} | Prof: ${s.faculty}\n`;
        if (s.cancelReason) messageText += `   Reason: ${s.cancelReason}\n`;
        if (s.rescheduleReason)
          messageText += `   Reason: ${s.rescheduleReason}\n`;
      });
      messageText += "\n";
    });

    await ctx.reply(messageText, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Fetch classes bot error:", err);
    await ctx.reply(
      "❌ Failed to query class timetables. Please try again later.",
    );
  }
}

// ==========================================
// GrammY Bot command listeners registrations
// ==========================================

// 1. /start command
bot.command("start", async (ctx) => {
  const welcomeMessage =
    `🎓 Welcome to UniVerse Campus Bot!\n\n` +
    `I can help you stay on top of your daily campus schedules and announcements.\n\n` +
    `Here are my commands:\n` +
    `👉 /login <email> <password> - Log in and link your portal account\n` +
    `👉 /classes - View recent classes (today & tomorrow)\n` +
    `👉 /classOn <day> - View classes on a specific day (e.g. /classOn Monday)\n` +
    `👉 /news - Get the latest notices & announcements\n` +
    `👉 /events - Get upcoming campus events & details\n` +
    `👉 /help - Show available instructions\n\n` +
    `Or just chat with me! I'm powered by Google Gemini and can answer any questions you have.`;

  await ctx.reply(welcomeMessage);
});

// 2. /help command
bot.command("help", async (ctx) => {
  await handleHelp(ctx);
});

// 3. /login <email> <password> command
bot.command("login", async (ctx) => {
  const args = ctx.match ? ctx.match.trim().split(/\s+/) : [];
  if (args.length < 2) {
    await ctx.reply("❌ Invalid format. Use: /login <email> <password>");
    return;
  }
  const email = args[0].toLowerCase().trim();
  const password = args[1];

  try {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      await ctx.reply(
        "❌ No registered student profile found with that email address.",
      );
      return;
    }

    if (!user.password) {
      await ctx.reply(
        "❌ Password authentication is not supported for this account (e.g. Google OAuth sign-in).",
      );
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await ctx.reply("❌ Incorrect password. Please try again.");
      return;
    }

    user.telegramChatId = ctx.chat.id.toString();
    await user.save();

    await ctx.reply(
      `✅ Login Successful!\n\n` +
        `Welcome, ${user.name}! Your Telegram account has been linked to portal profile: ${user.email}.\n` +
        `You can now use /classes to view your class schedules.`,
    );
  } catch (err) {
    console.error("Login and link account error:", err);
    await ctx.reply("❌ Failed to log in. Please try again later.");
  }
});

// 4. /news command
bot.command("news", async (ctx) => {
  await handleNews(ctx);
});

// 5. /events command
bot.command("events", async (ctx) => {
  await handleEvents(ctx);
});

// 6. /classes command (for recent classes today/tomorrow)
bot.command("classes", async (ctx) => {
  await handleClasses(ctx, null);
});

// 6b. /classOn command (for classes on a specific day)
bot.command(["classon", "classOn"], async (ctx) => {
  const param = ctx.match ? ctx.match.trim() : null;
  if (!param) {
    await ctx.reply("❌ Please specify a day. Example: /classOn Monday");
    return;
  }
  await handleClasses(ctx, param);
});

// Clean markdown code blocks from JSON string
function cleanJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }
  return cleaned;
}
// 7. General natural language conversational query classifier
bot.on("message:text", async (ctx) => {
  const query = ctx.message.text ? ctx.message.text.trim() : "";
  if (!query || query.startsWith("/")) return;

  await ctx.reply("💬 Thinking...");

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      await ctx.reply(
        "My AI brains are sleeping right now (missing API Key). Try commands like /news or /events!",
      );
      return;
    }

    const systemPrompt =
      `Classify the following user query for a campus bot and return a valid JSON object.\n` +
      `JSON Schema:\n` +
      `{\n` +
      `  "command": "classes" | "news" | "events" | "help" | "none",\n` +
      `  "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday" | "today" | "tomorrow" | null\n` +
      `}\n\n` +
      `Command Guidelines:\n` +
      `- "classes": User is asking for class schedules, timetables, or session cancellations/reschedules (e.g. "is there any class on monday", "do I have classes tomorrow", "show schedule").\n` +
      `- "news": User is asking for recent notices, circulars, or news updates (e.g. "any announcements?", "show me the notices").\n` +
      `- "events": User is asking for upcoming campus events, club activities, or listings (e.g. "what events are coming up?", "tell me about events").\n` +
      `- "help": User is asking for help, manual, or instructions on how to use the bot.\n` +
      `- "none": Default for chit-chat, greetings, or other questions.\n\n` +
      `User Query: "${query}"\n` +
      `Return ONLY the JSON string. Do not include markdown formatting tags.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API returned error ${response.status}:`, errText);
      await ctx.reply(
        "I received your query! How can I assist you with campus notices or classes?",
      );
      return;
    }

    const data = await response.json();
    let replyText = "";
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      replyText = data.candidates[0].content.parts[0].text;
    }

    // Clean and parse JSON response
    let action = {
      command: "none",
      day: null,
    };

    try {
      const cleaned = cleanJson(replyText);
      action = JSON.parse(cleaned);
    } catch (e) {
      console.error(
        "JSON parsing error for Gemini classification:",
        e,
        "Raw response:",
        replyText,
      );
    }

    // Route execution dynamically based on AI analysis
    if (action.command === "classes") {
      await handleClasses(ctx, action.day);
    } else if (action.command === "news") {
      await handleNews(ctx);
    } else if (action.command === "events") {
      await handleEvents(ctx);
    } else if (action.command === "help") {
      await handleHelp(ctx);
    } else {
      // 2nd call: fetch chat response dynamically for general chit-chat queries
      const chatPrompt =
        "You are the official UniVerse Campus Connect virtual AI guide helper. " +
        `Politely and concisely answer this query: "${query}"`;

      try {
        const chatController = new AbortController();
        const chatTimeout = setTimeout(() => chatController.abort(), 6000);

        const response2 = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: chatPrompt }] }],
            }),
            signal: chatController.signal,
          },
        );
        clearTimeout(chatTimeout);

        if (response2.ok) {
          const data2 = await response2.json();
          if (
            data2.candidates &&
            data2.candidates[0] &&
            data2.candidates[0].content &&
            data2.candidates[0].content.parts &&
            data2.candidates[0].content.parts[0]
          ) {
            await ctx.reply(data2.candidates[0].content.parts[0].text);
            return;
          }
        }
      } catch (chatErr) {
        console.error("Gemini chit-chat generator error:", chatErr);
      }

      await ctx.reply(
        "I received your query! How can I assist you with campus notices or classes?",
      );
    }
  } catch (err) {
    console.error("Gemini classification query error:", err);
    await ctx.reply(
      "I received your query! How can I assist you with campus notices or classes?",
    );
  }
});

// Deduplication cache for Telegram Webhook updates to prevent parallel retries
const processedUpdates = new Set();
const handler = webhookCallback(bot, "std/http");

// Webhook callback export
export async function POST(req) {
  try {
    // Clone the request to prevent consuming the body prematurely
    const clone = req.clone();
    const update = await clone.json();

    if (update && update.update_id) {
      if (processedUpdates.has(update.update_id)) {
        console.log(`Duplicate Telegram update ignored: ${update.update_id}`);
        return new Response("OK", { status: 200 });
      }
      processedUpdates.add(update.update_id);

      // Limit memory footprint of the Set cache
      if (processedUpdates.size > 200) {
        const firstVal = processedUpdates.values().next().value;
        processedUpdates.delete(firstVal);
      }
    }

    return await handler(req);
  } catch (err) {
    console.error("Telegram webhook handler error:", err);
    return new Response("Error", { status: 500 });
  }
}
