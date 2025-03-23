import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt'; // Para verificar la expiración del token
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: { id: number; name: string } | null = null; // Almacena la información del usuario
  private token: any | null = null;
  private jwtHelper = new JwtHelperService(); // Servicio para manejar tokens JWT
  private API_URL = 'https://api-dpdi.vercel.app/api';  // Url del backend
  //private API_URL = 'http://localhost:3000/api';  // Cambia esto por el URL de tu backend

  constructor(private http: HttpClient, private router: Router) {
    // Inicializa el usuario desde el almacenamiento local, si existe
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    this.user = storedUser ? JSON.parse(storedUser) : null;
    this.token = storedToken ? storedToken : null;
  }

  // Registrar un nuevo usuario
  register(user: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  // Iniciar sesión
  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, user);
  }

  // Manejar el login exitoso
  handleLogin(response: any): void {
    console.log('Respuesta del servidor:', response); // Depuración
  
    // Validar que la respuesta y response.user existan
    if (!response || !response.user) {
      console.error('Respuesta del servidor inválida o falta la propiedad "user"');
      return;
    }
  
    // Guardar el usuario y el token
    this.user = { id: response.user.id, name: response.user.name };
    this.token = response.token;
    localStorage.setItem('user', JSON.stringify(this.user));
    localStorage.setItem('token', this.token);
  }
  
  // Obtener el nombre del usuario
  getUserName(): string {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null; // Carga el usuario almacenado
    return this.user ? this.user.name : 'Invitado'; // Devuelve el nombre del usuario o 'Invitado'
  }

  // Obtener el ID del usuario
  getUserId(): number | 0 {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null; // Carga el usuario almacenado
    return this.user ? this.user.id : 0; // Devuelve el ID del usuario o null
  }

  // Obtén el token del localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Valida el token
  async validateToken(token: string): Promise<boolean> {
    if (this.jwtHelper.isTokenExpired(token)) {
      // Si el token ha expirado
      return false;
    }

    // Opcional: Hacer una solicitud al backend para validar el token
    try {
      const response = await this.http
        .get<{ valid: boolean }>('https://api-dpdi.vercel.app/api/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .toPromise();

      return response?.valid || false;
    } catch (error) {
      console.error('Error validando el token:', error);
      return false;
    }
  }
  // Cerrar sesión
  logout(): void {
    this.user = null; // Elimina la información del usuario
    localStorage.removeItem('user'); // Elimina del almacenamiento local
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Redirige a la página de login
  }

  // Verificar si hay un usuario logueado
  isLoggedIn(): boolean {
    return this.user !== null && this.token !== null; // Comprueba si hay un usuario logueado
  }

  // Método para eliminar la cuenta
  deleteAccount(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de enviar el token de autenticación
    });

    return this.http.delete(`${this.API_URL}/delete-account`, { headers });
  }

}
