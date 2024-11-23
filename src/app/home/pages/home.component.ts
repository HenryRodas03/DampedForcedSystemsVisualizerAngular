import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { HomeService } from '../services/home.service';
import { Chart, registerables } from 'chart.js';
import { evaluate } from 'mathjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorFormDialogComponent } from '../../error-form-dialog/error-form-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>; // Referencia al canvas
  readonly dialog = inject(MatDialog);

  constantsForm = new FormGroup({
    rlc: new FormControl(false, [Validators.required]),
    m: new FormControl('', [Validators.required]),
    k: new FormControl('', [Validators.required]),
    b: new FormControl('', [Validators.required]),
    c1: new FormControl('', [Validators.required]),
    c2: new FormControl('', [Validators.required]),
    ftType: new FormControl('', [Validators.required]),
    fT1: new FormControl(0),
    fT2: new FormControl(0),
  });

  sistemType = '';
  rlc = false;

  private chart!: Chart;

  constructor(private homeService: HomeService) {
    Chart.register(...registerables); // Registrar Chart.js
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Etiquetas para el eje X
        datasets: [
          {
            label: 'Función Y(t)',
            data: [], // Datos para la función
            borderColor: '#80808000',
            backgroundColor: '#80808000',
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#80808000',
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tiempo (t)',
              color: 'white',
            },
            ticks: {
              color: 'white', // Color de las etiquetas del eje X
            },
          },
          y: {
            title: {
              display: true,
              text: 'Y(t)',
              color: 'white',
            },
            ticks: {
              color: 'white', // Color de las etiquetas del eje X
            },
          },
        },
      },
    });
  }

  updateChart(data: { yt: string; vt: string; at: string }, clean?: boolean) {
    const mathFunctions = {
      yt: (t: number) => evaluate(data.yt, { t }),
      vt: (t: number) => evaluate(data.vt, { t }),
      at: (t: number) => evaluate(data.at, { t }),
    };

    // Generar valores para la gráfica
    const labels = Array.from({ length: 1000 }, (_, i) => i / 10); // Valores de t (0 a 10 en pasos de 0.1)
    const datasets1 = [
      {
        label: 'Y(t)',
        data: labels.map((t) => mathFunctions.yt(t)),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'V(t)',
        data: labels.map((t) => mathFunctions.vt(t)),
        borderColor: 'rgba(255, 183, 135, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'A(t)',
        data: labels.map((t) => mathFunctions.at(t)),
        borderColor: 'rgba(218, 107, 255, 1)',
        borderWidth: 2,
        fill: false,
      },
    ];
    const datasets2 = [
      {
        label: 'q(t)',
        data: labels.map((t) => mathFunctions.yt(t)),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'i(t)',
        data: labels.map((t) => mathFunctions.vt(t)),
        borderColor: 'rgba(255, 183, 135, 1)',
        borderWidth: 2,
        fill: false,
      },
    ];

    let datasets = this.rlc ? datasets2 : datasets1;

    // Verifica si chart y sus opciones están definidos
    if (this.chart?.options?.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = 'white'; // Color de las etiquetas de la leyenda
    }

    // Actualizar el gráfico
    clean ? (this.chart.data.labels = []) : (this.chart.data.labels = labels);
    clean
      ? (this.chart.data.datasets = [])
      : (this.chart.data.datasets = datasets);
    this.chart.update();
  }

  onFtTypeChange(ev: any) {
    if (ev.value != 2 && ev.value) {
      this.constantsForm.patchValue({ fT1: 0, fT2: 0 });
    }
  }

  onSistemTypeChange(ev: any) {
    this.rlc = ev.value;
  }

  sendData() {
    if (this.constantsForm.invalid) {
      this.dialog.open(ErrorFormDialogComponent);
    } else {
      this.homeService
        .calculate(this.constantsForm.value)
        .subscribe((data: any) => {
          if (data['status'] == 'OK') {
            const functions = {
              yt: data['data']['yt'],
              vt: data['data']['vt'],
              at: data['data']['at'],
            };
            this.sistemType = data['data']['sistemtype'];
            this.updateChart(functions);
          }
        });
    }
  }

  clean() {
    const functions = {
      yt: '',
      vt: '',
      at: '',
    };
    this.sistemType = '';
    this.updateChart(functions, true);
    this.constantsForm.reset({ rlc: false, fT1: 0, fT2: 0 });
  }
}
