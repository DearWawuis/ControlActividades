import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProyectoDetallePage } from './proyecto-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: ProyectoDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectoDetallePageRoutingModule {}
