import { Component, Input,ViewChild,AfterViewInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface Usuario {
  nome: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements AfterViewInit{
  @Input() usuarios: Usuario[] = [{ nome: 'João Silva', email: 'joao@email.com', role: 'Admin' },
    { nome: 'Maria Souza', email: 'maria@email.com', role: 'User' },
    { nome: 'Carlos Lima', email: 'carlos@email.com', role: 'Editor' }];
  displayedColumns = ['nome', 'email', 'role', 'acoes'];

  dataSource = new MatTableDataSource<Usuario>(this.usuarios);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
