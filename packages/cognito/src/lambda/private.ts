import type { APIGatewayProxyWithCognitoAuthorizerHandler } from "aws-lambda";


const AllowedOrigins = [
    process.env.FRONT_END_URL as string|| "http://localhost:5173"
];
export const handler : APIGatewayProxyWithCognitoAuthorizerHandler = async (event)=>{
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello from Cognito Authorizer" }),
        headers:{
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": AllowedOrigins[0],
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        }
    }
}
