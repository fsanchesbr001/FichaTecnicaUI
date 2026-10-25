import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormularioProdutosComponent } from './formulario-produtos.component';

describe('FormularioProdutosComponent image API proxy', () => {
  let component: FormularioProdutosComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: Router, useValue: { getCurrentNavigation: () => null } }
      ]
    });
    component = TestBed.createComponent(FormularioProdutosComponent).componentInstance;
  });

  for (const path of ['arquivo.png', 'api/imagens/arquivo.png', '/api/imagens/arquivo.png']) {
    it(`routes ${path} to the existing backend image endpoint`, () => {
      component.form.patchValue({ imagem: path });
      expect(component.imagemIlustrativaUrl).toBe('/api/api/imagens/arquivo.png');
    });
  }

  for (const path of ['https://example.com/imagem.png', 'data:image/png;base64,AAAA']) {
    it(`preserves explicit image URL ${path}`, () => {
      component.form.patchValue({ imagem: path });
      expect(component.imagemIlustrativaUrl).toBe(path);
    });
  }
});
