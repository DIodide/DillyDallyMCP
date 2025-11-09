import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting current user
 */
export const getCurrentUserToolDefinition: Tool = {
  name: "get_current_user",
  description: "Get information about the currently authenticated user. Returns user details including ID, email, and name.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Handles the get_current_user tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetCurrentUser(
  args: unknown
): Promise<CallToolResult> {
  try {
    const client = getConvexClient();
    const api = await getConvexApi();

    const user = await client.query(api.functions.currentUser, {});

    if (!user) {
      return {
        content: [
          {
            type: "text",
            text: "No authenticated user found. User may not be logged in.",
          },
        ],
        isError: false,
      };
    }

    const result = {
      userId: user._id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user._creationTime).toISOString(),
      readableCreatedAt: new Date(user._creationTime).toLocaleString(),
    };

    return {
      content: [
        {
          type: "text",
          text: `Current User:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching current user: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


