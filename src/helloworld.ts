import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export async function entrypoint(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    body: `Hello, ${event.pathParameters?.name || "world"}`,
  };
}
