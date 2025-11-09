import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting weekly insights
 */
export const getWeeklyInsightsToolDefinition: Tool = {
  name: "get_weekly_insights",
  description: "Get comprehensive weekly productivity insights including focus time, sessions completed, average session length, current streak, weekly goal progress, distraction alerts, AI assistance time, and trends compared to last week.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Handles the get_weekly_insights tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetWeeklyInsights(
  args: unknown
): Promise<CallToolResult> {
  try {
    const client = getConvexClient();
    const api = await getConvexApi();

    const insights = await client.query(api.functions.getWeeklyInsights, {});

    if (!insights) {
      return {
        content: [
          {
            type: "text",
            text: "No weekly insights available. User may not be authenticated.",
          },
        ],
        isError: false,
      };
    }

    const formatTime = (ms: number): string => {
      const hours = Math.floor(ms / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      return `${hours}h ${minutes}m`;
    };

    const result = {
      thisWeek: {
        totalFocusTime: formatTime(insights.totalFocusTime),
        totalFocusTimeMs: insights.totalFocusTime,
        sessionsCompleted: insights.sessionsCompleted,
        averageSessionLength: formatTime(insights.averageSessionLength),
        averageSessionLengthMs: insights.averageSessionLength,
        currentStreak: `${insights.currentStreak} days`,
        weeklyGoalProgress: `${insights.weeklyGoalProgress.toFixed(1)}%`,
        distractionAlerts: insights.distractionAlerts,
        aiAssistanceTime: formatTime(insights.aiAssistanceTime),
        aiAssistanceTimeMs: insights.aiAssistanceTime,
        focusWithoutAI: `${insights.focusWithoutAI.toFixed(1)}%`,
      },
      trends: {
        totalFocusTimeTrend: insights.totalFocusTimeTrend,
        sessionsCompletedTrend: insights.sessionsCompletedTrend,
        averageSessionLengthTrend: insights.averageSessionLengthTrend,
        distractionAlertsTrend: insights.distractionAlertsTrend,
        aiAssistanceTimeTrend: insights.aiAssistanceTimeTrend,
      },
      summary: `This week: ${insights.sessionsCompleted} sessions completed, ${formatTime(insights.totalFocusTime)} focus time, ${insights.currentStreak} day streak. Trends: ${insights.totalFocusTimeTrend} focus time, ${insights.sessionsCompletedTrend} sessions.`,
    };

    return {
      content: [
        {
          type: "text",
          text: `Weekly Insights:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching weekly insights: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


