import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProyectoDetallePageRoutingModule } from './proyecto-detalle-routing.module';

import { ProyectoDetallePage } from './proyecto-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProyectoDetallePageRoutingModule
  ],
  declarations: [ProyectoDetallePage]
})
export class ProyectoDetallePageModule {}
