import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  private proyectos: any[] = []; // Array para almacenar proyectos
  private proyectosCompletados: any[] = [];

  constructor() {}

  obtenerProyectos() {
    return this.proyectos; // Retorna los proyectos
  }

  agregarProyecto(proyecto: any) {
    proyecto.id = Date.now(); // Genera un ID único
    proyecto.tareas = proyecto.tareas || []; // Usa las tareas existentes o inicializa con un array vacío
    this.proyectos.push(proyecto); // Agrega el proyecto al array
  }

  agregarTarea(proyectoId: number, tarea: any) {
    const proyecto = this.proyectos.find((p) => p.id === proyectoId);
    if (proyecto) {
      tarea.id = Date.now(); // Genera un ID único para la tarea
      proyecto.tareas.push(tarea); // Agrega la tarea al proyecto
    }
  }

  getProyectosCompletados() {
    return this.proyectosCompletados;
  }

  moverACompletados(proyecto: any) {
    this.proyectosCompletados.push(proyecto);
    this.proyectos = this.proyectos.filter(p => p !== proyecto);
  }
}
