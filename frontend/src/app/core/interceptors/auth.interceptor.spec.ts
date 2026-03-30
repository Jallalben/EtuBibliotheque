import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

/**
 * Tests unitaires pour authInterceptor.
 * Vérifie que le header Authorization est ajouté si un token existe,
 * et absent sinon.
 */
describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock   = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /**
   * Avec un token : chaque requête doit avoir le header Authorization: Bearer <token>.
   */
  it('should add Authorization header when token exists', () => {
    localStorage.setItem('token', 'my-test-token');

    httpClient.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-test-token');
    req.flush([]);
  });

  /**
   * Sans token : la requête ne doit pas avoir de header Authorization.
   */
  it('should not add Authorization header when no token', () => {
    httpClient.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush([]);
  });
});
