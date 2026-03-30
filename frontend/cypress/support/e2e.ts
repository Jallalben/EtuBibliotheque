// Fichier de support Cypress — chargé avant chaque test E2E
// Vous pouvez y ajouter des commandes personnalisées globales

// Nettoyage du localStorage avant chaque test
beforeEach(() => {
  cy.clearLocalStorage();
});
