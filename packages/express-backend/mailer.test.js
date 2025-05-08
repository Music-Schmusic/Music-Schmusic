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

// mock email transporter
let mockSendMail;
const who = 'user@gmail.com';
const msg = 'Hello I would like to sell you stolen power tools';
const subject = 'Email subject';

afterEach(() => {
  jest.clearAllMocks();
});

test('Testing sendMail success', async () => {
  mockSendMail = jest.fn((mailDetails, callback) => {
    callback(null, { response: 'Email sent' });
  });

  nodemailer.default.createTransport.mockReturnValue({
    sendMail: mockSendMail
  });

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

test('Transporter returns error', async() => {
   const err = new Error("Email failed to send");
   const logSpy = jest.spyOn(global.console, 'log');

  mockSendMail = jest.fn().mockImplementation((mailDetails, callback) => {
    callback(err);
  });

  nodemailer.default.createTransport.mockReturnValue({
    sendMail: mockSendMail
  });

  await mailer.default.sendEmail(who, msg, subject);

  expect(logSpy).toHaveBeenCalledTimes(2);
  expect(logSpy).toHaveBeenCalledWith('Failed to send email: ', err);
   expect.any(Function);

   logSpy.mockRestore();
 });