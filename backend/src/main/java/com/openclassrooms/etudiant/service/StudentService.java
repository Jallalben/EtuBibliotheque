package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> findAll() {
        log.info("Fetching all students");
        return studentRepository.findAll();
    }

    public Optional<Student> findById(Long id) {
        log.info("Fetching student with id {}", id);
        return studentRepository.findById(id);
    }

    public Student create(Student student) {
        Assert.notNull(student, "Student must not be null");
        log.info("Creating new student");
        return studentRepository.save(student);
    }

    public Student update(Long id, Student student) {
        Assert.notNull(student, "Student must not be null");
        log.info("Updating student with id {}", id);
        student.setId(id);
        return studentRepository.save(student);
    }

    public void delete(Long id) {
        log.info("Deleting student with id {}", id);
        studentRepository.deleteById(id);
    }
}
