import { google } from "googleapis";

export type CreateMeetLinkResponse = {
    meetLink: string,
    eventId: string
}
export const createMeetLink = async (startTime: string, endTime: string, refreshToken: string, attendeeEmail?: string): Promise<CreateMeetLinkResponse | null> => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    );
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth });
    const { data } = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1, // ← this is what triggers Meet link generation
        requestBody: {
        summary: "Therapy reservation",
        start: { dateTime: startTime }, // ISO 8601 e.g. "2026-05-10T14:00:00Z"
        end:   { dateTime: endTime },
        ...(attendeeEmail ? { attendees: [{ email: attendeeEmail }] } : {}),
        conferenceData: {
            createRequest: {
            requestId: `meet-${Date.now()}`, // must be unique per event
            conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        },
        },
    });

    const res = {
        meetLink: data.conferenceData?.entryPoints?.[0]?.uri,
        eventId: data.id,
    };

    if (!res.meetLink || !res.eventId) {
        return null;
    }

    return res as CreateMeetLinkResponse;
}