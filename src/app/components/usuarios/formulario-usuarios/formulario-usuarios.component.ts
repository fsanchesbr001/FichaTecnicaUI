import { Component, Input, OnInit, LOCALE_ID, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import localePt from '@angular/common/locales/pt';
import { validateCPF } from '../../../validators/cpf.validator';
import { Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';

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
  protected usuarioParaEditar: any = null;
  private readonly destroyRef = inject(DestroyRef);
  private primeiroAcessoVeioDoDb = false;

  /** Desabilita o Salvar apenas quando Primeiro Acesso veio true do banco de dados. */
  get primeiroAcessoAtivo(): boolean {
    return this.primeiroAcessoVeioDoDb;
  }

  private readonly urlRoles            = `${environment.API}ficha-tecnica/usuarios/roles`;
  private readonly urlRegistrarUsuario = `${environment.API}ficha-tecnica/usuarios/registrar-usuario`;
  private readonly urlAtualizarUsuario = `${environment.API}ficha-tecnica/usuarios/atualizar-usuario`;
  private readonly urlPrimeiroAcesso   = `${environment.API}ficha-tecnica/usuarios/primeiro-acesso`;
  private readonly urlGerarPdf         = `${environment.API}ficha-tecnica/relatorios/gerar-pdf`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
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

    this.configurarRegrasToggle();
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
        this.toast.erro('ERRO DE CHAMADA HTTP');
      },
    });
  }

  private preencherFormulario(u: any): void {
    console.log('[preencherFormulario] Dados recebidos:', u);

    const cpfSomenteDigitos = u.cpf ? u.cpf.replace(/\D/g, '') : '';

    // Registra se Primeiro Acesso já veio true do banco (impede salvar nesse caso)
    this.primeiroAcessoVeioDoDb = u.primeiro_acesso === true || u.primeiro_acesso === 'true';

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
    }, { emitEvent: false });

    // Campos disabled precisam ser atualizados diretamente pelo AbstractControl
    const dataExpiracaoCtrl = this.form.get('dataExpiracao');
    if (dataExpiracaoCtrl) {
      const dataValor = u.dataExpiracaoSenha ? new Date(u.dataExpiracaoSenha) : null;
      dataExpiracaoCtrl.setValue(dataValor, { emitEvent: false });
    }

    const tentativasCtrl = this.form.get('tentativas');
    if (tentativasCtrl) {
      tentativasCtrl.setValue(u.tentativas ?? 0, { emitEvent: false });
    }

    // Aplica regras de disable/enable com base nos valores carregados do banco
    this.aplicarRegrasToggleInicio();
  }

  // ── Regras de negócio dos toggles ─────────────────────────────────────────

  /** Configura os toggles somente-leitura e as subscrições de exclusão mútua. */
  private configurarRegrasToggle(): void {
    // Bloqueio por Tentativas e por Expiração são sempre somente-leitura
    this.form.get('bloqueioTentativas')?.disable({ emitEvent: false });
    this.form.get('bloqueioExpiracao')?.disable({ emitEvent: false });

    // Em modo inclusão todos os toggles ficam desabilitados
    if (!this.usuarioParaEditar) {
      this.form.get('primeiroAcesso')?.disable({ emitEvent: false });
      this.form.get('bloqueioAdm')?.disable({ emitEvent: false });
      return; // subscrições de exclusão mútua não são necessárias em modo inclusão
    }
    this.form.get('bloqueioAdm')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ativado => {
        const primeiroAcesso = this.form.get('primeiroAcesso');
        if (ativado) {
          primeiroAcesso?.disable({ emitEvent: false });
        } else {
          // Reabilita primeiroAcesso somente se ele não estiver bloqueando bloqueioAdm
          primeiroAcesso?.enable({ emitEvent: false });
        }
      });

    this.form.get('primeiroAcesso')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ativado => {
        const bloqueioAdm = this.form.get('bloqueioAdm');
        if (ativado) {
          // Primeiro Acesso não pode ser desfeito: desabilita ele mesmo,
          // bloqueioAdm e todos os demais campos editáveis
          this.form.get('primeiroAcesso')?.disable({ emitEvent: false });
          bloqueioAdm?.disable({ emitEvent: false });
          this.form.get('nome')?.disable({ emitEvent: false });
          this.form.get('role')?.disable({ emitEvent: false });
        } else {
          bloqueioAdm?.enable({ emitEvent: false });
        }
      });
  }

  /** Aplica as regras de disable/enable no carregamento inicial dos dados. */
  private aplicarRegrasToggleInicio(): void {
    const bloqueioAdmVal    = this.form.get('bloqueioAdm')?.value;
    const primeiroAcessoVal = this.form.get('primeiroAcesso')?.value;

    if (bloqueioAdmVal) {
      // bloqueioAdm ON → desabilita primeiroAcesso
      this.form.get('primeiroAcesso')?.disable({ emitEvent: false });
    } else if (primeiroAcessoVal) {
      // primeiroAcesso ON → desabilita ele mesmo, bloqueioAdm e demais campos editáveis
      this.form.get('primeiroAcesso')?.disable({ emitEvent: false });
      this.form.get('bloqueioAdm')?.disable({ emitEvent: false });
      this.form.get('nome')?.disable({ emitEvent: false });
      this.form.get('role')?.disable({ emitEvent: false });
    } else {
      // Ambos OFF → ambos habilitados
      this.form.get('bloqueioAdm')?.enable({ emitEvent: false });
      this.form.get('primeiroAcesso')?.enable({ emitEvent: false });
    }
    // bloqueioTentativas e bloqueioExpiracao permanecem sempre desabilitados
    this.form.get('bloqueioTentativas')?.disable({ emitEvent: false });
    this.form.get('bloqueioExpiracao')?.disable({ emitEvent: false });
  }

  onSalvar(): void {    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
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
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  private atualizarUsuario(): void {
    const valores = this.form.getRawValue();
    const email   = this.usuarioParaEditar.email;

    // 02 — Primeiro Acesso selecionado: chama endpoint específico
    if (valores.primeiroAcesso) {
      this.http.post(`${this.urlPrimeiroAcesso}/${email}`, {}).subscribe({
        next: () => {
          this.abrirDialogoSucesso('Registro atualizado com sucesso.');
        },
        error: () => {
          this.salvando = false;
          this.toast.erro('ERRO DE CHAMADA HTTP');
        }
      });
      return;
    }

    // 01 — Fluxo normal de atualização
    const payload = {
      bloqueado_admin:       valores.bloqueioAdm,
      bloqueado_tentativas:  valores.bloqueioTentativas,
      bloqueado_expiracao:   valores.bloqueioExpiracao,
      primeiro_acesso:       valores.primeiroAcesso,
      nome:                  valores.nome,
      role:                  valores.role,
    };

    this.http.put(`${this.urlAtualizarUsuario}/${email}`, payload).subscribe({
      next: () => {
        this.abrirDialogoSucesso('Registro atualizado com sucesso.');
      },
      error: () => {
        this.salvando = false;
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  private abrirDialogoSucesso(mensagem: string): void {
    this.toast.sucesso(mensagem);
    this.router.navigate(['/principal/lista-usuarios']);
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
        this.toast.erro('ERRO AO GERAR PDF');
      }
    });
  }
}
