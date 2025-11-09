import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting all sessions
 */
export const getAllSessionsToolDefinition: Tool = {
  name: "get_all_sessions",
  description: "Get all DillyDally sessions for the current user. Returns a list of sessions with metadata including duration, creation time, and basic stats.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Handles the get_all_sessions tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetAllSessions(
  args: unknown
): Promise<CallToolResult> {
  try {
    const client = getConvexClient();
    const api = await getConvexApi();

    const sessions = await client.query(api.functions.getAllSessions, {});

    if (!sessions || sessions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No sessions found.",
          },
        ],
        isError: false,
      };
    }

    const formattedSessions = sessions.map((session: any) => {
      const creationDate = new Date(session._creationTime);
      const durationMinutes = Math.round(session.duration / 60000);
      const durationHours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      
      return {
        sessionId: session._id,
        createdAt: creationDate.toISOString(),
        readableCreatedAt: creationDate.toLocaleString(),
        duration: `${durationHours}h ${remainingMinutes}m`,
        durationMs: session.duration,
        activityCount: session.activityCount,
        snapshotCount: session.snapshotCount,
        productivityPercentage: `${session.productivityPercentage}%`,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${sessions.length} sessions:\n\n${JSON.stringify(
            formattedSessions,
            null,
            2
          )}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching all sessions: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


