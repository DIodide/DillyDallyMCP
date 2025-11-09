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
    const { limit } = (args as { limit?: number }) || {};
    const client = getConvexClient();
    const api = await getConvexApi();

    const activities = await client.query(api.functions.getRecentActivity, {
      limit,
    });

    if (!activities || activities.length === 0) {
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

    const formattedActivities = activities.map((activity: any) => {
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
          text: `Found ${activities.length} recent activities:\n\n${JSON.stringify(
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

