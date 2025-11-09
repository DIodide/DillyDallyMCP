import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting recent activity
 */
export const getRecentActivityToolDefinition: Tool = {
  name: "get_recent_activity",
  description: "Get recent activity snapshots from DillyDally. Returns the most recent activity snapshots with details like activity type, productivity status, and timestamps.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Number of recent activities to return (default: 10)",
      },
    },
    required: [],
  },
};

/**
 * Handles the get_recent_activity tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetRecentActivity(
  args: unknown
): Promise<CallToolResult> {
  try {
    const { limit = 10 } = (args as { limit?: number }) || {};
    const client = getConvexClient();
    const api = await getConvexApi();

    // Get all sessions first, then get snapshots from the most recent session
    const sessions = await client.query(api.functions.getAllSessions, {});
    
    if (!sessions || sessions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No recent activity found.",
          },
        ],
        isError: false,
      };
    }

    // Get snapshots from the most recent session
    const mostRecentSession = sessions[0];
    const snapshots = await client.query(api.functions.getSessionSnapshots, {
      sessionId: mostRecentSession._id,
    });

    if (!snapshots || snapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No recent activity found.",
          },
        ],
        isError: false,
      };
    }

    // Sort by timestamp descending and limit
    const sortedSnapshots = snapshots
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, limit);

    const formattedActivities = sortedSnapshots.map((activity: any) => {
      const date = new Date(activity.timestamp);
      return {
        id: activity._id,
        timestamp: date.toISOString(),
        readableTime: date.toLocaleString(),
        activity: activity.activity,
        isProductive: activity.isProductive ? "Yes" : "No",
        summary: activity.summary,
        currentTab: activity.currentTab,
        sessionId: activity.sessionId,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${formattedActivities.length} recent activities:\n\n${JSON.stringify(
            formattedActivities,
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
          text: `Error fetching recent activity: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

