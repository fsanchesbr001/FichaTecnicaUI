import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaHistoricoItemComponent } from './lista-historico-item.component';

describe('ListaHistoricoItemComponent', () => {
  let component: ListaHistoricoItemComponent;
  let fixture: ComponentFixture<ListaHistoricoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaHistoricoItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaHistoricoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
