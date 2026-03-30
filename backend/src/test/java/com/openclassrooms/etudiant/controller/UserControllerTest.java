package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.RegisterDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
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
 * Tests d'intégration pour UserController.
 * H2 en mémoire remplace MySQL : pas besoin de Docker.
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
public class UserControllerTest {

    private static final String URL = "/api/register";
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String LOGIN = "login";
    private static final String PASSWORD = "password";

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    @AfterEach
    public void afterEach() {
        userRepository.deleteAll();
    }

    @Test
    public void registerUserWithoutRequiredData() throws Exception {
        // GIVEN
        RegisterDTO registerDTO = new RegisterDTO();

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void registerAlreadyExistUser() throws Exception {
        // GIVEN
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);

        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setFirstName(FIRST_NAME);
        registerDTO.setLastName(LAST_NAME);
        registerDTO.setLogin(LOGIN);
        registerDTO.setPassword(PASSWORD);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void registerUserSuccessful() throws Exception {
        // GIVEN
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setFirstName(FIRST_NAME);
        registerDTO.setLastName(LAST_NAME);
        registerDTO.setLogin(LOGIN);
        registerDTO.setPassword(PASSWORD);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated());
    }
}
