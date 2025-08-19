import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaUnidadesComponent } from './lista-unidades.component';

describe('ListaUnidadesComponent', () => {
  let component: ListaUnidadesComponent;
  let fixture: ComponentFixture<ListaUnidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaUnidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaUnidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
