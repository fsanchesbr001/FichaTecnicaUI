import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaConversoesComponent } from './lista-conversoes.component';

describe('ListaConversoesComponent', () => {
  let component: ListaConversoesComponent;
  let fixture: ComponentFixture<ListaConversoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaConversoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaConversoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
