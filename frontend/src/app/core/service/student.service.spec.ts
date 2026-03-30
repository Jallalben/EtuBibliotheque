import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StudentService } from './student.service';
import { Student, CreateStudent } from '../models/Student';

/**
 * Tests unitaires pour StudentService.
 * HttpTestingController intercepte les appels HTTP sans faire de vrai réseau.
 */
describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const mockStudent: Student = {
    id: 1,
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@test.com'
  };

  const mockStudents: Student[] = [mockStudent];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'aucune requête HTTP non attendue n'a été émise
    httpMock.verify();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * findAll() doit émettre une requête GET sur /api/students
   * et retourner la liste d'étudiants.
   */
  it('findAll() should call GET /api/students and return students', () => {
    service.findAll().subscribe(students => {
      expect(students.length).toBe(1);
      expect(students[0].firstName).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  // ─── findById ──────────────────────────────────────────────────────────────

  /**
   * findById() doit émettre une requête GET sur /api/students/1
   * et retourner l'étudiant correspondant.
   */
  it('findById() should call GET /api/students/:id and return student', () => {
    service.findById(1).subscribe(student => {
      expect(student.id).toBe(1);
      expect(student.email).toBe('alice@test.com');
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudent);
  });

  // ─── create ────────────────────────────────────────────────────────────────

  /**
   * create() doit émettre une requête POST sur /api/students
   * avec le corps de la requête et retourner l'étudiant créé.
   */
  it('create() should call POST /api/students with student data', () => {
    const newStudent: CreateStudent = {
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@test.com'
    };

    service.create(newStudent).subscribe(student => {
      expect(student.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush(mockStudent);
  });

  // ─── update ────────────────────────────────────────────────────────────────

  /**
   * update() doit émettre une requête PUT sur /api/students/1
   * avec les nouvelles données.
   */
  it('update() should call PUT /api/students/:id with updated data', () => {
    const updated: CreateStudent = {
      firstName: 'Bob',
      lastName: 'Dupont',
      email: 'bob@test.com'
    };

    service.update(1, updated).subscribe(student => {
      expect(student.firstName).toBe('Bob');
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush({ ...mockStudent, firstName: 'Bob' });
  });

  // ─── delete ────────────────────────────────────────────────────────────────

  /**
   * delete() doit émettre une requête DELETE sur /api/students/1.
   */
  it('delete() should call DELETE /api/students/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
