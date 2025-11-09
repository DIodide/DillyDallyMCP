import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting session activities
 */
export const getSessionActivitiesToolDefinition: Tool = {
  name: "get_session_activities",
  description: "Get unique activity names for a specific session. Returns a list of all distinct activities that occurred during the session.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "The session ID to get activities for",
      },
    },
    required: ["sessionId"],
  },
};

/**
 * Handles the get_session_activities tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetSessionActivities(
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

    const activities = await client.query(api.functions.getSessionActivities, {
      sessionId: sessionId as any,
    });

    if (!activities || activities.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No activities found for session ${sessionId}.`,
          },
        ],
        isError: false,
      };
    }

    const result = {
      sessionId,
      activityCount: activities.length,
      activities,
    };

    return {
      content: [
        {
          type: "text",
          text: `Session Activities:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching session activities: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


