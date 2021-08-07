export const github = async event => {
  const payload = JSON.parse(event.body);
  console.log(payload);

  return {
    statusCode: 200,
  };
};
