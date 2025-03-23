import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';
import { TabService } from '../../services/tab.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ModalController } from '@ionic/angular';
import { ModalCamaraComponent } from '../../components/modal-camara/modal-camara.component';
import { ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface Photo {
  _id: string; // El id de la foto
  image: string; // La imagen en base64
  userId: number;
}

interface Video {
  _id: string; // ID del video
  url: string; // URL del video
  user: number;
}

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit, OnDestroy {
  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isSettingsExpanded: boolean = false;
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  userId: number;
  photos: Photo[] = []; // Array para almacenar las fotos capturadas
  videos: Video[] = [];
  private routerSubscription!: Subscription; // Suscripción a eventos de navegación

  constructor(
    private modalController: ModalController,
    private authService: AuthService, // Servicio de autenticación
    private alertController: AlertController,
    private router: Router, // Router para redireccionar
    public tabService: TabService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
    // Inicializar el nombre del usuario y el estado de autenticación
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName; // Comprobar si el usuario está autenticado
    this.userId = this.authService.getUserId(); //Obtener el ID del usuario para peticiones en los servicios
  }
  ngOnInit() {
    this.loadUserData(); //Cargar datos del usuario
    this.subscribeToRouterEvents();
    this.loadPhotos();
    this.loadVideos();
    this.checkTokenValidity(); // Verifica la validez del token al cargar la página
  }

  async checkTokenValidity() {
    const token = this.authService.getToken(); // Obtén el token del localStorage

    if (token) {
      // Verifica si el token es válido
      const isValid = await this.authService.validateToken(token);

      if (!isValid) {
        // Si el token no es válido, elimínalo y redirige al usuario a la página de inicio de sesión
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } else {
      // Si no hay token, redirige al usuario a la página de inicio de sesión
      this.router.navigate(['/login']);
    }
  }

  // Carga datos del usuario
  private loadUserData() {
    this.userName = this.authService.getUserName();
    this.userId = this.authService.getUserId();
    this.isLoggedIn = !!this.userName;
  }

  // Suscripción a eventos de navegación
  private subscribeToRouterEvents() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeProfileMenu();
        this.loadUserData();
      }
    });
  }

  async openCameraModal() {
    const modal = await this.modalController.create({
      component: ModalCamaraComponent,
    });

    // Escuchar el resultado del modal cuando se cierre
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Agregar la foto capturada al array de fotos
        this.photos.push(result.data);

        // Forzar la detección de cambios
        this.cdRef.detectChanges(); // Fuerza la actualización de la vista

        // Actualizar las fotos desde la base de datos
        this.loadPhotos();
      }
    });

    return await modal.present();
  }

  // Método para abrir el modal de grabación de video
  async openVideoModal() {
    const modal = await this.modalController.create({
      component: ModalCamaraComponent, // Usa el mismo componente o uno diferente si es necesario
      componentProps: { mode: 'video' }, // Pasa un modo de 'video' para distinguir la funcionalidad
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Agregar el video grabado al array de videos
        this.videos.push(result.data);

        // Forzar la detección de cambios
        this.cdRef.detectChanges();

        // Cargar los videos desde la base de datos
        this.loadVideos();
      }
    });

    return await modal.present();
  }

  // Método para cargar los videos desde la API
  loadVideos() {
    const token = this.authService.getToken(); // Obtén el token del localStorage

    // Configura los headers con el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Video[]>(`https://api-dpdi.vercel.app/api/video/videos`, { headers })
      .subscribe(
        (videos) => {
          this.videos = videos;
        },
        (error) => {
          console.error('Error al cargar los videos', error);
        }
      );
  }

  loadPhotos() {
    const token = this.authService.getToken(); // Obtén el token del localStorage

    // Configura los headers con el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Photo[]>(`https://api-dpdi.vercel.app/api/photo/photos`, { headers })
      .subscribe(
        (photos) => {
          // Extraer solo las imágenes en Base64
          this.photos = photos;
        },
        (error) => {
          console.error('Error al cargar las fotos', error);
        }
      );
  }

  // Método para eliminar un video
  deleteVideo(videoId: string) {
    const token = this.authService.getToken(); // Obtén el token del localStorage

    // Configura los headers con el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .delete(`https://api-dpdi.vercel.app/api/video/videos/${videoId}`, { headers })
      .subscribe(
        () => {
          this.videos = this.videos.filter((video) => video._id !== videoId);
        },
        (error) => {
          console.error('Error al eliminar el video', error);
        }
      );
  }

  deletePhoto(photoId: string) {
    const token = this.authService.getToken(); // Obtén el token del localStorage

    // Configura los headers con el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .delete(`https://api-dpdi.vercel.app/api/photo/photos/${photoId}`, { headers })
      .subscribe(
        () => {
          // Si la eliminación fue exitosa, eliminamos la foto del array local
          this.photos = this.photos.filter((photo) => photo._id !== photoId);
        },
        (error) => {
          console.error('Error al eliminar la foto', error);
        }
      );
  }

  ngOnDestroy() {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout(); // Lógica para cerrar sesión
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  // Método para iniciar sesión
  login() {
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  // Método para eliminar la cuenta
  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Eliminar cuenta',
      message:
        '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary', // Estilo opcional para el botón "No"
        },
        {
          text: 'Sí',
          handler: () => {
            this.confirmDeleteAccount(); // Llamar al método para eliminar la cuenta
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para confirmar la eliminación de la cuenta
  confirmDeleteAccount() {
    this.authService.deleteAccount().subscribe({
      next: (response) => {
        console.log('Cuenta eliminada:', response);
        // Redirigir al usuario o realizar otras acciones
        this.authService.logout(); // Cerrar sesión después de eliminar la cuenta
      },
      error: (err) => {
        console.error('Error al eliminar la cuenta:', err);
      },
    });
  }

  // Cerrar el menú de perfil
  closeProfileMenu() {
    this.isProfileMenuOpen = false;
    this.isSettingsExpanded = false;
  }

  goToHomePage() {
    this.tabService.selectedTab = 'home';
    this.router.navigate(['/home']);
  }

  goToFavPage() {
    this.tabService.selectedTab = 'map';
    this.router.navigate(['/mapa']);
  }

  goToCamPage() {
    this.tabService.selectedTab = 'cam';
    this.router.navigate(['/camara']);
  }

  // Alternar el estado de apertura/cierre del menú de perfil
  toggleProfileMenu() {
    this.tabService.selectedTab = 'profile';
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleSettings() {
    this.isSettingsExpanded = !this.isSettingsExpanded;
  }
}
