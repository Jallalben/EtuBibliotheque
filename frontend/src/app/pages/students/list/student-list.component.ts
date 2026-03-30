import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  errorMessage: string = '';

  ngOnInit() {
    this.studentService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => this.students = students,
        error: () => this.errorMessage = 'Erreur lors du chargement des étudiants'
      });
  }

  goToDetail(id: number) {
    this.router.navigate(['/students', id]);
  }

  goToCreate() {
    this.router.navigate(['/students/create']);
  }

  delete(id: number) {
    if (!confirm('Supprimer cet étudiant ?')) return;
    this.studentService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.students = this.students.filter(s => s.id !== id),
        error: () => this.errorMessage = 'Erreur lors de la suppression'
      });
  }
}
