import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Tests unitaires pour authGuard.
 * Vérifie que la garde redirige vers /login si pas de token,
 * et laisse passer si un token est présent.
 */
describe('authGuard', () => {
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Sans token dans localStorage : la garde doit retourner un UrlTree vers /login.
   */
  it('should redirect to /login when no token in localStorage', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    // Le résultat est un UrlTree (redirection), pas true
    expect(result).not.toBe(true);
    expect(result.toString()).toContain('login');
  });

  /**
   * Avec un token dans localStorage : la garde doit retourner true (accès autorisé).
   */
  it('should return true when token exists in localStorage', () => {
    localStorage.setItem('token', 'fake-jwt-token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });
});
