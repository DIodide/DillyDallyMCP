import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting last session details
 */
export const getLastSessionToolDefinition: Tool = {
  name: "get_last_session",
  description: "Get details of the most recent DillyDally session, including all snapshots, activity summary, and session metadata.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Handles the get_last_session tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetLastSession(
  args: unknown
): Promise<CallToolResult> {
  try {
    const client = getConvexClient();
    const api = await getConvexApi();

    const sessionData = await client.query(api.functions.getLastSessionDetails, {});

    if (!sessionData) {
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

    const startDate = new Date(sessionData.startTime);
    const formattedSnapshots = sessionData.snapshots.map((snapshot: any) => {
      const date = new Date(snapshot.timestamp);
      return {
        id: snapshot._id,
        timestamp: date.toISOString(),
        readableTime: date.toLocaleString(),
        activity: snapshot.activity,
        isProductive: snapshot.isProductive ? "Yes" : "No",
        summary: snapshot.summary,
        currentTab: snapshot.currentTab,
      };
    });

    const productiveCount = sessionData.snapshots.filter(
      (s: any) => s.isProductive
    ).length;
    const productivityPercentage =
      sessionData.snapshotCount > 0
        ? Math.round((productiveCount / sessionData.snapshotCount) * 100 * 100) /
          100
        : 0;

    const result = {
      sessionId: sessionData.session._id,
      startTime: startDate.toISOString(),
      readableStartTime: startDate.toLocaleString(),
      snapshotCount: sessionData.snapshotCount,
      productivityPercentage: `${productivityPercentage}%`,
      productiveSnapshots: productiveCount,
      nonProductiveSnapshots: sessionData.snapshotCount - productiveCount,
      snapshots: formattedSnapshots,
    };

    return {
      content: [
        {
          type: "text",
          text: `Last Session Details:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching last session: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

