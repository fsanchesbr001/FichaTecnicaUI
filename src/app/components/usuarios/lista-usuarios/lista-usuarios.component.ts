import { Component, Input, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../services/toast.service';

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
  private readonly urlGerarPdf        = `${environment.API}ficha-tecnica/relatorios/gerar-pdf`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
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
        this.toast.erro('ERRO DE CHAMADA HTTP');
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
        this.toast.sucesso('Usuário excluído com sucesso.');
        this.carregarUsuarios();
      },
      error: () => {
        this.toast.erro('ERRO AO EXCLUIR USUÁRIO.');
      }
    });
  }

  onImprimir(): void {
    const body = {
      jsonData: JSON.stringify(this.dataSource.data),
      listPath: '',
      titulo: 'Lista de Usuários',
      colunas: {
        nome:  'Nome do Usuário',
        email: 'E-mail',
        role:  'Perfil'
      },
      tipoRelatorio: 'LISTA',
      orientacao: 'RETRATO',
      alternarCores: true
    };

    this.http.post(this.urlGerarPdf, body, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now = new Date();
        const aaaa = now.getFullYear().toString();
        const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd   = now.getDate().toString().padStart(2, '0');
        const hh   = now.getHours().toString().padStart(2, '0');
        const min  = now.getMinutes().toString().padStart(2, '0');
        const ss   = now.getSeconds().toString().padStart(2, '0');
        const filename = `lista-usuarios-${aaaa}${mm}${dd}-${hh}:${min}:${ss}.pdf`;

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.toast.erro('ERRO AO GERAR PDF');
      }
    });
  }

  onNovo(): void {
    this.router.navigate(['/principal/formulario-usuarios']);
  }
}
