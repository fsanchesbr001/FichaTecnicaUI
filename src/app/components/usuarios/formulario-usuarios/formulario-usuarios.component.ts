import { Component, Input, OnInit, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import localePt from '@angular/common/locales/pt';
import { validateCPF } from '../../../validators/cpf.validator';
import { Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../../environments/environment';
import { DialogoInformacaoComponent } from '../../shared/dialogo-informacao/dialogo-informacao.component';

registerLocaleData(localePt);

export interface Role {
  value: string;
  label: string;
  labelKey: string;
}

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MM/yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MM/yyyy',
    yearA11yLabel: 'yyyy',
  },
};

@Component({
  selector: 'app-formulario-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatFormField,
    MatError,
    MatIcon,
    MatLabel,
    MatInput,
    MatSuffix,
    MatButton,
    MatDatepickerModule,
    MatOption,
    MatSelect,
    MatSlideToggle,
    NgxMaskDirective,
    MatDialogModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    provideNativeDateAdapter(),
  ],
  templateUrl: './formulario-usuarios.component.html',
  styleUrls: ['./formulario-usuarios.component.css'],
})
export class FormularioUsuariosComponent implements OnInit {
  @Input() usuario: any;
  form!: FormGroup;
  roles: Role[] = [];
  salvando = false;
  private usuarioParaEditar: any = null;

