package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.CreateStudentDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.JwtService;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * Tests d'intégration pour StudentController.
 *
 * Stratégie :
 * - Spring Boot complet démarré (@SpringBootTest)
 * - MockMvc simule de vraies requêtes HTTP sans serveur réseau
 * - H2 en mémoire remplace MySQL : pas besoin de Docker
 * - Un token JWT valide est généré avant chaque test (@BeforeEach)
 * - La base de données est nettoyée après chaque test (@AfterEach)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class StudentControllerTest {

    private static final String URL        = "/api/students";
    private static final String FIRST_NAME = "Alice";
    private static final String LAST_NAME  = "Martin";
    private static final String EMAIL      = "alice.martin@test.com";
    private static final String USER_LOGIN = "testuser";
    private static final String USER_PASS  = "password";

    @Autowired private MockMvc          mockMvc;
    @Autowired private ObjectMapper     objectMapper;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository    userRepository;
    @Autowired private UserService       userService;
    @Autowired private JwtService        jwtService;

    /** Token JWT valide réutilisé dans chaque test */
    private String bearerToken;

    /**
     * Crée un utilisateur et génère un token JWT avant chaque test.
     */
    @BeforeEach
    public void setUp() {
        User user = new User();
        user.setFirstName("Test");
        user.setLastName("User");
        user.setLogin(USER_LOGIN);
        user.setPassword(USER_PASS);
        userService.register(user);

        User saved = userRepository.findByLogin(USER_LOGIN).orElseThrow();
        bearerToken = "Bearer " + jwtService.generateToken(saved);
    }

    /** Remet la base de données H2 à zéro après chaque test */
    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ─── GET /api/students ────────────────────────────────────────────────────

    /**
     * findAll() doit retourner 200 avec une liste vide quand aucun étudiant n'existe.
     */
    @Test
    public void findAll_returns_empty_list() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .header("Authorization", bearerToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(0));
    }

    /**
     * findAll() doit retourner 200 avec la liste des étudiants existants.
     */
    @Test
    public void findAll_returns_students() throws Exception {
        // GIVEN : un étudiant en base H2
        studentRepository.save(buildStudent(EMAIL));

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .header("Authorization", bearerToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].firstName").value(FIRST_NAME));
    }

    /**
     * findAll() sans token doit retourner 401 Unauthorized.
     */
    @Test
    public void findAll_without_token_returns_401() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    // ─── GET /api/students/{id} ───────────────────────────────────────────────

    /**
     * findById() doit retourner 200 avec l'étudiant correspondant à l'id.
     */
    @Test
    public void findById_returns_student() throws Exception {
        // GIVEN
        Student saved = studentRepository.save(buildStudent(EMAIL));

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/" + saved.getId())
                        .header("Authorization", bearerToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value(EMAIL));
    }

    /**
     * findById() doit retourner 404 si l'étudiant n'existe pas.
     */
    @Test
    public void findById_returns_404_when_not_found() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/9999")
                        .header("Authorization", bearerToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    // ─── POST /api/students ───────────────────────────────────────────────────

    /**
     * create() avec des données valides doit retourner 201 et l'étudiant créé.
     */
    @Test
    public void create_student_returns_201() throws Exception {
        // GIVEN
        CreateStudentDTO dto = buildDTO(EMAIL);

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .header("Authorization", bearerToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value(FIRST_NAME))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value(EMAIL));
    }

    /**
     * create() avec un corps vide doit retourner 400 (champs @NotBlank non respectés).
     */
    @Test
    public void create_student_with_empty_body_returns_400() throws Exception {
        // GIVEN : DTO vide (tous les champs null)
        CreateStudentDTO dto = new CreateStudentDTO();

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .header("Authorization", bearerToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    // ─── PUT /api/students/{id} ───────────────────────────────────────────────

    /**
     * update() doit retourner 200 et les données mises à jour.
     */
    @Test
    public void update_student_returns_200() throws Exception {
        // GIVEN : étudiant existant
        Student existing = studentRepository.save(buildStudent(EMAIL));

        CreateStudentDTO dto = new CreateStudentDTO();
        dto.setFirstName("Bob");
        dto.setLastName("Dupont");
        dto.setEmail("bob.dupont@test.com");

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/" + existing.getId())
                        .header("Authorization", bearerToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Bob"));
    }

    /**
     * update() doit retourner 404 si l'étudiant à modifier n'existe pas.
     */
    @Test
    public void update_student_returns_404_when_not_found() throws Exception {
        CreateStudentDTO dto = buildDTO("other@test.com");

        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/9999")
                        .header("Authorization", bearerToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    // ─── DELETE /api/students/{id} ────────────────────────────────────────────

    /**
     * delete() doit retourner 204 quand la suppression réussit.
     */
    @Test
    public void delete_student_returns_204() throws Exception {
        // GIVEN
        Student saved = studentRepository.save(buildStudent(EMAIL));

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/" + saved.getId())
                        .header("Authorization", bearerToken))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    /**
     * delete() doit retourner 404 si l'étudiant à supprimer n'existe pas.
     */
    @Test
    public void delete_student_returns_404_when_not_found() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/9999")
                        .header("Authorization", bearerToken))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    // ─── utilitaires ──────────────────────────────────────────────────────────

    private Student buildStudent(String email) {
        Student s = new Student();
        s.setFirstName(FIRST_NAME);
        s.setLastName(LAST_NAME);
        s.setEmail(email);
        return s;
    }

    private CreateStudentDTO buildDTO(String email) {
        CreateStudentDTO dto = new CreateStudentDTO();
        dto.setFirstName(FIRST_NAME);
        dto.setLastName(LAST_NAME);
        dto.setEmail(email);
        return dto;
    }
}
