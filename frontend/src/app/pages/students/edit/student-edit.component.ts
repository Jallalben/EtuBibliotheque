import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { CreateStudent } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-edit.component.html'
})
export class StudentEditComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  errorMessage: string = '';
  studentId!: number;

  ngOnInit() {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required]
    });

    this.studentService.findById(this.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => this.studentForm.patchValue(student),
        error: () => this.errorMessage = 'Étudiant introuvable'
      });
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    if (this.studentForm.invalid) return;

    const student: CreateStudent = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value
    };

    this.studentService.update(this.studentId, student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/students']),
        error: () => this.errorMessage = 'Erreur lors de la modification'
      });
  }

  goBack() {
    this.router.navigate(['/students']);
  }
}
