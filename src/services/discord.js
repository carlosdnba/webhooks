import axios from 'axios';

export const discordHttp = axios.create({
  baseURL: 'https://discord.com/api',
});

export const sendDiscordEmbedMessage = ({ embeds }) => discordHttp.post(
  `webhooks/${process.env.DISCORD_WEBHOOK}`,
  { embeds },
);
