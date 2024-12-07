import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProyectoDetallePage } from './proyecto-detalle.page';

describe('ProyectoDetallePage', () => {
  let component: ProyectoDetallePage;
  let fixture: ComponentFixture<ProyectoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProyectoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
