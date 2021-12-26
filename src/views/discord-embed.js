export const gitlabEmbed = ({ color, user, content }) => ({
  color,
  author: {
    name: user.name,
    icon_url: user.avatar,
    url: `https://gitlab.com/${user.username}`
  },
  description: content,
  timestamp: new Date(),
  footer: {
    text: 'GitLab'
  }
})
