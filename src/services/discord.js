import axios from 'axios';

export const discordHttp = axios.create({
  baseURL: 'https://discord.com/api',
});

export const sendDiscordEmbedMessage = async ({ embeds }) => {
  await discordHttp.post(
    `webhooks/${process.env.DISCORD_WEBHOOK}`,
    { embeds },
  ).catch(err => console.error(err));
};
