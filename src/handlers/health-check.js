export const healthCheck = (event, context, callback) => callback(null, {
  statusCode: 200,
  body: JSON.stringify({
    healthy: true,
  }),
});
