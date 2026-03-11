import { Component, Input, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../shared/dialogo-confirmacao/dialogo-confirmacao.component';

export interface Usuario {
  nome: string;
  email: string;
  cpf: string;
  role: string;
  dataExpiracaoSenha: string | null;
  tentativas: number;
  primeiro_acesso: boolean;
  bloqueado_admin: boolean;
  bloqueado_tentativas: boolean;
  bloqueado_expiracao: boolean;
}

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
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
  private readonly urlExcluirUsuario  = `${environment.API}ficha-tecnica/usuarios/excluir-usuario`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarUsuarios(): void {
    this.http.get<Usuario[]>(this.urlListarUsuarios).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
      },
      error: () => {
        this.dataSource.data = [];
        this.snackBar.open('ERRO DE CHAMADA HTTP', 'Fechar', { duration: 5000 });
      }
    });
  }

  onEditar(usuario: Usuario): void {
    this.router.navigate(['/principal/formulario-usuarios'], {
      state: { usuario }
    });
  }

  onExcluir(usuario: Usuario): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirUsuario(usuario),
      }
    });
  }

  private excluirUsuario(usuario: Usuario): void {
    this.http.post(this.urlExcluirUsuario, { email: usuario.email }).subscribe({
      next: () => {
        this.snackBar.open('Usuário excluído com sucesso.', 'Fechar', { duration: 3000 });
        this.carregarUsuarios();
      },
      error: () => {
        this.snackBar.open('ERRO AO EXCLUIR USUÁRIO.', 'Fechar', { duration: 5000 });
      }
    });
  }

  onNovo(): void {
    this.router.navigate(['/principal/formulario-usuarios']);
  }
}
