import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting session details
 */
export const getSessionDetailsToolDefinition: Tool = {
  name: "get_session_details",
  description: "Get detailed information about a specific DillyDally session, including all snapshots, activity breakdown, productivity metrics, and session duration.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "The session ID to get details for",
      },
    },
    required: ["sessionId"],
  },
};

/**
 * Handles the get_session_details tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetSessionDetails(
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args || typeof args !== "object") {
      return {
        content: [
          {
            type: "text",
            text: "Error: Arguments must be an object with sessionId",
          },
        ],
        isError: true,
      };
    }

    const { sessionId } = args as { sessionId?: unknown };

    if (typeof sessionId !== "string") {
      return {
        content: [
          {
            type: "text",
            text: "Error: sessionId must be a string",
          },
        ],
        isError: true,
      };
    }

    const client = getConvexClient();
    const api = await getConvexApi();

    const sessionSummary = await client.query(api.functions.getSessionSummary, {
      sessionId: sessionId as any,
    });

    if (!sessionSummary) {
      return {
        content: [
          {
            type: "text",
            text: `Session with ID ${sessionId} not found.`,
          },
        ],
        isError: false,
      };
    }

    const startDate = new Date(sessionSummary.startTime);
    const endDate = new Date(sessionSummary.endTime);
    const durationMinutes = Math.round(sessionSummary.durationMs / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;

    const result = {
      sessionId: sessionSummary.session._id,
      startTime: startDate.toISOString(),
      readableStartTime: startDate.toLocaleString(),
      endTime: endDate.toISOString(),
      readableEndTime: endDate.toLocaleString(),
      duration: `${durationHours}h ${remainingMinutes}m`,
      durationMs: sessionSummary.durationMs,
      snapshotCount: sessionSummary.snapshotCount,
      productivityPercentage: `${sessionSummary.productivityPercentage}%`,
      productiveSnapshots: sessionSummary.productiveCount,
      nonProductiveSnapshots: sessionSummary.nonProductiveCount,
      activities: sessionSummary.activities,
      tabs: sessionSummary.tabs,
      snapshots: sessionSummary.snapshots.map((s: any) => ({
        id: s._id,
        timestamp: new Date(s.timestamp).toISOString(),
        readableTime: new Date(s.timestamp).toLocaleString(),
        activity: s.activity,
        isProductive: s.isProductive ? "Yes" : "No",
        summary: s.summary,
        currentTab: s.currentTab,
      })),
    };

    return {
      content: [
        {
          type: "text",
          text: `Session Details:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching session details: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

