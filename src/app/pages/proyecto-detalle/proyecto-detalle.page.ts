import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ProyectoService } from 'src/app/services/proyecto.service';

@Component({
  selector: 'app-proyecto-detalle',
  templateUrl: './proyecto-detalle.page.html',
  styleUrls: ['./proyecto-detalle.page.scss'],
})
export class ProyectoDetallePage implements OnInit {
  proyecto: any = { nombre: '', descripcion: '', tareas: [] };

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit() {
    // Acceder al estado pasado a través de history.state
    const state = history.state;
    if (state && state.proyecto) {
      this.proyecto = state.proyecto;
    }
  }

  // Marcar la tarea como completada
  marcarTareaCompletada(index: number) {
    this.proyecto.tareas[index].completada = !this.proyecto.tareas[index].completada;
  }

  // Volver a la página anterior
  regresar() {
    this.navCtrl.back();
  }

  guardarProyectoCompletado() {
    if (this.proyecto.tareas.every((tarea: Tarea) => tarea.completada)) {
      // Guardar el proyecto como completado
      console.log('Proyecto completado:', this.proyecto);
  
      // Agregar lógica para mover el proyecto a la lista de "Completados"
      this.proyectoService.moverACompletados(this.proyecto);
      this.regresar();
    } else {
      alert('Aún hay tareas pendientes.');
    }
  }
}

interface Tarea {
  nombre: string;
  responsable: string;
  completada: boolean;
}