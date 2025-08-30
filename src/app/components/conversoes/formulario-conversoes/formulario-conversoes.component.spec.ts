import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioConversoesComponent } from './formulario-conversoes.component';

describe('FormularioConversoesComponent', () => {
  let component: FormularioConversoesComponent;
  let fixture: ComponentFixture<FormularioConversoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioConversoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioConversoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
