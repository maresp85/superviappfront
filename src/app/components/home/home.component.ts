import { Component, ViewChild, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent implements OnInit {

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  loading: boolean = false;
  estado1: any;
  estado2: any;
  estado3: any;
  estado4: any;

  constructor(
    private router: Router,
    private _orService: OrdenesService,
    private _usService: UsuarioService
  ) { 

    if (
      this._usService.leerRoleUsuario() === '' ||
      this._usService.leerEmailUsuario() === '' ||
      this._usService.leerEmpresaUsuario() === '' ||
      this._usService.leerIDUsuario() === ''
    ) {
      this.router.navigate(['/login']);
    }

    this.chartOptions = {
      series: [44, 55, 13, 43, 22],
      chart: {
        width: 380,
        type: "pie"
      },
      labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
              
  }

  getBase64Image() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement: SVGGraphicsElement =
        document.querySelector('.apexcharts-svg');
      const imageBlobURL =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(svgElement.outerHTML);
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imageBlobURL;
    });
  }

  async showPdf() {
    let docDefinition: any = {
      content: [
        {
          text: 'PDF Generated with Image from external URL',
          fontSize: 20,
        },
        {
          image: await this.getBase64Image(),
        },
      ],
    };
    pdfMake.createPdf(docDefinition).open();
  }

  ngOnInit() {
    this.loading = true;
    let empresa: any = this._usService.leerEmpresaUsuario();
    this._orService
        .getOrdenesConteoEstado(empresa)
        .subscribe((res: any) => {  
          this.loading = false;           
          this.estado1 = res.conteo[0];             
          this.estado2 = res.conteo[1];             
          this.estado3 = res.conteo[2];             
          this.estado4 = res.conteo[3];             
        }, error => { 
          this.loading = false;                     
          this.errorToken(error);
        }); 
  }

  errorToken(error: any) {
    if (error.error.err.message == "Token no válido") {
      this.router.navigate(["/login"]);
    } 
  }

}