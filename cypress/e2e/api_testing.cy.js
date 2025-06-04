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
            response.body.message,
            `Email sent to ${user.email}`,
            'AND an email is sent to the email associated with that account'
          );
          Cypress.env('token', response.body.token);
          Cypress.env('csrf', response.body.id);
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
    it('GIVEN a user enters a username that is in the database and an email that is not\
       associated with the account, WHEN I post to /accountrecovery', () => {
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

describe('User clicks recovery email', () => {
  context('Successfully validated', () => {
    it('Given the user clicks the linl, WHEN the user is in the same browser session', () => {
      cy.visit(`${BACKEND_URL}`);
      const token = Cypress.env('token');
      const id = Cypress.env('csrf');
      cy.log(`Token: ${token}`);
      cy.log(`CRSFtoken: ${id}`);
      cy.setCookie('CRSFtoken', id).then(() => {
        cy.request({
          method: 'POST',
          url: `${BACKEND_URL}/resetvalidation`,
          body: { token },
          withCredentials: true,
        }).then((res) => {
          assert.equal(
            res.status,
            200,
            'THEN I recieve a response code of 200'
          );
          assert.equal(res.body.user, 't3');
        });
      });
    });
  });
  context('Not validated - different browser session', () => {
    it('Given the user clicks the link, WHEN the user is not in the same browser session', () => {
      const token = Cypress.env('token');
      const id = 'NOTTHERIGHTCOOKIE';
      cy.setCookie('CRSFtoken', id).then(() => {
        cy.request({
          method: 'POST',
          url: `${BACKEND_URL}/resetvalidation`,
          body: { token },
          withCredentials: true,
          failOnStatusCode: false,
        }).then((res) => {
          assert.equal(res.status, 401, 'THEN the response code is 401');
          assert.equal(res.body, 'Invalid Credentials');
        });
      });
    });
  });
  context('Not validated - expired token', () => {
    it('Given the user clicks the link, WHEN the user in the same browser session but after the token expires', () => {
      cy.visit(`${BACKEND_URL}`);
      const token = 'ANEWTOKEN';
      const Recoverytoken = {
        token: 'ANEWTOKEN',
        expiration: Date.now() - 10000,
        CRSFtoken: 'abc',
        user: 't3',
      };
      cy.request({
        method: 'POST',
        url: `${BACKEND_URL}/test-utils/add-token`,
        body: Recoverytoken,
        failOnStatusCode: false,
      });
      cy.setCookie('CRSFtoken', 'abc').then(() => {
        cy.request({
          method: 'POST',
          url: `${BACKEND_URL}/resetvalidation`,
          body: { token },
          withCredentials: true,
          failOnStatusCode: false,
        }).then((res) => {
          assert.equal(res.status, 401, 'THEN the response code is 401');
          assert.equal(res.body, 'Invalid Credentials');
        });
      });
      cy.request('POST', `http://127.0.0.1:8000/test-utils/delete-token`, {
        token: token,
      });
    });
  });
});
