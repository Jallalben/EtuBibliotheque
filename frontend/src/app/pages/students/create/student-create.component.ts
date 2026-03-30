import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { CreateStudent } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-create.component.html'
})
export class StudentCreateComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required]
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

    this.studentService.create(student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/students']),
        error: () => this.errorMessage = 'Erreur lors de la création'
      });
  }

  onReset() {
    this.submitted = false;
    this.studentForm.reset();
  }
}
