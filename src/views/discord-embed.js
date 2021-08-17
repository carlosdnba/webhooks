export const gitlabEmbed = ({ color, user, content }) => ({
  color,
  author: {
    name: user.user_name,
    icon_url: user.user_avatar,
    url: `https://gitlab.com/${user.user_username}`,
  },
  description: content,
  timestamp: new Date(),
  footer: {
    text: 'GitLab',
  },
});
