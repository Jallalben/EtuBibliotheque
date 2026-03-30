package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires pour StudentService.
 * Mockito remplace StudentRepository : pas de base de données réelle.
 * Chaque test vérifie un comportement précis du service.
 */
@ExtendWith(SpringExtension.class)
public class StudentServiceTest {

    private static final String FIRST_NAME = "Alice";
    private static final String LAST_NAME  = "Martin";
    private static final String EMAIL      = "alice.martin@email.com";

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    // ─── findAll ──────────────────────────────────────────────────────────────

    /**
     * findAll() doit retourner la liste fournie par le repository.
     */
    @Test
    public void test_findAll_returns_list() {
        // GIVEN : le repository retourne une liste de 2 étudiants
        Student s1 = buildStudent(1L);
        Student s2 = buildStudent(2L);
        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));

        // WHEN
        List<Student> result = studentService.findAll();

        // THEN : on obtient bien 2 étudiants
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(s1, s2);
    }

    /**
     * findAll() doit retourner une liste vide quand la BDD est vide.
     */
    @Test
    public void test_findAll_returns_empty_list() {
        // GIVEN
        when(studentRepository.findAll()).thenReturn(List.of());

        // WHEN
        List<Student> result = studentService.findAll();

        // THEN
        assertThat(result).isEmpty();
    }

    // ─── findById ─────────────────────────────────────────────────────────────

    /**
     * findById() doit retourner un Optional contenant l'étudiant trouvé.
     */
    @Test
    public void test_findById_returns_student() {
        // GIVEN
        Student student = buildStudent(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // WHEN
        Optional<Student> result = studentService.findById(1L);

        // THEN
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
    }

    /**
     * findById() doit retourner un Optional vide si l'étudiant n'existe pas.
     */
    @Test
    public void test_findById_returns_empty_when_not_found() {
        // GIVEN
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN
        Optional<Student> result = studentService.findById(99L);

        // THEN
        assertThat(result).isEmpty();
    }

    // ─── create ───────────────────────────────────────────────────────────────

    /**
     * create() avec un étudiant null doit lever une IllegalArgumentException.
     */
    @Test
    public void test_create_null_student_throws_IllegalArgumentException() {
        // GIVEN / THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> studentService.create(null));
    }

    /**
     * create() doit appeler studentRepository.save() avec le bon étudiant.
     */
    @Test
    public void test_create_student_calls_save() {
        // GIVEN
        Student student = buildStudent(null);
        when(studentRepository.save(any())).thenReturn(student);

        // WHEN
        studentService.create(student);

        // THEN : on capture l'argument passé à save() et on vérifie ses champs
        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        assertThat(captor.getValue().getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(captor.getValue().getEmail()).isEqualTo(EMAIL);
    }

    /**
     * create() doit retourner l'étudiant renvoyé par le repository (avec id généré).
     */
    @Test
    public void test_create_student_returns_saved_student() {
        // GIVEN
        Student toCreate = buildStudent(null);
        Student saved    = buildStudent(1L);
        when(studentRepository.save(any())).thenReturn(saved);

        // WHEN
        Student result = studentService.create(toCreate);

        // THEN
        assertThat(result.getId()).isEqualTo(1L);
    }

    // ─── update ───────────────────────────────────────────────────────────────

    /**
     * update() avec un étudiant null doit lever une IllegalArgumentException.
     */
    @Test
    public void test_update_null_student_throws_IllegalArgumentException() {
        // GIVEN / THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> studentService.update(1L, null));
    }

    /**
     * update() doit forcer l'id sur l'entité avant de la sauvegarder.
     */
    @Test
    public void test_update_sets_id_and_calls_save() {
        // GIVEN : l'étudiant reçu n'a pas d'id (vient du DTO)
        Student student = buildStudent(null);
        when(studentRepository.save(any())).thenReturn(student);

        // WHEN
        studentService.update(42L, student);

        // THEN : l'id 42 a été forcé avant save()
        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(42L);
    }

    // ─── delete ───────────────────────────────────────────────────────────────

    /**
     * delete() doit appeler studentRepository.deleteById() avec le bon id.
     */
    @Test
    public void test_delete_calls_deleteById() {
        // WHEN
        studentService.delete(1L);

        // THEN
        verify(studentRepository).deleteById(1L);
    }

    // ─── utilitaire ───────────────────────────────────────────────────────────

    private Student buildStudent(Long id) {
        Student s = new Student();
        s.setId(id);
        s.setFirstName(FIRST_NAME);
        s.setLastName(LAST_NAME);
        s.setEmail(EMAIL);
        return s;
    }
}
