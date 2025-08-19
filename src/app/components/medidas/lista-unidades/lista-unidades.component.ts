import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router} from '@angular/router';

export interface Medida {
  nome: string;
  sigla: string;
}

@Component({
  selector: 'app-lista-unidades',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './lista-unidades.component.html',
  styleUrl: './lista-unidades.component.css'
})


export class ListaUnidadesComponent implements AfterViewInit {
  @Input() unidades: Medida[] = [
    { nome: 'Metro', sigla: 'm' },
    { nome: 'Centímetro', sigla: 'cm' },
    { nome: 'Milímetro', sigla: 'mm' },
    { nome: 'Quilômetro', sigla: 'km' },
    { nome: 'Polegada', sigla: 'in' },
    { nome: 'Pé', sigla: 'ft' },
    { nome: 'Jarda', sigla: 'yd' }
  ];
  displayedColumns = ['nome', 'sigla', 'acoes'];

  dataSource = new MatTableDataSource<Medida>(this.unidades);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private router: Router) {}

  onEditar() {
    this.router.navigate(['/principal/formulario-medidas']);

  }

  onNovo() {
    this.router.navigate(['/principal/formulario-medidas']);
  }
}
