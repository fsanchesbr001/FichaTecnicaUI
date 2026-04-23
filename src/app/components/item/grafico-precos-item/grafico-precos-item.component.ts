import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export interface GraficoPrecoResponse {
  titulo: string;
  nomeItem: string;
  labels: string[];
  valores: number[];
  valoresFormatados: string[];
  variacoes: string[];
  variacoesMonetarias: string[];
}

@Component({
  selector: 'app-grafico-precos-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      <h4 class="grafico-titulo" [style.display]="dados ? 'block' : 'none'">{{ dados?.titulo }}</h4>

      <!-- canvas sempre presente no DOM; exibido só quando há dados -->
      <canvas #chartCanvas
        [style.display]="dados && !carregando && !erro ? 'block' : 'none'">
      </canvas>

      <div *ngIf="carregando" class="grafico-loading">Carregando gráfico...</div>
      <div *ngIf="erro"       class="grafico-erro">{{ erro }}</div>
    </div>
  `,
  styles: [`
    .grafico-container {
      width: 100%;
      padding: 8px 0 4px 0;
    }
    .grafico-titulo {
      text-align: center;
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #333;
    }
    canvas {
      width: 100% !important;
      max-height: 260px;
    }
    .grafico-loading, .grafico-erro {
      text-align: center;
      padding: 12px;
      font-size: 13px;
      color: #888;
    }
    .grafico-erro { color: #c62828; }
  `]
})
export class GraficoPrecosItemComponent implements OnChanges, OnDestroy {

  @Input() itemCodigo: number | null = null;

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  dados: GraficoPrecoResponse | null = null;
  carregando = false;
  erro: string | null = null;

  private chart: Chart | null = null;

  private readonly urlGrafico = `${environment.API}ficha-tecnica/historico-itens/grafico-precos`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemCodigo'] && this.itemCodigo != null) {
      this.carregarGrafico();
    }
  }

  ngOnDestroy(): void {
    this.destruirChart();
  }

  private carregarGrafico(): void {
    this.carregando = true;
    this.erro = null;
    this.dados = null;
    this.destruirChart();

    this.http.get<GraficoPrecoResponse>(`${this.urlGrafico}/${this.itemCodigo}`).subscribe({
      next: (resp) => {
        this.dados = resp;
        this.carregando = false;
        this.cdr.detectChanges();          // garante que o canvas está visível
        this.construirChart(resp);
      },
      error: () => {
        this.carregando = false;
        this.erro = 'Não foi possível carregar o histórico de preços.';
        this.cdr.detectChanges();
      }
    });
  }

  private construirChart(resp: GraficoPrecoResponse): void {
    if (!this.chartCanvas?.nativeElement) return;
    this.destruirChart();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'line'> = {
      labels: resp.labels,
      datasets: [{
        label: resp.nomeItem,
        data: resp.valores,
        borderColor: '#1565C0',
        backgroundColor: 'rgba(21,101,192,0.08)',
        pointBackgroundColor: '#D32F2F',
        pointBorderColor: '#D32F2F',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.3,
      }]
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const val    = resp.valoresFormatados[i]   ?? '';
              const varPct = resp.variacoes[i]            ?? '—';
              const varMon = resp.variacoesMonetarias[i]  ?? '—';
              const extra  = varPct !== '—' ? ` | Var.: ${varPct} (${varMon})` : '';
              return `${val}${extra}`;
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Data' } },
        y: {
          title: { display: true, text: 'Valor (R$)' },
          ticks: {
            callback: (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`
          }
        }
      }
    };

    this.chart = new Chart(ctx, { type: 'line', data, options });
  }

  /** Retorna a imagem do gráfico em base64 para inclusão no PDF. */
  getChartImageBase64(): string | null {
    return this.chart?.toBase64Image() ?? null;
  }

  private destruirChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

