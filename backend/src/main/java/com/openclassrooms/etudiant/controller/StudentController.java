package com.openclassrooms.etudiant.controller;

import com.openclassrooms.etudiant.dto.CreateStudentDTO;
import com.openclassrooms.etudiant.dto.StudentDTO;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentDtoMapper studentDtoMapper;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> findAll() {
        List<StudentDTO> students = studentService.findAll()
                .stream()
                .map(studentDtoMapper::toDTO)
                .toList();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> findById(@PathVariable Long id) {
        return studentService.findById(id)
                .map(studentDtoMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StudentDTO> create(@Valid @RequestBody CreateStudentDTO createStudentDTO) {
        StudentDTO created = studentDtoMapper.toDTO(
                studentService.create(studentDtoMapper.toEntity(createStudentDTO))
        );
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> update(@PathVariable Long id,
                                             @Valid @RequestBody CreateStudentDTO createStudentDTO) {
        return studentService.findById(id)
                .map(existing -> {
                    studentDtoMapper.updateEntity(createStudentDTO, existing);
                    return ResponseEntity.ok(studentDtoMapper.toDTO(studentService.update(id, existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (studentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
