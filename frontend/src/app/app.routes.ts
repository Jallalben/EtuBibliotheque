import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { StudentListComponent } from './pages/students/list/student-list.component';
import { StudentDetailComponent } from './pages/students/detail/student-detail.component';
import { StudentCreateComponent } from './pages/students/create/student-create.component';
import { StudentEditComponent } from './pages/students/edit/student-edit.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'students', component: StudentListComponent, canActivate: [authGuard] },
  { path: 'students/create', component: StudentCreateComponent, canActivate: [authGuard] },
  { path: 'students/:id', component: StudentDetailComponent, canActivate: [authGuard] },
  { path: 'students/:id/edit', component: StudentEditComponent, canActivate: [authGuard] }
];
