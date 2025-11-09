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
    const { timeRangeHours } = (args as { timeRangeHours?: number }) || {};
    const client = getConvexClient();
    const api = await getConvexApi();

    const stats = await client.query(api.functions.getProductivityStats, {
      timeRangeHours,
    });

    if (!stats) {
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

    const result = {
      timeRangeHours: stats.timeRangeHours,
      productivityPercentage: `${stats.productivityPercentage}%`,
      totalSnapshots: stats.totalSnapshots,
      productiveSnapshots: stats.productiveSnapshots,
      nonProductiveSnapshots: stats.nonProductiveSnapshots,
      summary: `Over the last ${stats.timeRangeHours} hours, ${stats.productivityPercentage}% of activities were productive (${stats.productiveSnapshots} out of ${stats.totalSnapshots} snapshots).`,
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

