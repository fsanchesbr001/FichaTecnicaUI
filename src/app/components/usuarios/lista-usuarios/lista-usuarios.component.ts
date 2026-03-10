import { Component, Input, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
export class ListaUsuariosComponent implements AfterViewInit, OnInit {
  @Input() usuarios: Usuario[] = [];
  displayedColumns = ['nome', 'email', 'role', 'acoes'];

  dataSource = new MatTableDataSource<Usuario>(this.usuarios);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlListarUsuarios = `${environment.API}ficha-tecnica/usuarios/listar-todos-usuarios`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  carregarUsuarios(): void {
    this.http.get<Usuario[]>(this.urlListarUsuarios).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
      },
      error: () => {
        this.dataSource.data = [];
        this.snackBar.open('ERRO DE CHAMADA HTTP', 'Fechar', {
          duration: 5000
        });
      }
    });
  }

  onEditar() {
    this.router.navigate(['/principal/formulario-usuarios']);

  }

  onNovo() {
    this.router.navigate(['/principal/formulario-usuarios']);
  }
}
