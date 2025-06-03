describe('Signup User', () => {
  context('Successful Signup', () => {
    beforeEach(() => {});
    it('GIVEN I navigate to the Signup Page', () => {});

    it('WHEN I enter a unique username that is not in the database, a valid email, and the same password twice', () => {
      cy.visit('http://localhost:5173/signup');
      cy.intercept('GET', '**/authorize/authorize').as('authorize');
      cy.intercept('POST', 'http://127.0.0.1:8000/signup').as('signup');
      cy.get('form').within(() => {
        cy.get('input[name="username"]').type('CypressTestingUser');
        cy.get('input[name="email"]').type('CypressTest@gmail.com');
        cy.get('input[name="password"]').type('CypressPassword');
        cy.get('input[name="confirmPassword"]').type('CypressPassword');
        cy.get('button[type="submit"]').click();
      });
      cy.wait('@signup');
      cy.wait('@authorize').then((interception) => {
        assert.equal(interception.response.statusCode, 200);
        const authUrl = interception.response.body.authUrl;
        expect(authUrl).to.include('accounts.spotify.com');
      });
      cy.log('THEN I am navigated to the spotify login page.');
    });
  });

  context('Unsuccessful signup - Passwords do not match', () => {
    it('GIVEN I navigate to the signup Page', () => {});

    it('WHEN I enter a unique username that is not in the database, a valid email, and two different passwords', () => {
      cy.visit('http://localhost:5173/signup');
      cy.intercept('POST', 'http://127.0.0.1:8000/signup').as('signup');
      cy.get('form').within(() => {
        cy.get('input[name="username"]').type('CypressTestingUser');
        cy.get('input[name="email"]').type('CypressTest@gmail.com');
        cy.get('input[name="password"]').type('CypressPassword');
        cy.get('input[name="confirmPassword"]').type('CypressPassword2');
        cy.get('button[type="submit"]').click();
      });
      cy.log(
        'THEN I am shown an error telling me that my passwords did not match'
      );
      cy.contains('Passwords do not match').should('be.visible');
    });
  });

  context('Unsuccessful signup - user already exists', () => {
    it('GIVEN I navigate to the signup Page', () => {});

    it('WHEN I enter a username that is in the database, a valid email, and the same password twice', () => {
      cy.visit('http://localhost:5173/signup');
      cy.intercept('POST', 'http://127.0.0.1:8000/signup').as('signup');
      cy.get('form').within(() => {
        cy.get('input[name="username"]').type('CypressTestingUser');
        cy.get('input[name="email"]').type('CypressTest@gmail.com');
        cy.get('input[name="password"]').type('CypressPassword2');
        cy.get('input[name="confirmPassword"]').type('CypressPassword2');
        cy.get('button[type="submit"]').click();
      });
      cy.log(
        'THEN I am shown an error telling me that the user already exists'
      );
      cy.contains('Username already in use').should('be.visible');
      cy.request('POST', `http://127.0.0.1:8000/test-utils/delete-user`, {
        username: 'CypressTestingUser',
      });
    });
  });
});
