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

    // Get all sessions and use the first one (most recent)
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

    const mostRecentSession = sessions[0];
    
    // Get snapshots and metadata for this session
    const [snapshots, metadata] = await Promise.all([
      client.query(api.functions.getSessionSnapshots, {
        sessionId: mostRecentSession._id,
      }),
      client.query(api.functions.getSessionMetadata, {
        sessionId: mostRecentSession._id,
      }),
    ]);

    if (!snapshots || snapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No snapshots found for the most recent session.",
          },
        ],
        isError: false,
      };
    }

    const sortedSnapshots = snapshots.sort((a: any, b: any) => a.timestamp - b.timestamp);
    const startDate = new Date(sortedSnapshots[0].timestamp);
    const endDate = new Date(sortedSnapshots[sortedSnapshots.length - 1].timestamp);

    const formattedSnapshots = sortedSnapshots.map((snapshot: any) => {
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

    const productiveCount = sortedSnapshots.filter((s: any) => s.isProductive).length;
    const productivityPercentage = metadata?.productivityPercentage || 
      (sortedSnapshots.length > 0 ? Math.round((productiveCount / sortedSnapshots.length) * 100 * 100) / 100 : 0);

    const result = {
      sessionId: mostRecentSession._id,
      startTime: startDate.toISOString(),
      readableStartTime: startDate.toLocaleString(),
      endTime: endDate.toISOString(),
      readableEndTime: endDate.toLocaleString(),
      snapshotCount: sortedSnapshots.length,
      productivityPercentage: `${productivityPercentage}%`,
      productiveSnapshots: productiveCount,
      nonProductiveSnapshots: sortedSnapshots.length - productiveCount,
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

