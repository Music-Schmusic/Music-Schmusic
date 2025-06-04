describe('Login User', () => {
  context('Successful Login', () => {
    beforeEach(() => {});
    it('GIVEN I navigate to the Login Page', () => {});

    it('WHEN I enter a valid username that is in the database and the password associated with it', () => {
      //Note t3 is a legacy account and password wont meet requirements when creating new accounts as of 6/3/2025
      //Doesn't affect the validity of the test 
      const password = Cypress.env('password');
      cy.visit('http://localhost:5173/login');
      cy.intercept('POST', 'http://127.0.0.1:8000/login').as('login');
      cy.get('form').within(() => {
        cy.get('input[name="Username"]').type('t3');
        cy.get('input[name="Password"]').type(password, { log: false });
        cy.contains('Login').click();
      });
      cy.wait('@login');
      cy.log(
        'THEN I am navigated to the dashboard and am prompted to authorize with spotify'
      );
      cy.url().should('include', 'dashboard');
      cy.contains('Connect Spotify');
    });
  });

  context('Unsuccessful Login - incorrect password', () => {
    it('GIVEN I navigate to the Login Page', () => {});

    it('WHEN I enter a valid username that is in the database and a password not associated with it', () => {
      cy.visit('http://localhost:5173/login');
      cy.intercept('POST', 'http://127.0.0.1:8000/login').as('login');
      cy.get('form').within(() => {
        cy.get('input[name="Username"]').type('t3');
        cy.get('input[name="Password"]').type('notthepassword');
        cy.contains('Login').click();
      });
      cy.wait('@login');
      cy.log(
        'THEN I am shown an error telling me that my password was invalid'
      );
      cy.contains('Invalid Login Information').should('be.visible');
    });
  });

  context('Unsuccessful Login - user does not exist', () => {
    it('GIVEN I navigate to the Login Page', () => {});

    it('WHEN I enter a valid username that is in the database and a password not associated with it', () => {
      cy.visit('http://localhost:5173/login');
      cy.intercept('POST', 'http://127.0.0.1:8000/login').as('login');
      cy.get('form').within(() => {
        cy.get('input[name="Username"]').type('definitelynotauser');
        cy.get('input[name="Password"]').type('anypassword');
        cy.contains('Login').click();
      });
      cy.wait('@login');
      cy.log(
        'THEN I am shown an error telling me that my password was invalid'
      );
      cy.contains('Invalid Login Information').should('be.visible');
    });
  });
});
