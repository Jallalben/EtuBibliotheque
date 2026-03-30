package com.openclassrooms.etudiant.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
