/**
 * Tests E2E — Page de connexion (/login)
 * API mockée avec cy.intercept().
 */
describe('Login page', () => {

  beforeEach(() => {
    cy.visit('/login');
  });

  /**
   * La page doit afficher le formulaire de connexion.
   */
  it('should display the login form', () => {
    cy.get('input[formControlName="login"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
    // Le bouton submit n'a pas type="submit" explicite — on cible par texte
    cy.get('button').contains('Login').should('exist');
  });

  /**
   * Connexion réussie : stocke le token et redirige hors de /login.
   */
  it('should store token and redirect on successful login', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: 'fake-jwt-token'
    }).as('login');

    cy.get('input[formControlName="login"]').type('alice.martin');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button').contains('Login').click();

    cy.wait('@login');
    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token');
    });
    cy.url().should('not.include', '/login');
  });

  /**
   * Identifiants incorrects (401) → message d'erreur visible.
   */
  it('should display error message on invalid credentials', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: 'Identifiants invalides'
    }).as('loginFail');

    cy.get('input[formControlName="login"]').type('mauvais');
    cy.get('input[formControlName="password"]').type('mauvais');
    cy.get('button').contains('Login').click();

    cy.wait('@loginFail');
    cy.get('.alert-danger').should('be.visible');
  });

  /**
   * Champs vides → erreurs de validation visibles.
   */
  it('should show validation errors when fields are empty', () => {
    cy.get('button').contains('Login').click();
    cy.get('.invalid-feedback').should('have.length.greaterThan', 0);
  });
});
