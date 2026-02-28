import { TestBed } from '@angular/core/testing';

import { InfoSegurancaComponent } from './info-seguranca.component';

describe('InfoSegurancaComponent', () => {
  let component: InfoSegurancaComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSegurancaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoSegurancaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

