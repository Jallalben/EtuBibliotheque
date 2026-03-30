import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentCreateComponent } from './student-create.component';
import { StudentService } from '../../../core/service/student.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Student } from '../../../core/models/Student';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';

/**
 * Tests unitaires pour StudentCreateComponent.
 * Vérifie le comportement du formulaire et la navigation après création.
 */
describe('StudentCreateComponent', () => {
  let component: StudentCreateComponent;
  let fixture: ComponentFixture<StudentCreateComponent>;
  let studentServiceMock: jest.Mocked<StudentService>;
  let routerMock: jest.Mocked<Router>;

  const createdStudent: Student = {
    id: 1,
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@test.com'
  };

  beforeEach(async () => {
    studentServiceMock = {
      create: jest.fn().mockReturnValue(of(createdStudent))
    } as unknown as jest.Mocked<StudentService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [StudentCreateComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router,         useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Le composant doit être créé sans erreur.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Le formulaire doit être invalide si tous les champs sont vides.
   */
  it('should have invalid form when fields are empty', () => {
    expect(component.studentForm.invalid).toBe(true);
  });

  /**
   * Le formulaire doit être valide quand tous les champs sont remplis.
   */
  it('should have valid form when all fields are filled', () => {
    component.studentForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@test.com'
    });
    expect(component.studentForm.valid).toBe(true);
  });

  /**
   * onSubmit() avec un formulaire valide doit appeler create()
   * et naviguer vers /students.
   */
  it('should call create() and navigate to /students on valid submit', () => {
    component.studentForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@test.com'
    });

    component.onSubmit();

    expect(studentServiceMock.create).toHaveBeenCalledWith({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@test.com'
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/students']);
  });

  /**
   * onSubmit() avec formulaire invalide ne doit PAS appeler create().
   */
  it('should not call create() when form is invalid', () => {
    component.onSubmit();
    expect(studentServiceMock.create).not.toHaveBeenCalled();
  });

  /**
   * onReset() doit remettre submitted à false et réinitialiser le formulaire.
   */
  it('should reset form and submitted flag on onReset()', () => {
    component.submitted = true;
    component.studentForm.setValue({ firstName: 'X', lastName: 'Y', email: 'x@y.com' });
    component.onReset();
    expect(component.submitted).toBe(false);
    expect(component.studentForm.value).toEqual({ firstName: null, lastName: null, email: null });
  });
});
