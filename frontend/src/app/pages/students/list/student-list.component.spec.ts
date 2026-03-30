import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Student } from '../../../core/models/Student';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';

/**
 * Tests unitaires pour StudentListComponent.
 * StudentService est mocké avec jest.fn() pour ne pas faire d'appels HTTP.
 */
describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceMock: jest.Mocked<StudentService>;
  let routerMock: jest.Mocked<Router>;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@test.com' },
    { id: 2, firstName: 'Bob',   lastName: 'Dupont', email: 'bob@test.com'   }
  ];

  beforeEach(async () => {
    // On crée un mock du service avec les méthodes dont le composant a besoin
    studentServiceMock = {
      findAll: jest.fn().mockReturnValue(of(mockStudents)),
      delete:  jest.fn().mockReturnValue(of(void 0))
    } as unknown as jest.Mocked<StudentService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [StudentListComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router,         useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
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
   * Au chargement (ngOnInit), findAll() doit être appelé
   * et la liste students doit être remplie.
   */
  it('should load students on init', () => {
    expect(studentServiceMock.findAll).toHaveBeenCalled();
    expect(component.students.length).toBe(2);
    expect(component.students[0].firstName).toBe('Alice');
  });

  /**
   * goToDetail() doit naviguer vers /students/:id.
   */
  it('should navigate to detail on goToDetail()', () => {
    component.goToDetail(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/students', 1]);
  });

  /**
   * goToCreate() doit naviguer vers /students/create.
   */
  it('should navigate to create on goToCreate()', () => {
    component.goToCreate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/students/create']);
  });
});
