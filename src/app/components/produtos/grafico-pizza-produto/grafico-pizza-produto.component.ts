import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  PieController,
  Tooltip,
} from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

interface FatiaGraficoPizza {
  nomeItem: string;
  idItem: number;
  porcentagem: number;
  porcentagemFormatada: string;
  valorItem: string;
  valorItemBruto: number;
  valorTotal: string;
  cor: string;
}

interface GraficoPizzaProdutoResponse {
  nomeProduto: string;
  valorTotal: string;
  fatias: FatiaGraficoPizza[];
  labels: string[];
  valores: number[];
  cores: string[];
}

@Component({
  selector: 'app-grafico-pizza-produto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-pizza-produto.component.html',
  styleUrl: './grafico-pizza-produto.component.css',
})
export class GraficoPizzaProdutoComponent implements OnChanges, OnDestroy {
  @Input() codigoProduto: number | null = null;
  @Input() atualizacaoToken = 0;

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  carregando = false;
  erro: string | null = null;
  dados: GraficoPizzaProdutoResponse | null = null;

  private chart: Chart | null = null;
  private readonly urlGraficoPizza = `${environment.API}ficha-tecnica/produtos`;

  get tituloGrafico(): string {
    return `Composicao de Custo - ${this.dados?.nomeProduto ?? ''}`.trim();
  }

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const mudouProduto = !!changes['codigoProduto'];
    const mudouAtualizacao = !!changes['atualizacaoToken'] && !changes['atualizacaoToken'].firstChange;

    if ((mudouProduto || mudouAtualizacao) && this.codigoProduto != null) {
      this.carregarGrafico();
    }
  }

  ngOnDestroy(): void {
    this.destruirChart();
  }

  private normalizarResposta(resp: GraficoPizzaProdutoResponse): GraficoPizzaProdutoResponse {
    const fatias = Array.isArray(resp?.fatias) ? resp.fatias : [];

    const labels = Array.isArray(resp?.labels) && resp.labels.length > 0
      ? resp.labels
      : fatias.map(f => f.nomeItem);

    const valores = Array.isArray(resp?.valores) && resp.valores.length > 0
      ? resp.valores
      : fatias.map(f => Number(f.porcentagem ?? 0));

    const cores = Array.isArray(resp?.cores) && resp.cores.length > 0
      ? resp.cores
      : fatias.map(f => f.cor || '#36A2EB');

    return {
      ...resp,
      fatias,
      labels,
      valores,
      cores,
    };
  }

  private carregarGrafico(): void {
    if (this.codigoProduto == null) return;

    this.carregando = true;
    this.erro = null;
    this.dados = null;
    this.destruirChart();

    this.http.get<GraficoPizzaProdutoResponse>(`${this.urlGraficoPizza}/${this.codigoProduto}/grafico-pizza`).subscribe({
      next: (resp) => {
        const dadosNormalizados = this.normalizarResposta(resp);
        this.dados = dadosNormalizados;
        this.carregando = false;

        if (!dadosNormalizados.valores.length) {
          this.erro = 'Este produto não possui itens para gerar o gráfico.';
          this.cdr.detectChanges();
          return;
        }

        this.cdr.detectChanges();
        this.construirChart(dadosNormalizados);
      },
      error: () => {
        this.carregando = false;
        this.erro = 'Não foi possível carregar o gráfico de composição do produto.';
        this.cdr.detectChanges();
      },
    });
  }

  private construirChart(resp: GraficoPizzaProdutoResponse): void {
    const ctx = this.chartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.destruirChart();

    const data: ChartData<'pie'> = {
      labels: resp.labels,
      datasets: [
        {
          data: resp.valores,
          backgroundColor: resp.cores,
          borderColor: '#ffffff',
          borderWidth: 1,
        },
      ],
    };

    const options: ChartOptions<'pie'> = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const fatia = resp.fatias?.[ctx.dataIndex];
              if (!fatia) {
                return `${ctx.label ?? 'Item'}: ${ctx.parsed ?? 0}%`;
              }
              return [
                `${fatia.porcentagemFormatada}`,
                `Item: ${fatia.valorItem}`,
                `Total: ${fatia.valorTotal}`,
              ];
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, {
      type: 'pie',
      data,
      options,
    });
  }

  private destruirChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
