/**
 * Tests E2E — Pages étudiants (/students, /students/create)
 *
 * Le token est injecté via onBeforeLoad dans cy.visit()
 * pour contourner le authGuard avant le chargement de la page.
 */
describe('Students pages', () => {

  const mockStudents = [
    { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@test.com' },
    { id: 2, firstName: 'Bob',   lastName: 'Dupont', email: 'bob@test.com'   }
  ];

  const mockStudent = mockStudents[0];

  /** Injecte le token JWT dans le localStorage du navigateur avant le chargement */
  const visitWithAuth = (path: string) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'fake-jwt-token');
      }
    });
  };

  // ─── Liste des étudiants ─────────────────────────────────────────────────

  /**
   * La page /students doit afficher la liste retournée par l'API.
   */
  it('should display the list of students', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: mockStudents
    }).as('getStudents');

    visitWithAuth('/students');
    cy.wait('@getStudents');

    cy.contains('Alice').should('be.visible');
    cy.contains('Bob').should('be.visible');
  });

  /**
   * Cliquer sur "Détail" doit naviguer vers /students/:id.
   */
  it('should navigate to student detail on click', () => {
    cy.intercept('GET', '/api/students', { statusCode: 200, body: mockStudents }).as('getStudents');
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: mockStudent }).as('getStudent');

    visitWithAuth('/students');
    cy.wait('@getStudents');

    cy.contains('Détail').first().click();
    cy.url().should('include', '/students/1');
  });

  // ─── Création d'un étudiant ──────────────────────────────────────────────

  /**
   * La page /students/create doit afficher le formulaire.
   */
  it('should display the create form', () => {
    visitWithAuth('/students/create');
    cy.get('input[formControlName="firstName"]').should('exist');
    cy.get('input[formControlName="lastName"]').should('exist');
    cy.get('input[formControlName="email"]').should('exist');
  });

  /**
   * Créer un étudiant valide → redirige vers /students.
   */
  it('should create a student and redirect to /students', () => {
    cy.intercept('POST', '/api/students', {
      statusCode: 201,
      body: { id: 3, firstName: 'Charlie', lastName: 'Durand', email: 'charlie@test.com' }
    }).as('createStudent');

    visitWithAuth('/students/create');
    cy.get('input[formControlName="firstName"]').type('Charlie');
    cy.get('input[formControlName="lastName"]').type('Durand');
    cy.get('input[formControlName="email"]').type('charlie@test.com');
    cy.get('button').contains('Créer').click();

    cy.wait('@createStudent');
    cy.url().should('include', '/students');
    cy.url().should('not.include', 'create');
  });

  /**
   * Formulaire de création vide → erreurs de validation.
   */
  it('should show validation errors on empty create form submit', () => {
    visitWithAuth('/students/create');
    cy.get('button').contains('Créer').click();
    cy.get('.invalid-feedback').should('have.length.greaterThan', 0);
  });

  // ─── Suppression ─────────────────────────────────────────────────────────

  /**
   * Supprimer un étudiant le retire de la liste.
   */
  it('should remove student from list after deletion', () => {
    cy.intercept('GET', '/api/students', { statusCode: 200, body: mockStudents }).as('getStudents');
    cy.intercept('DELETE', '/api/students/1', { statusCode: 204, body: null }).as('deleteStudent');

    visitWithAuth('/students');
    cy.wait('@getStudents');

    cy.on('window:confirm', () => true);
    cy.contains('Supprimer').first().click();

    cy.wait('@deleteStudent');
    cy.contains('Alice').should('not.exist');
  });
});
