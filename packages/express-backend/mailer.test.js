import { jest } from '@jest/globals';
import mailer from 'mailer.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

jest.mock('nodemailer');

beforeEach(() => {
    mockSendMail = jest.fn((mailDetails, callback) => 
    {
        callback(null, { response : 'Email sent'});
    }); 
    nodemailer.createTransport.mockReturnValue({
        sendmail: mockSendMail,
    });
});

afterEach(() => {
    jest.clearAllMocks(); 
});

test('Testing sendMail', async () => {
    const who = "user@gmail.com";
    const msg = "Hello I would like to sell you stolen power tools";
    const subject = "Email subject";

    await mailer.sendEmail(who, msg, subject);

    expect(mockSendMail).toHaveBeenCalledWith(
        {
            from: 'greinhard2003@gmail.com',
            to: who,
            subject: subject,
            text: message,
            
        });
    expect(mockSendMail).toHaveBeenCalledTimes(1);  
});