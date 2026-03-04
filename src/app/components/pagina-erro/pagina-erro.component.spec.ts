import { TestBed } from '@angular/core/testing';

import { PaginaErroComponent } from './pagina-erro.component';

describe('PaginaErroComponent', () => {
  let component: PaginaErroComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaErroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaErroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

