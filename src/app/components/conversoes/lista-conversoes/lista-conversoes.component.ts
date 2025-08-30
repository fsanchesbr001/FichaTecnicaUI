import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {Router} from '@angular/router';

export interface Conversao {
  unidadeDe: string;
  unidadePara: string;
  operacao: string;
  fator: number;
}


@Component({
  selector: 'app-lista-conversoes',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './lista-conversoes.component.html',
  styleUrl: './lista-conversoes.component.css'
})
export class ListaConversoesComponent implements AfterViewInit {

  @Input() conversoes: Conversao[] = [
    { unidadeDe: 'Quilograma', unidadePara: 'Grama', operacao: 'Multiplicação', fator: 1000 },
    { unidadeDe: 'Grama', unidadePara: 'Quilograma', operacao: 'Divisão', fator: 1000 },
    { unidadeDe: 'Metro', unidadePara: 'Centímetro', operacao: 'Multiplicação', fator: 100 },
    { unidadeDe: 'Centímetro', unidadePara: 'Metro', operacao: 'Divisão', fator: 100 }
  ];

  displayedColumns = ['unidadeDe', 'unidadePara','operacao','fator', 'acoes'];

  dataSource = new MatTableDataSource<Conversao>(this.conversoes);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private router: Router) {}

  onEditar() {
    this.router.navigate(['/principal/formulario-conversoes']);

  }

  onNovo() {
    this.router.navigate(['/principal/formulario-conversoes']);
  }

}
