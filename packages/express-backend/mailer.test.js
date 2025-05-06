import { jest } from '@jest/globals';

jest.unstable_mockModule('nodemailer', () => {
  return {
    __esModule: true,
    default: {
      createTransport: jest.fn(),
    },
  };
});

const nodemailer = await import('nodemailer');
const mailer = await import('./mailer.js');

let mockSendMail;

beforeEach(() => {
  mockSendMail = jest.fn((mailDetails, callback) => {
    callback(null, { response: 'Email sent' });
  });

  nodemailer.default.createTransport.mockReturnValue({
    sendMail: mockSendMail
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('Testing sendMail', async () => {
  const who = 'user@gmail.com';
  const msg = 'Hello I would like to sell you stolen power tools';
  const subject = 'Email subject';

  await mailer.default.sendEmail(who, msg, subject);

  expect(mockSendMail).toHaveBeenCalledWith(
    {
      from: 'musicschmusic308.309@gmail.com',
      to: who,
      subject: subject,
      text: msg,
    },
    expect.any(Function)
  );

  expect(mockSendMail).toHaveBeenCalledTimes(1);
});
