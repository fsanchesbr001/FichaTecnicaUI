import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {Router} from '@angular/router';

export interface Item {
  nome: string;
  unidade: string;
  valor: number;
}

@Component({
  selector: 'app-lista-item',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './lista-item.component.html',
  styleUrl: './lista-item.component.css'
})

export class ListaItemComponent implements AfterViewInit {

  @Input() itens: Item[] = [
    { nome: 'Batata', unidade: 'Kg', valor: 6.50 },
    { nome: 'Cenoura', unidade: 'Kg', valor: 4.20 },
    { nome: 'Tomate', unidade: 'Kg', valor: 8.30 },
    { nome: 'Alface', unidade: 'Maço', valor: 3.00 },
    { nome: 'Cebola', unidade: 'Kg', valor: 5.10 },
    { nome: 'Pepino', unidade: 'Kg', valor: 4.80 },
    { nome: 'Abobrinha', unidade: 'Kg', valor: 7.20 }
  ];
  displayedColumns = ['nome', 'unidade','valor', 'acoes'];

  dataSource = new MatTableDataSource<Item>(this.itens);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private router: Router) {}

  onEditar() {
    this.router.navigate(['/principal/formulario-item']);

  }

  onNovo() {
    this.router.navigate(['/principal/formulario-item']);
  }

}
