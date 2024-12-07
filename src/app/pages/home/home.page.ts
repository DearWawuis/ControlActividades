import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { CrearProyectoModalComponent } from 'src/app/components/crear-proyecto-modal/crear-proyecto-modal.component';
import { ProyectoService } from '../../services/proyecto.service';
import Swiper from 'swiper';


import { TabService } from '../../services/tab.service';

//Ejemplo de comentario para Github en la rama Main

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  userId: number;
  proyectos: any[] = []; // Array para almacenar los proyectos
  proyectosCompletados: any[] = [];
  swiper: any;
  currentIndex = 0;
  private routerSubscription!: Subscription; // Suscripción a eventos de navegación


  constructor(
    private navCtrl: NavController,
    private authService: AuthService, // Servicio de autenticación
    private router: Router, // Router para redireccionar
    public tabService: TabService,
    private modalController: ModalController,
    private proyectoService: ProyectoService
  ) {
    // Inicializar el nombre del usuario y el estado de autenticación
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName; // Comprobar si el usuario está autenticado
    this.userId = this.authService.getUserId(); //Obtener el ID del usuario para peticiones en los servicios
  }

  ngOnInit() {
    this.loadUserData(); //Cargar datos del usuario
    this.subscribeToRouterEvents();
    this.proyectos = this.proyectoService.obtenerProyectos();
    this.proyectosCompletados = this.proyectoService.getProyectosCompletados();
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

  cargarProyectos() {
    this.proyectos = this.proyectoService.obtenerProyectos();
  }

  ngOnDestroy() {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,         // Muestra un slide a la vez
      spaceBetween: 10,         // Espacio entre slides
      navigation: {             // Opciones de navegación (botones)
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.proyectos.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.proyectos.length) % this.proyectos.length;
  }

  async abrirModalCrearProyecto() {
    const modal = await this.modalController.create({
      component: CrearProyectoModalComponent,
    });
  
    modal.onDidDismiss().then(() => {
      this.cargarProyectos();
    });
  
    return await modal.present();
  }

  // Función para ver los detalles de un proyecto
  verDetalles(proyecto: any) {
    this.navCtrl.navigateForward('/proyecto-detalle', {
      state: { proyecto: proyecto } // Pasando el proyecto a la nueva página
    });
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

  // Cerrar el menú de perfil
  closeProfileMenu() {
    this.isProfileMenuOpen = false;
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
}