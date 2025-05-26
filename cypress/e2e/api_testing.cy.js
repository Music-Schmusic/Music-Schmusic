const BACKEND_URL = 'http://127.0.0.1:8000';

describe('Backend API is listening', () => {
  context('Backend loads and runs successfully', () => {
    it('GIVEN the backend is running, WHEN I visit the root endpoint', () => {
      cy.request(`${BACKEND_URL}`).then((response) => {
        assert.isNotNull(response.body, 'THEN there are no fires to put out');
        assert.equal(response.body, 'API Running', 'AND returns API Running');
        assert.equal(response.status, 200, 'AND the status is 200');
      });
    });
  });
});

describe('API Sends account recovery email', () => {
  context('Successfully sends account recovery email', () => {
    it('GIVEN a user with valid username and email, WHEN I post to /accountrecovery', () => {
      const user = {
        username: 't3',
        email: 't3@gmail.com',
      };

      cy.request('POST', `${BACKEND_URL}/accountrecovery`, user).then(
        (response) => {
          assert.equal(
            response.status,
            200,
            'THEN I receive a status code of 200'
          );
          assert.equal(
            response.body,
            `Email sent to ${user.email}`,
            'AND an email is sent to the email associated with that account'
          );
        }
      );
    });
  });

  context('Failed to send recovery email - User does not exist', () => {
    it('GIVEN a user enters a username that is not in the database and an email, WHEN I post to /accountrecovery', () => {
      const user = {
        username: 'notauserinthedatabase',
        email: 'doesnotmatter@gmail.com',
      };
      cy.request({
        method: 'POST',
        url: `${BACKEND_URL}/accountrecovery`,
        body: user,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(
          response.status,
          404,
          'THEN I recieve a response code of 404'
        );
        assert.equal(
          response.body,
          `User ${user.username} does not exist`,
          "AND I recive a messsage saying the user doesn't exist"
        );
      });
    });
  });

  context('Failed to send recovery email - Email does not match', () => {
    it('GIVEN a user enters a username that is not in the database and an email, WHEN I post to /accountrecovery', () => {
      const user = {
        username: 't3',
        email: 'nottherightemail@gmail.com',
      };
      cy.request({
        method: 'POST',
        url: `${BACKEND_URL}/accountrecovery`,
        body: user,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(
          response.status,
          401,
          'THEN I recieve a response code of 401'
        );
        assert.equal(
          response.body,
          `Email does not match`,
          "AND I recive a messsage saying the email doesn't match"
        );
      });
    });
  });
});