  private readonly urlRoles            = `${environment.API}ficha-tecnica/usuarios/roles`;
  private readonly urlRegistrarUsuario = `${environment.API}ficha-tecnica/usuarios/registrar-usuario`;
  private readonly urlAtualizarUsuario = `${environment.API}ficha-tecnica/usuarios/atualizar-usuario`;
  private readonly urlGerarPdf         = `${environment.API}ficha-tecnica/relatorios/gerar-pdf`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Recupera o usuário passado via state na navegação (fluxo de edição)
    const nav: Navigation | null = this.router.getCurrentNavigation();
    this.usuarioParaEditar = nav?.extras?.state?.['usuario'] ?? null;

    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: [
        '',
        [
          validateCPF,
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^\d{11}$/),
        ],
      ],
      role: ['', Validators.required],
      dataExpiracao: [{ value: new Date(), disabled: true }],
      tentativas: [{ value: 5, disabled: true }, [Validators.min(0), Validators.max(5)]],
      primeiroAcesso: [false],
      bloqueioAdm: [false],
      bloqueioTentativas: [false],
      bloqueioExpiracao: [false],
    });
  }

  ngOnInit(): void {
    this.carregarRoles();
  }

  carregarRoles(): void {
    this.http.get<{ roles: Role[] }>(this.urlRoles).subscribe({
      next: (dados: { roles: Role[] }) => {
        this.roles = dados?.roles ?? [];

        if (this.usuarioParaEditar) {
          // Modo edição: preenche o formulário com os dados da linha selecionada
          this.preencherFormulario(this.usuarioParaEditar);
        } else {
          // Modo inclusão: seleciona USER como padrão
          const rolePadrao = this.roles.find(r => r.value === 'USER');
          if (rolePadrao) {
            this.form.get('role')?.setValue(rolePadrao.value);
          }
        }
      },
      error: () => {
        this.roles = [];
        this.snackBar.open('ERRO DE CHAMADA HTTP', 'Fechar', { duration: 5000 });
      },
    });
  }

  private preencherFormulario(u: any): void {
    console.log('[preencherFormulario] Dados recebidos:', u);

    const cpfSomenteDigitos = u.cpf ? u.cpf.replace(/\D/g, '') : '';

    // Modo edição: email e CPF não podem ser alterados
    this.form.get('email')?.disable();
    this.form.get('cpf')?.disable();

    this.form.patchValue({
      nome: u.nome ?? '',
      email: u.email ?? '',
      cpf: cpfSomenteDigitos,
      role: u.role ?? '',
      primeiroAcesso: u.primeiro_acesso === true || u.primeiro_acesso === 'true',
      bloqueioAdm: u.bloqueado_admin === true || u.bloqueado_admin === 'true',
      bloqueioTentativas: u.bloqueado_tentativas === true || u.bloqueado_tentativas === 'true',
      bloqueioExpiracao: u.bloqueado_expiracao === true || u.bloqueado_expiracao === 'true',
    });

    // Campos disabled precisam ser atualizados diretamente pelo AbstractControl
    const dataExpiracaoCtrl = this.form.get('dataExpiracao');
    if (dataExpiracaoCtrl) {
      const dataValor = u.dataExpiracaoSenha ? new Date(u.dataExpiracaoSenha) : null;
      dataExpiracaoCtrl.setValue(dataValor);
    }

    const tentativasCtrl = this.form.get('tentativas');
    if (tentativasCtrl) {
      tentativasCtrl.setValue(u.tentativas ?? 0);
    }
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 3000 });
      return;
    }

    this.salvando = true;

    if (this.usuarioParaEditar) {
      this.atualizarUsuario();
    } else {
      this.registrarUsuario();
    }
  }

  private registrarUsuario(): void {
    const valores = this.form.getRawValue();

    const payload = {
      login: valores.email,
      senha: null,
      role: valores.role,
      nome: valores.nome,
      cpf: valores.cpf,
    };

    this.http.post(this.urlRegistrarUsuario, payload).subscribe({
      next: () => {
        this.abrirDialogoSucesso('Usuário registrado com sucesso.');
      },
      error: () => {
        this.salvando = false;
        this.snackBar.open('ERRO DE CHAMADA HTTP', 'Fechar', { duration: 5000 });
      }
    });
  }

  private atualizarUsuario(): void {
    const valores = this.form.getRawValue();
    const email = this.usuarioParaEditar.email;

    const payload = {
      bloqueado_admin: valores.bloqueioAdm,
      bloqueado_tentativas: valores.bloqueioTentativas,
      bloqueado_expiracao: valores.bloqueioExpiracao,
      primeiro_acesso: valores.primeiroAcesso,
      nome: valores.nome,
      role: valores.role,
    };

    this.http.put(`${this.urlAtualizarUsuario}/${email}`, payload).subscribe({
      next: () => {
        this.abrirDialogoSucesso('Registro atualizado com sucesso.');
      },
      error: () => {
        this.salvando = false;
        this.snackBar.open('ERRO DE CHAMADA HTTP', 'Fechar', { duration: 5000 });
      }
    });
  }

  private abrirDialogoSucesso(mensagem: string): void {
    const dialogRef = this.dialog.open(DialogoInformacaoComponent, {
      width: '360px',
      data: { titulo: 'Aviso', mensagem }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/principal/lista-usuarios']);
    });
  }

  onCancelar(): void {
    this.router.navigate(['/principal/lista-usuarios']);
  }

  onImprimir(): void {
    const valores = this.form.getRawValue();

    // Monta o objeto do usuário combinando os dados do formulário
    // com campos extras que só existem no modo edição (usuarioParaEditar)
    const usuarioData = {
      nome:                  valores.nome,
      email:                 valores.email,
      cpf:                   valores.cpf,
      role:                  valores.role,
      tentativas:            valores.tentativas,
      bloqueado_admin:       valores.bloqueioAdm,
      bloqueado_tentativas:  valores.bloqueioTentativas,
      bloqueado_expiracao:   valores.bloqueioExpiracao,
      primeiro_acesso:       valores.primeiroAcesso,
      dataExpiracaoSenha:    valores.dataExpiracao
                               ? new Date(valores.dataExpiracao).toISOString()
                               : null,
      tokenSeguranca:        this.usuarioParaEditar?.tokenSeguranca    ?? null,
      dataCriacao:           this.usuarioParaEditar?.dataCriacao       ?? null,
      dataExpiracaoToken:    this.usuarioParaEditar?.dataExpiracaoToken ?? null,
    };

    const body = {
      jsonData: JSON.stringify([usuarioData]),
      listPath: '',
      titulo: 'Detalhe de Usuário',
      colunas: {
        nome:                  'Nome do Usuário',
        email:                 'E-mail',
        cpf:                   'C.P.F',
        role:                  'Perfil',
        dataCriacao:           'Criado em',
        tokenSeguranca:        'Id. Segurança',
        dataExpiracaoToken:    'Expira Id em',
        tentativas:            'Tentativas Permitidas',
        dataExpiracaoSenha:    'Expira Senha em',
        bloqueado_admin:       'Bloqueio Administrativo',
        bloqueado_tentativas:  'Bloqueio Tentativas',
        bloqueado_expiracao:   'Bloqueio Expiração Senha',
        primeiro_acesso:       'Primeiro Acesso',
      },
      tipoRelatorio: 'DETALHE',
      orientacao:    'PAISAGEM',
      alternarCores: false,
    };

    this.http.post(this.urlGerarPdf, body, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now  = new Date();
        const aaaa = now.getFullYear().toString();
        const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd   = now.getDate().toString().padStart(2, '0');
        const hh   = now.getHours().toString().padStart(2, '0');
        const min  = now.getMinutes().toString().padStart(2, '0');
        const ss   = now.getSeconds().toString().padStart(2, '0');
        const filename = `relatorio_detalhado_usuario_${aaaa}${mm}${dd}_${hh}${min}${ss}.pdf`;

        const url    = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href     = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('ERRO AO GERAR PDF', 'Fechar', { duration: 5000 });
      }
    });
  }
}
