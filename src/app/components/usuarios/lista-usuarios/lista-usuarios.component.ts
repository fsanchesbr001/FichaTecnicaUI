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
import { ApiErrorService } from '../../../services/api-error.service';
import { UsuarioResponse } from '../../../model/usuario.model';
import { JwtService } from '../../../services/jwt.service';

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
  @Input() usuarios: UsuarioResponse[] = [];
  displayedColumns = ['nome', 'email', 'role', 'acoes'];
  perfilUser = false;

  dataSource = new MatTableDataSource<UsuarioResponse>(this.usuarios);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlUsuarios = `${environment.API}ficha-tecnica/usuarios`;
  private readonly urlListarUsuarios = `${this.urlUsuarios}/listar-todos-usuarios`;
  private readonly urlExcluirUsuario  = `${this.urlUsuarios}/excluir-usuario`;
  private readonly urlGerarPdf        = `${environment.API}ficha-tecnica/relatorios/gerar-pdf`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
    private apiErrorService: ApiErrorService,
    private jwtService: JwtService,
  ) {}

  ngOnInit(): void {
    this.perfilUser = this.usuarioLogadoEhUser();
    this.carregarUsuarios();
  }

  private usuarioLogadoEhUser(): boolean {
    const token = this.jwtService.getToken();
    if (!token) {
      return false;
    }

    const payload = this.jwtService.decodeToken(token);
    const role = payload?.['role'];

    if (typeof role === 'string') {
      const normalizedRole = role.toUpperCase().replace('ROLE_', '');
      return normalizedRole === 'USER';
    }

    if (Array.isArray(role)) {
      return role
        .map((r: unknown) => String(r).toUpperCase().replace('ROLE_', ''))
        .includes('USER');
    }

    return false;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarUsuarios(): void {
    this.http.get<UsuarioResponse[]>(this.urlListarUsuarios).subscribe({
      next: (dados) => {
        this.dataSource.data = (dados ?? []).filter(usuario => !this.ehUsuarioSistema(usuario));
      },
      error: (err) => {
        this.dataSource.data = [];
        this.toast.erro(this.apiErrorService.extrairMensagem(err, 'Erro ao carregar usuários.'));
      }
    });
  }

  onEditar(usuario: UsuarioResponse): void {
    if (this.ehUsuarioSistema(usuario)) {
      return;
    }
    this.router.navigate(['/principal/formulario-usuarios'], {
      state: { usuario }
    });
  }

  onExcluir(usuario: UsuarioResponse): void {
    if (this.ehUsuarioSistema(usuario)) {
      return;
    }
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirUsuario(usuario),
      }
    });
  }

  private excluirUsuario(usuario: UsuarioResponse): void {
    if (this.ehUsuarioSistema(usuario)) {
      return;
    }
    this.http.post(this.urlExcluirUsuario, { email: usuario.email }).subscribe({
      next: () => {
        this.toast.sucesso('Usuário excluído com sucesso.');
        this.carregarUsuarios();
      },
      error: (err) => {
        this.toast.erro(this.apiErrorService.extrairMensagem(err, 'ERRO AO EXCLUIR USUÁRIO.'));
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

  private ehUsuarioSistema(usuario: UsuarioResponse): boolean {
    return typeof usuario.role === 'string'
      && usuario.role.toUpperCase().replace('ROLE_', '') === 'SYSTEM';
  }
}
