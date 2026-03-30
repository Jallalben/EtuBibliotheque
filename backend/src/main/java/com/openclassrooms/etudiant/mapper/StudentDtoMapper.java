package com.openclassrooms.etudiant.mapper;

import com.openclassrooms.etudiant.dto.CreateStudentDTO;
import com.openclassrooms.etudiant.dto.StudentDTO;
import com.openclassrooms.etudiant.entities.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface StudentDtoMapper {

    StudentDTO toDTO(Student student);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "created_at", ignore = true)
    @Mapping(target = "updated_at", ignore = true)
    Student toEntity(CreateStudentDTO createStudentDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "created_at", ignore = true)
    @Mapping(target = "updated_at", ignore = true)
    void updateEntity(CreateStudentDTO createStudentDTO, @MappingTarget Student student);
}
