import {
  sendDiscordEmbedMessage,
  __RewireAPI__ as rewireAPI,
} from '../../services/discord';

const spy = {
  discordHttp: {
    post: jest.fn(() => { }),
  },
};

describe('send discord embed message', () => {
  beforeEach(() => rewireAPI.__set__('discordHttp', spy.discordHttp));
  test('discordHttp.post should have been called', async () => {
    await sendDiscordEmbedMessage({});
    expect(spy.discordHttp.post).not.toHaveBeenCalled();
  });
});
