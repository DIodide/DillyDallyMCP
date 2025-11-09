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

    // Get snapshots and metadata for this session
    const [snapshots, metadata, activities] = await Promise.all([
      client.query(api.functions.getSessionSnapshots, {
        sessionId: sessionId as any,
      }),
      client.query(api.functions.getSessionMetadata, {
        sessionId: sessionId as any,
      }),
      client.query(api.functions.getSessionActivities, {
        sessionId: sessionId as any,
      }),
    ]);

    if (!snapshots || snapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Session with ID ${sessionId} not found or has no snapshots.`,
          },
        ],
        isError: false,
      };
    }

    const sortedSnapshots = snapshots.sort((a: any, b: any) => a.timestamp - b.timestamp);
    const startDate = new Date(sortedSnapshots[0].timestamp);
    const endDate = new Date(sortedSnapshots[sortedSnapshots.length - 1].timestamp);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;

    // Get unique tabs
    const tabs = Array.from(new Set(snapshots.map((s: any) => s.currentTab).filter(Boolean)));

    const result = {
      sessionId: sessionId,
      startTime: startDate.toISOString(),
      readableStartTime: startDate.toLocaleString(),
      endTime: endDate.toISOString(),
      readableEndTime: endDate.toLocaleString(),
      duration: `${durationHours}h ${remainingMinutes}m`,
      durationMs: durationMs,
      snapshotCount: snapshots.length,
      productivityPercentage: metadata?.productivityPercentage ? `${metadata.productivityPercentage}%` : 
        (snapshots.length > 0 ? `${Math.round((snapshots.filter((s: any) => s.isProductive).length / snapshots.length) * 100)}%` : "0%"),
      productiveSnapshots: snapshots.filter((s: any) => s.isProductive).length,
      nonProductiveSnapshots: snapshots.filter((s: any) => !s.isProductive).length,
      activities: activities || [],
      tabs: tabs,
      snapshots: sortedSnapshots.map((s: any) => ({
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

