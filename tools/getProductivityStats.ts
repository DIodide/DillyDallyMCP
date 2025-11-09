import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting productivity statistics
 */
export const getProductivityStatsToolDefinition: Tool = {
  name: "get_productivity_stats",
  description: "Get productivity statistics over a specified time range. Returns productivity percentage, total snapshots, and breakdown of productive vs non-productive activities.",
  inputSchema: {
    type: "object",
    properties: {
      timeRangeHours: {
        type: "number",
        description: "Number of hours to look back for statistics (default: 24)",
      },
    },
    required: [],
  },
};

/**
 * Handles the get_productivity_stats tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetProductivityStats(
  args: unknown
): Promise<CallToolResult> {
  try {
    const { timeRangeHours = 24 } = (args as { timeRangeHours?: number }) || {};
    const client = getConvexClient();
    const api = await getConvexApi();

    // Get all sessions
    const sessions = await client.query(api.functions.getAllSessions, {});
    
    if (!sessions || sessions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No productivity statistics available.",
          },
        ],
        isError: false,
      };
    }

    // Calculate cutoff time
    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    
    // Get snapshots from all sessions within the time range
    let allSnapshots: any[] = [];
    for (const session of sessions) {
      const snapshots = await client.query(api.functions.getSessionSnapshots, {
        sessionId: session._id,
      });
      if (snapshots) {
        const filteredSnapshots = snapshots.filter((s: any) => s.timestamp >= cutoffTime);
        allSnapshots = allSnapshots.concat(filteredSnapshots);
      }
    }

    if (allSnapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No productivity statistics available for the specified time range.",
          },
        ],
        isError: false,
      };
    }

    const productiveSnapshots = allSnapshots.filter((s: any) => s.isProductive).length;
    const nonProductiveSnapshots = allSnapshots.length - productiveSnapshots;
    const productivityPercentage = Math.round((productiveSnapshots / allSnapshots.length) * 100 * 100) / 100;

    const result = {
      timeRangeHours: timeRangeHours,
      productivityPercentage: `${productivityPercentage}%`,
      totalSnapshots: allSnapshots.length,
      productiveSnapshots: productiveSnapshots,
      nonProductiveSnapshots: nonProductiveSnapshots,
      summary: `Over the last ${timeRangeHours} hours, ${productivityPercentage}% of activities were productive (${productiveSnapshots} out of ${allSnapshots.length} snapshots).`,
    };

    return {
      content: [
        {
          type: "text",
          text: `Productivity Statistics:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching productivity stats: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

