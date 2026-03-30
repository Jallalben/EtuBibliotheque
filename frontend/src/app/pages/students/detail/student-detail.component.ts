import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  student: Student | null = null;
  errorMessage: string = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentService.findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => this.student = student,
        error: () => this.errorMessage = 'Étudiant introuvable'
      });
  }

  goToEdit() {
    this.router.navigate(['/students', this.student?.id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/students']);
  }
}
