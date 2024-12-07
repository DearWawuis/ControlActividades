import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProyectoService } from '../../services/proyecto.service';

@Component({
  selector: 'app-crear-proyecto-modal',
  templateUrl: './crear-proyecto-modal.component.html',
  styleUrls: ['./crear-proyecto-modal.component.scss'],
})
export class CrearProyectoModalComponent implements OnInit {
  proyecto = { nombre: '', descripcion: '' };
  tareas: any[] = [];
  nuevaTarea = { nombre: '', responsable: '' };
  usuarios: string[] = ['Juan Pérez', 'María López', 'Carlos García'];

  constructor(
    private modalController: ModalController,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit() {}

  // Cerrar el modal
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Agregar una tarea a la lista
  agregarTarea() {
    if (this.nuevaTarea.nombre) {
      this.tareas.push({ ...this.nuevaTarea });
      this.nuevaTarea = { nombre: '', responsable: '' };
    }
  }

  // Eliminar una tarea
  eliminarTarea(index: number) {
    this.tareas.splice(index, 1);
  }

  // Guardar el proyecto en el servicio y cerrar el modal
  guardarProyecto() {
    if (this.proyecto.nombre) {
      const nuevoProyecto = { ...this.proyecto, tareas: this.tareas };
      this.proyectoService.agregarProyecto(nuevoProyecto);
      console.log('Proyecto guardado:', nuevoProyecto);
      this.modalController.dismiss(nuevoProyecto);
    }
  }
}
