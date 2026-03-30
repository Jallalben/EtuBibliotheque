import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudent } from '../models/Student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly apiUrl = '/api/students';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.apiUrl);
  }

  findById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: CreateStudent): Observable<Student> {
    return this.httpClient.post<Student>(this.apiUrl, student);
  }

  update(id: number, student: CreateStudent): Observable<Student> {
    return this.httpClient.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
