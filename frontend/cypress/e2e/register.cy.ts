/**
 * Tests E2E — Page d'inscription (/register)
 * API mockée avec cy.intercept().
 */
describe('Register page', () => {

  beforeEach(() => {
    cy.visit('/register');
  });

  /**
   * La page doit afficher le formulaire d'inscription.
   */
  it('should display the register form', () => {
    cy.get('input[formControlName="firstName"]').should('exist');
    cy.get('input[formControlName="lastName"]').should('exist');
    cy.get('input[formControlName="login"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
    // Le bouton n'a pas type="submit" — on cible par texte
    cy.get('button').contains('Register').should('exist');
  });

  /**
   * Inscription réussie → redirige vers /login.
   */
  it('should redirect to /login after successful registration', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 201,
      body: {}
    }).as('register');

    cy.get('input[formControlName="firstName"]').type('Alice');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="login"]').type('alice.martin');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button').contains('Register').click();

    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  /**
   * Champs vides → erreurs de validation visibles.
   */
  it('should show validation errors when required fields are empty', () => {
    cy.get('button').contains('Register').click();
    cy.get('.invalid-feedback').should('have.length.greaterThan', 0);
  });
});
