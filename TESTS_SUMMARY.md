# Récapitulatif des tests — EduBibliothèque

---

## 1. Commandes pour lancer les tests

### Back-end (JUnit / Mockito)
```bash
cd backend
mvn test
```
Génère un rapport HTML dans : `backend/target/site/jacoco/index.html`

Pour générer le rapport de couverture explicitement :
```bash
mvn test jacoco:report
```

### Front-end (Jest)
```bash
cd frontend
npm test
```
Génère un rapport HTML dans : `frontend/coverage/index.html`

### Front-end E2E (Cypress — mode headless)
> Le front Angular doit tourner sur localhost:4200 avant de lancer Cypress.
```bash
# Terminal 1 — démarrer l'application
cd frontend && npm start

# Terminal 2 — lancer les tests E2E en mode headless
cd frontend && npx cypress run

# Ou ouvrir l'interface Cypress
cd frontend && npx cypress open
```

---

## 2. Fichiers créés ou modifiés

### Back-end

| Fichier | Type | Pourquoi |
|---------|------|----------|
| `backend/src/test/java/.../service/StudentServiceTest.java` | NOUVEAU | Tests unitaires de StudentService avec Mockito |
| `backend/src/test/java/.../controller/StudentControllerTest.java` | NOUVEAU | Tests d'intégration de StudentController avec MockMvc + Testcontainers |

### Front-end (Jest)

| Fichier | Type | Pourquoi |
|---------|------|----------|
| `frontend/src/app/core/service/student.service.spec.ts` | NOUVEAU | Teste les 5 méthodes HTTP du StudentService |
| `frontend/src/app/core/guards/auth.guard.spec.ts` | NOUVEAU | Teste la redirection si pas de token |
| `frontend/src/app/core/interceptors/auth.interceptor.spec.ts` | NOUVEAU | Teste l'injection du header Authorization |
| `frontend/src/app/pages/students/list/student-list.component.spec.ts` | NOUVEAU | Teste le chargement de la liste et la navigation |
| `frontend/src/app/pages/students/create/student-create.component.spec.ts` | NOUVEAU | Teste la validation et la soumission du formulaire de création |

### Front-end (Cypress)

| Fichier | Type | Pourquoi |
|---------|------|----------|
| `frontend/cypress.config.ts` | NOUVEAU | Configuration Cypress (baseUrl, specPattern) |
| `frontend/cypress/support/e2e.ts` | NOUVEAU | Support global (nettoyage localStorage) |
| `frontend/cypress/e2e/register.cy.ts` | NOUVEAU | Tests E2E de la page d'inscription |
| `frontend/cypress/e2e/login.cy.ts` | NOUVEAU | Tests E2E de la page de connexion |
| `frontend/cypress/e2e/students.cy.ts` | NOUVEAU | Tests E2E des pages étudiants (liste, création, suppression) |

---

## 3. Plan des tests (pyramide)

```
         [E2E Cypress]          ← peu nombreux, lents, testent le flux complet
        register / login / students (10 tests)

      [Intégration Jest]
    guard / interceptor (4 tests)

   [Unitaires Jest]             ← rapides, isolés
 student.service / list / create (14 tests)

[Unitaires JUnit/Mockito]       ← le plus bas niveau, ultra rapides
StudentServiceTest (8 tests)

[Intégration JUnit + MockMvc]
StudentControllerTest (9 tests)
```

---

## 4. Détail des cas de tests

### `StudentServiceTest.java` — 8 tests unitaires

| Test | Entrée | Résultat attendu |
|------|--------|-----------------|
| `test_findAll_returns_list` | repository retourne 2 étudiants | liste de 2 |
| `test_findAll_returns_empty_list` | repository retourne [] | liste vide |
| `test_findById_returns_student` | id=1, étudiant présent | Optional contenant l'étudiant |
| `test_findById_returns_empty_when_not_found` | id=99, absent | Optional vide |
| `test_create_null_student_throws_IllegalArgumentException` | null | exception IllegalArgument |
| `test_create_student_calls_save` | étudiant valide | save() appelé avec les bons champs |
| `test_create_student_returns_saved_student` | étudiant valide | retourne l'étudiant avec id |
| `test_update_null_student_throws_IllegalArgumentException` | null | exception IllegalArgument |
| `test_update_sets_id_and_calls_save` | id=42, étudiant sans id | save() appelé avec id=42 |
| `test_delete_calls_deleteById` | id=1 | deleteById(1) appelé |

### `StudentControllerTest.java` — 9 tests d'intégration

| Test | Requête HTTP | Code attendu |
|------|-------------|-------------|
| `findAll_returns_empty_list` | GET /api/students | 200 + [] |
| `findAll_returns_students` | GET /api/students | 200 + liste |
| `findAll_without_token_returns_401` | GET /api/students sans token | 401 |
| `findById_returns_student` | GET /api/students/1 | 200 + étudiant |
| `findById_returns_404_when_not_found` | GET /api/students/9999 | 404 |
| `create_student_returns_201` | POST /api/students + corps valide | 201 + étudiant |
| `create_student_with_empty_body_returns_400` | POST /api/students + corps vide | 400 |
| `update_student_returns_200` | PUT /api/students/1 | 200 + données mises à jour |
| `update_student_returns_404_when_not_found` | PUT /api/students/9999 | 404 |
| `delete_student_returns_204` | DELETE /api/students/1 | 204 |
| `delete_student_returns_404_when_not_found` | DELETE /api/students/9999 | 404 |

### Tests Jest — résumé

| Fichier | Nombre de tests |
|---------|----------------|
| `student.service.spec.ts` | 6 |
| `auth.guard.spec.ts` | 2 |
| `auth.interceptor.spec.ts` | 2 |
| `student-list.component.spec.ts` | 4 |
| `student-create.component.spec.ts` | 5 |

### Tests Cypress E2E — résumé

| Fichier | Nombre de tests |
|---------|----------------|
| `register.cy.ts` | 3 |
| `login.cy.ts` | 4 |
| `students.cy.ts` | 5 |

---

## 5. Résultats attendus

### Back-end
```
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```
Couverture de code : ≥ 80 %

### Front-end Jest
```
Test Suites: 7 passed, 7 total
Tests:       19 passed, 19 total
Coverage:    ≥ 80 %
```

### Cypress
```
  10 passing
  0 failing
```

---

## 6. Notions clés à retenir

| Outil | Niveau | Rôle |
|-------|--------|------|
| **JUnit 5** | Unitaire / Intégration | Framework de tests Java, annotations @Test, @BeforeEach |
| **Mockito** | Unitaire | Simule les dépendances (@Mock, @InjectMocks, when/verify) |
| **MockMvc** | Intégration | Simule des requêtes HTTP sans serveur réseau |
| **Testcontainers** | Intégration | Lance un vrai MySQL dans Docker pour les tests |
| **Jest** | Unitaire | Framework de tests TypeScript/Angular |
| **HttpTestingController** | Unitaire | Intercepte les appels HTTP dans les tests Angular |
| **Cypress** | E2E | Simule un utilisateur réel dans le navigateur |
| **cy.intercept()** | E2E | Mocke les appels API dans Cypress |
