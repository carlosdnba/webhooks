export const healthCheck = event => ({
  statusCode: 200,
  body: JSON.stringify({
    health: true,
  }),
});
