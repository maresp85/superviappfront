import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { environment } from 'src/environments/environment';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { OrdenesModel } from '../../../models/ordenes.model';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexStroke,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: any,
  title: ApexTitleSubtitle;
  colors: string[],
  plotOptions: any,
  xaxis: ApexXAxis,
  stroke: ApexStroke,
};

@Component({
  selector: 'app-listar-ordenes',
  templateUrl: './listar-ordenes.component.html',
  styleUrls: []
})
export class ListarOrdenesComponent implements OnInit {

  title: string = "Ordenes de Trabajo";
  breadcrumbtitle: string = "Gestión";
  breadcrumbtitle2: string = "Ordenes";
  empresa: any = this._usService.leerEmpresaUsuario();
  firmaImg: any;
  firmaImgUsuario: any;
  imagenesOrdenes: any = [];
  checkOrdenes: any = [];
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  ordenes: OrdenesModel = new OrdenesModel();
  obra: any = [];
  p: number = 1;
  role: any;
  trabajo: any = [];
  usuarios: any = [];
  urluploadimgordenes: any = environment.url + environment.uploadimgordenes_pdf;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  uploadImgFirmaUsuario: any = environment.url + environment.uploadImgFirmaUsuario;

  showChart: boolean = false;
  series: any = [0, 0, 0];
  labels: any = ['No Cumplidas', 'Cumplidas', 'Pendientes'];
  
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private router: Router,
    private _orService: OrdenesService,
    public _usService: UsuarioService,
    private _conService: ConfiguracionService,
  ) {
    this.role = this._usService.leerRoleUsuario();
    if (
      this.role === '' ||
      this._usService.leerEmailUsuario() === '' ||
      this._usService.leerEmpresaUsuario() === '' ||
      this._usService.leerIDUsuario() === ''
    ) {
      this.router.navigate(['/login']);
    }

  }

  ngOnInit(): void {
    this.getOrdenes();
  }

   // Obtiene orden de trabajo
  getOrdenes() {
    this.loading = true;    
    let usuarioId: any = this._usService.leerIDUsuario();

    this._usService
      .getUsuarioEmpresa(this.empresa)
      .subscribe((res: any) => {
        this.usuarios = res['usuarioDB'];

        this._conService
          .getTrabajoEmpresaFiltroBitacora(this.empresa, false)
          .subscribe((res: any) => {
              this.trabajo = res['trabajoDB'];

              this._conService
                  .getObraListarUsuario(usuarioId)
                  .subscribe((res: any) => {
                    this.obra = res['obraDB'];
                  }, (err: any) => {
                    this.error(err);
                  });

          }, (err: any) => {
            this.error(err);
          });
      }, (err: any) => {
        this.error(err);
      });

    if (this.role === 'SUPERVISOR SSTA' || this.role === 'SUPERVISOR LEGAL LABORAL') {
      this._orService
        .getOrdenesBitacoraUsuario(usuarioId, this.empresa, false)
        .subscribe((res: any) => {
          this.listado = res['ordentrabajoDB'];
          this.loading = false;
        }, error => {
          this.error(error);
        });
    } else {
      this._orService
        .getOrdenesBitacoraTodas(this.empresa, false)
        .subscribe((res: any) => {
          this.listado = res['ordentrabajoDB'];
          this.loading = false;
        }, (err: any) => {
          this.error(err);
        });
    }
  }

  // Submit para la búsqueda de ordenes
  onSearch(form: NgForm) {
    if (form.invalid) { return; }

    let usuarioId: any = this._usService.leerIDUsuario();
    if (this.ordenes.usuario) {
      usuarioId = this.ordenes.usuario;
    }

    this.loading = true;
    this.loadingButton = true;
    this._orService
        .buscarOrdenes(
          this.ordenes.id,
          usuarioId,
          this.ordenes.estado,
          this.ordenes.trabajo,
          this.ordenes.obra,
          this.ordenes.fecha,
          this.ordenes.fechaf
        )
        .subscribe((res: any) => {
          this.loading= false;
          this.loadingButton = false;
          this.listado = res['ordentrabajoDB'];
          this.ordenes.id = null;
          this.ordenes.usuario = null;
          this.ordenes.estado = null;
          this.ordenes.idviga = null;
          this.ordenes.trabajo = null;
          this.ordenes.obra = null;
          this.ordenes.fecha = null;
        }, (err: any) => {
          this.errorSearch();
        });
  }

  cerrarOrdenTrabajo(_id: any) {    
    Swal.fire({
      text: '¿Está seguro de cerrar esta orden de trabajo permanentemente?',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.value == true) {
        this.loading = true;
        this._orService
          .cerrarOrdenTrabajo(_id)
          .subscribe((res: any) => {
            this.loading = false;
            if (res['ok'] == true) {
              this.getOrdenes();
              Swal.fire({
                text: 'Orden de Trabajo Cerrada',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then((result) => { });
            }
          }, (err: any) => {           
            this.error(err);
          });
      }
    });
  }

  deleteOrdenTrabajo(_id: any) {    
    Swal.fire({
      text: '¿Está seguro que desea eliminar esta orden de trabajo permanentemente?',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.value == true) {
        this.loading = true;
        this._orService
          .deleteOrdenTrabajo(_id)
          .subscribe((res: any) => {
            this.loading = false;
            if (res['ok'] == true) {
              this.getOrdenes();
              Swal.fire({
                text: 'Orden de Trabajo Eliminada',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then((result) => { });
            }
          }, (err: any) => {
            this.error(err);
          });
      }
    });
  }

  generatePdf(_id: any) {
    this.loading = true;
    this.getBase64ImageFromURL('assets/logo_pdf.png').then((base64data) => {
      this.logo = base64data;
    });
    this._orService
        .getUnaOrden(_id)
        .subscribe((res: any) => {

          let ordentrabajo: any = res.ordentrabajoDB[0];

          try {
            this
              .getBase64ImageFromURL(this.urluploadfirmas+ordentrabajo.usuario.imgfirma)
              .then((base64data) => {
              
               this.firmaImg = base64data;

                this.getBase64ImageFromURL(this.uploadImgFirmaUsuario+ordentrabajo.firmaUsuario)
                  .then((base64data) => {
                    this.firmaImgUsuario = base64data;              
                });

                this._orService
                  .getOrdenesTipo(_id)
                  .subscribe((res: any) => {
    
                    let ordentipotrabajo: any = res['ordentipotrabajoDB'];
    
                    this._orService
                      .getOrdenesActividadesTodas(_id)
                      .subscribe((res: any) => {
    
                        let ordenactividad: any = res['ordenactividadDB'];
                   
                        this._orService
                            .getItemsActividadTodos()
                            .subscribe((res: any) => {

                              let itemactividad: any = res['itemactividadDB'];
                              this._orService
                                .getImgOrdenTrabajo(_id)
                                .subscribe((res: any) => {
    
                                  let imgOrdenActividadDB = res['imgordenactividadDB'];
    
                                  this._orService
                                      .getCheckOrdenActividadTrabajo(ordentrabajo._id)
                                      .subscribe((res: any) => {
                                        this.checkOrdenes = res['checkOrdenActividadDB'];
    
                                        this.getImgOrdenTrabajoBase64(imgOrdenActividadDB)
                                            .then(() => {                                              
                                              this.getDocument(
                                                ordentrabajo,
                                                ordentipotrabajo,
                                                ordenactividad,
                                                itemactividad
                                              );
                                              this.loading = false;    
                                        }, (err: any) => {
                                          this.error(err);
                                        });
    
                                      });    
                                });
                            });
    
                    }, (err: any) => {
                      this.error(err);
                    });
    
                }, (err: any) => {
                  this.error(err);
                });
            });
          } catch {}          

         

        }, (err: any) => {
          this.error(err);
        });
  }

  getImgOrdenTrabajoBase64(imgordenactividad: any) {

    return new Promise((resolve, reject) => {
      this.imagenesOrdenes = [];
      let cantimags: number = 1;
      let splitted: any;

      imgordenactividad.forEach((item: any, i: any) => {

        item.files.forEach((img: any, n: any) => {
          cantimags += n;
          if (img.originalname) {
            let imgorden = this.urluploadimgordenes + img.originalname;
            this.getBase64ImageFromURL(imgorden).then((base64data) => {
              splitted = img.originalname.split("=", img.originalname.length);
              this.imagenesOrdenes.push(
                { 
                  ordenactividad: item.ordenactividad,
                  image: base64data,
                  tipo: splitted[0] 
                }
              );

              if (imgordenactividad.length-1 == i && item.files.length-1 == n) {
                setTimeout(function () {
                  resolve(true)
                }, 400);
              }
            });
          }
        });
        let timeout = cantimags * 2500;
        setTimeout(function () {
          resolve(true)
        }, timeout);
      });
    });
  }

  getDocument(ordentrabajo: any, ordentipotrabajo: any, ordenactividad: any, itemactividad: any) {
    
    let estado: any = ordentrabajo.estado;
    if (ordentrabajo.trabajo.bitacora) {
      if (ordentrabajo.estado == 'NO CUMPLE') {
        estado = 'ABIERTA';
      } else if (ordentrabajo.estado == 'CUMPLE') {       
        estado = 'CERRADA';
      }  
    }

    let fecha = new Date(ordentrabajo.fecha);
    let usuariolegaliza: any;
    let color: string;
    let content: any[] = [
      {
        table: {
          headerRows: 1,
          widths: [180, '*', '*'],
          body: [
            [
              { image: this.logo, width: 90, alignment: 'center' },
              { text: 'REPORTE ORDEN DE TRABAJO', alignment: 'center', colSpan: 2, fontSize: 11, bold: true },
              ''
            ],
            [
              { text: 'N° ORDEN: ' + ordentrabajo.id, alignment: 'center', fontSize: 10, bold: true },
              { text: (ordentrabajo.trabajo.nombre).toUpperCase(), alignment: 'center', colSpan: 2, fontSize: 10, bold: true },              
            ],
            [
              { text: (ordentrabajo.obra.nombre).toUpperCase(), alignment: 'center', fontSize: 10, bold: true },
              { text: fecha.toLocaleString(), alignment: 'center', fontSize: 10, bold: true },
              { text: 'ESTADO: ' + estado, alignment: 'center', fontSize: 10, bold: true }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      }
    ];

    let extraFieldsData: any = [];
    ordentrabajo.extraFieldsData.forEach((element: any) => {
      extraFieldsData.push([
        { text: element.field, fontSize: 11, bold: true },
        { text: element.value, fontSize: 11 }
      ]);
    });

    if (extraFieldsData.length > 0) {
      content.push({ table: {
        widths: ['*'],
        headerRows: 1,
          body: [
            [
              {
                alignment: 'center',
                bold: true,
                fillColor: '#fff',
                fontSize: 12,
                text: 'DATOS ADICIONALES DE LA ORDEN',
              }
            ]
          ]
      }, margin: [0, 20, 0, 0], layout: 'noBorders'});

      content.push({ 
        table: {
          widths: [180, '*'], 
          headerRows: 1,
          body: extraFieldsData 
        }, 
        margin: [0, 10, 0, 10]
      });
    }

    content.push({ table: {
      widths: ['*'],
      headerRows: 1,
        body: [
          [
            {
              alignment: 'center',
              bold: true,
              fillColor: '#fff',
              fontSize: 12,
              text: 'RESUMEN DE ACTIVIDADES',
            }
          ]
        ]
    }, margin: [0, 20, 0, 0], layout: 'noBorders'});

    let seriesCumple: any = [];
    let seriesNoCumple: any = [];

    //calificación barras
    let actividadNoCumple: number = 0;
    let actividadCumple: number = 0;
    let actividadPendiente: number = 0;

    ordentipotrabajo.forEach((element: any) => {
      
      let actividadSeriesNoCumple: number = 0;
      let actividadSeriesCumple: number = 0;
      
      let estado = element.estado;
      if (ordentrabajo.trabajo.bitacora) {
        if (ordentrabajo.estado === 'NO CUMPLE') {
          estado = 'ABIERTA';
        } else if (ordentrabajo.estado === 'CUMPLE') {       
          estado = 'CERRADA';
        }  
      }

      content.push({table: {
        widths: ['*'],
        headerRows: 1,
          body: [
            [
             {
               text: (element.tipotrabajo.nombre).toUpperCase() + ' - ' + estado,
               fillColor: '#ececec',
               fontSize: 11,
               bold: true
              }
            ]
          ]
      }, margin: [0, 10, 0, 10], layout: 'noBorders'});
 
      ordenactividad.forEach((elementact: any, idx: any) => {

        if (elementact.ordentipotrabajo == element._id && elementact.actividad) {
          
          if (idx == 0) {
            content.push({table: {
              widths: [300, 120, '*'],
              headerRows: 1,
                body: [
                  [
                    { text: 'ACTIVIDAD', alignment: 'center', fontSize: 10, bold: true },
                    { text: 'LEGALIZACIÓN', alignment: 'center', fontSize: 10, bold: true },
                    { text: 'ESTADO', alignment: 'center', fontSize: 10, bold: true }
                  ],
                  ['', '', '']
                ]
            }, margin: [0, 0, 0, 0], layout: 'headerLineOnly'});
          }

          try {
            usuariolegaliza = elementact.usuariolegaliza.nombre;
          } catch (error) {
            usuariolegaliza = '';
          }
          
          let estadoAct = elementact.estado;
          let fechalegaliza = new Date(elementact.fechalegaliza).toLocaleString();

          if (elementact.estado === 'NO CUMPLE') {
            actividadNoCumple += elementact.calificacion;
            actividadSeriesNoCumple += elementact.calificacion;
            this.series[0] += 1;
            color = 'red';            
          } else if (elementact.estado === 'CUMPLE') {
            actividadCumple += elementact.calificacion;
            actividadSeriesCumple += elementact.calificacion;
            this.series[1] += 1;
            color = 'green';           
          } else {
            actividadPendiente += elementact.calificacion;
            this.series[2] += elementact.calificacion;
            color = 'blue';
            fechalegaliza = '';
          }

          content.push({table: {
            widths: [300, 120, '*'],
            headerRows: 1,
              body: [
                [
                 { text: elementact.actividad.nombre + ' (cal.' + elementact.calificacion + ')', alignment: 'justify', fontSize: 10 },
                 { text: fechalegaliza, fontSize: 10, alignment: 'center' },
                 { text: estadoAct, fontSize: 9, bold: true, alignment: 'center', color: color }
                ]
              ]
          }, layout: 'lightHorizontalLines', margin: [0, 10, 0, 0]});
 
        }

      }); //orden actividad

      seriesCumple.push(actividadSeriesCumple);
      seriesNoCumple.push(actividadSeriesNoCumple);

    });

    content.push({ text: '', pageBreak: 'before' });

    if (ordentrabajo.trabajo.gradeChart === 'bar') {
      const series: any = [
        {
          name: 'CUMPLE',
          data: seriesCumple,
        },
        {
          name: 'NO CUMPLE',
          data: seriesNoCumple,
        }
      ];

      this.chartOptions = {
        series: series,        
        colors : ['#0292f7', '#fdae35'],
        chart: {
          width: 440,
          type: 'bar',
          animations: {
            enabled: false,
          },
        },           
        plotOptions: {
          bar: {
            customScale: 0.90
          }
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['transparent']
        },  
        legend: {
          show: true,
          showForSingleSeries: true,
          position: 'top',
          horizontalAlign: 'center', 
          floating: true,
          fontSize: '11px',
          fontFamily: 'Helvetica, Arial',         
          offsetX: 0,
          offsetY: 0,
        }
      };
    } else {
      this.chartOptions = {
        series: this.series,        
        colors : ['#0292f7', '#fdae35', '#dddddd'],
        chart: {
          width: 380,
          type: 'pie',
          animations: {
            enabled: false,
          },        
        },
        title: {
          text: 'Ejecución de Actividades',
        },
        labels: this.labels,
        plotOptions: {
          pie: {
            customScale: 0.90
          }
        },
        legend: {
          show: true,
          showForSingleSeries: true,
          position: 'top',
          horizontalAlign: 'center', 
          floating: true,
          fontSize: '11px',
          fontFamily: 'Helvetica, Arial',         
          offsetX: 0,
          offsetY: 0,
        }
      };
    }

    this.showChart = true;

    setTimeout(async () => {

      this.getBase64ImagePie().then((pieImage: any) => {

        content.push({ table: {
          widths: ['*'],
          headerRows: 1,
            body: [
              [
                {
                  alignment: 'center',
                  bold: true,
                  fillColor: '#fff',
                  fontSize: 12,
                  text: (ordentrabajo.trabajo.nombre).toUpperCase(),
                }
              ]
            ]
        }, margin: [0, 40, 0, 10], layout: 'noBorders'});

        content.push(
          { image: pieImage, alignment: 'center', margin: [0, 20, 0, 0] },
        );

        if (ordentrabajo.trabajo.gradeChart === 'bar') {
          let columsWidthTableSummary: any = [];
          let columsTextTableSummary: any = [];
          ordentipotrabajo.forEach((item: any) => {
            columsWidthTableSummary.push('*');
            columsTextTableSummary.push(
              { text: item.tipotrabajo.nombre.toUpperCase(), fontSize: 7.5, alignment: 'center', color: '#4c4c4c' },    
            );
          });

          content.push({ table: {
            widths: columsWidthTableSummary,        
              body: [
                columsTextTableSummary
              ]
          }, margin: [0, 0, 40, 0], layout: 'noBorders'}); //left, top, right, bottom

          columsWidthTableSummary = [];
          columsTextTableSummary  = [];
          ordentipotrabajo.forEach((item: any, idx: number) => {
            columsWidthTableSummary.push('*');
            columsTextTableSummary.push(
              { text: 'CUMPLE: ' + seriesCumple[idx], fontSize: 7, alignment: 'center', color: '#787878' },    
            );
          });

          content.push({ table: {
            widths: columsWidthTableSummary,        
              body: [
                columsTextTableSummary
              ]
          }, margin: [0, 0, 40, 10], layout: 'noBorders'}); //left, top, right, bottom

          content.push({ table: {
            widths: ['*'],
            headerRows: 1,
              body: [
                [
                  {
                    alignment: 'center',
                    bold: true,
                    fillColor: '#fff',
                    fontSize: 12,
                    text: 'CÁLCULO TRABAJO ' + (ordentrabajo.trabajo.nombre).toUpperCase(),
                  }
                ]
              ]
          }, margin: [0, 40, 0, 10], layout: 'noBorders'});       
        }

        let totalActividades = actividadCumple + actividadNoCumple + actividadPendiente;
        let totalActividadesCumpleNoCumple = actividadCumple + actividadNoCumple;
        let calificacion = ((actividadCumple/totalActividadesCumpleNoCumple)*100).toFixed(2);

        content.push({
          style: 'tableHeader',
          table: {
            widths: ['*', '*', '*', 120, 120],
            body: [
              [
                { text: 'CUMPLE', fontSize: 10, alignment: 'center', fillColor: '#efefef', bold: true, },
                { text: 'NO CUMPLE', fontSize: 10, alignment: 'center', fillColor: '#efefef', bold: true, },
                { text: 'TOTAL ACTIVIDADES', fontSize: 10, alignment: 'center', fillColor: '#efefef', bold: true, },
                { text: 'TOTAL ACTIVIDADES (cumple + no cumple)', fontSize: 10, alignment: 'center',  fillColor: '#efefef', bold: true, },
                { text: 'CALIFICACIÓN (cumple / total actividades) * 100%', fontSize: 10, alignment: 'center', fillColor: '#efefef', bold: true, },                
              ],
              [
                { text: actividadCumple, fontSize: 10, alignment: 'center', },
                { text: actividadNoCumple, fontSize: 10, alignment: 'center', },
                { text: totalActividades, fontSize: 10, alignment: 'center', },
                { text: totalActividadesCumpleNoCumple, fontSize: 10, alignment: 'center', },
                { text: calificacion, fontSize: 10, alignment: 'center', },
              ],
            ]
          }, margin: [0, 10, 0, 10]
        });
              
        content.push({ text: '', pageBreak: 'before' });

        // Detalle de las actividades
        content.push({ table: {
          widths: ['*'],
          headerRows: 1,
            body: [
              [
                {
                  alignment: 'center',
                  bold: true,
                  fillColor: '#fff',
                  fontSize: 12,
                  text: 'ACTIVIDADES',
                }
              ]
            ]
        }, margin: [0, 40, 0, 10], layout: 'noBorders'});

        ordentipotrabajo.forEach((element: any) => {

          let estado = element.estado;

          content.push({table: {
            widths: ['*'],
            headerRows: 1,
              body: [
                [
                  {
                    text: (element.tipotrabajo.nombre).toUpperCase() + ' - ' + estado,
                    fillColor: '#ececec',
                    fontSize: 11,
                    bold: true
                  }
                ]
              ]
          }, margin: [0, 10, 0, 10], layout: 'noBorders'});
    
          ordenactividad.forEach((elementact: any) => {

            if (elementact.ordentipotrabajo === element._id && elementact.actividad) {

              content.push({table: {
                widths: [300, 120, '*'],
                headerRows: 1,
                  body: [
                    [
                      { text: 'ACTIVIDAD', alignment: 'center', fontSize: 10, bold: true },
                      { text: 'LEGALIZACIÓN', alignment: 'center', fontSize: 10, bold: true },
                      { text: 'ESTADO', alignment: 'center', fontSize: 10, bold: true }
                    ],
                    ['', '', '']
                  ]
              }, margin: [0, 0, 0, 0], layout: 'headerLineOnly'});

              try {
                usuariolegaliza = elementact.usuariolegaliza.nombre;
              } catch (error) {
                usuariolegaliza = '';
              }

              let estadoAct = elementact.estado;
              let fechalegaliza = new Date(elementact.fechalegaliza).toLocaleString();

              if (elementact.estado === 'NO CUMPLE') {
                color = 'red';
                if (ordentrabajo.trabajo.bitacora) estadoAct = 'ABIERTA';
              } else if (elementact.estado === 'CUMPLE') {
                color = 'green';
                if (ordentrabajo.trabajo.bitacora) estadoAct = 'CERRADA';
              } else {
                color = 'blue';
                fechalegaliza = '';
              }

              content.push({table: {
                widths: [300, 120, '*'],
                headerRows: 1,
                  body: [
                    [
                    { text: elementact.actividad.nombre, alignment: 'justify', fontSize: 10 },
                    { text: fechalegaliza, fontSize: 10, alignment: 'center' },
                    { text: estadoAct, fontSize: 9, bold: true, alignment: 'center', color: color }
                    ]
                  ]
              }, layout: 'lightHorizontalLines', margin: [0, 10, 0, 0]});

              let estado = elementact.estado === 'CUMPLE' ? 1 : 0;

              itemactividad.forEach((item: any) => {

                if (item.actividad == elementact.actividad._id && item.cumple == estado) {

                  if (item.tipo === 'ETIQUETA') {

                    content.push({ ul: [
                      { text: item.etiqueta, fontSize: 10, bold: true, margin: [0, 15, 0, 0] } //
                    ]});

                  } else if (item.tipo === 'EVIDENCIAS') {                      

                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id === img.ordenactividad && img.tipo === 'EVIDENCIAS') {
                        value.push({ image: img.image, width: 126 });
                      }
                    }

                    if (value.length > 0) {
                      content.push({ ul: [
                        ({ text: item.etiqueta + ':', fontSize: 10, bold: true, margin: [0, 15, 0, 0] })
                      ]});                 
                    }

                    content.push({table: {
                      headerRows: 1,
                        body: [
                          value
                        ]
                    }, layout: 'noBorders', margin: [3, 5, 0, 5]});

                  } else if (item.tipo === 'FOTO BITÁCORA') {
           
                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo === 'FOTOBITACORA') {
                        value.push({ image: img.image, width: 126 });
                      }
                    }

                    if (value.length > 0) {
                      content.push({ ul: [
                        ({ text: item.etiqueta + ':', fontSize: 10, bold: true, margin: [0, 15, 0, 0] })
                      ]});                 
                    }

                    content.push({table: {
                      headerRows: 1,
                        body: [
                          value
                        ]
                    }, layout: 'noBorders', margin: [3, 5, 0, 5]});

                  } 

                }

              });  //itemactividad
                   
              for (let item of this.checkOrdenes) {
                if (elementact._id === item.ordenactividad) {
                  let value = [];
                  value.push({ ul: [
                    ({ text: item.etiqueta, fontSize: 10, bold: true })
                  ]});
                  if (item.fechaMejora) {
                    value.push({ text: '- Fecha de mejora: ' + item.fechaMejora, fontSize: 10, bold: false });
                  }
                  content.push({table: {
                    headerRows: 1,
                      body: [
                        value
                      ]
                  }, layout: 'noBorders', margin: [0, 10, 0, 0]});
                }
              }  
        
              if (elementact.observacion != 'undefined' && elementact.observacion != '' && elementact.observacion != null) {
                content.push({ ul: [
                  ({ text: 'Observaciones: ', fontSize: 10, bold: true, margin: [0, 10, 0, 0] })  //left, top, right, bottom
                ]});
                content.push({ text: elementact.observacion, fontSize: 10, margin: [10, 5, 0, 0] });
              }

              if (elementact.fechaMejora != 'undefined' && elementact.fechaMejora != '' && elementact.fechaMejora != null && elementact.fechaMejora != 'true') {
                content.push({ ul: [
                  ({ text: 'Fecha proyectada de Mejora: ', fontSize: 10, bold: true, margin: [0, 5, 0, 0] })
                ]});
                content.push({ text: elementact.fechaMejora, fontSize: 10, margin: [10, 5, 0, 0] });
              }
              //línea en blanco
              content.push({ text: ' ', margin: [0, 10, 0, 0] });

            }

          }); //orden actividad

        });

        if (this.firmaImgUsuario) {
          content.push({ text: '', pageBreak: 'before' });     

          content.push({table: {
            widths: ['*'],
            headerRows: 1,
              body: [
                [
                {
                  text: 'FIRMA DIGITAL USUARIO',
                  fillColor: '#ececec',
                  fontSize: 11,
                  bold: true
                  }
                ]
              ]
          }, margin: [0, 10, 0, 0], layout: 'noBorders'});

          content.push({ image: this.firmaImgUsuario, width: 140, margin: [0, 0, 0, 0] });
        }

        //línea en blanco
        content.push({ text: ' ', margin: [0, 10, 0, 0] });
      
        content.push({ image: this.firmaImg, width: 140, margin: [0, 100, 0, 0] });
        content.push({ text: "_______________________________________" });
        content.push({ text: ordentrabajo.usuario.nombre });
        content.push({ text: (ordentrabajo.usuario.role).toUpperCase(), fontSize: 10 });
        content.push({ text: fecha.toLocaleString(), fontSize: 8 });

      });

      setTimeout(() => {
        let docDefinition = {
          content: content,
          styles: {
            filledText: {
              fontSize: 18,
              bold: true,
              fillColor: '#ddd'
            },
            name: {
              fontSize: 16,
              bold: true
            }
          }
        }
        pdfMake.createPdf(docDefinition).open();
      }, 1000);

    }, 1400); 
    
    return content;

  }

  getBase64ImageFromURL(url: any) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  async showPdfButton() {

    const series: any = [
      {
        name: 'CUMPLE',
        data: [44, 55, 41, 64, 22, 43, 21],
      },
      {
        name: 'NO CUMPLE',
        data: [53, 32, 33, 52, 13, 44, 32],
      }
    ];

    this.chartOptions = {
      series: series,        
      colors : ['#0292f7', '#fdae35'],
      chart: {
        width: 380,
        type: 'bar',
        animations: {
          enabled: false,
        },
      },           
      plotOptions: {
        bar: {
          customScale: 0.80
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",     
        ]
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'center', 
        floating: true,
        fontSize: '11px',
        fontFamily: 'Helvetica, Arial',         
        offsetX: 0,
        offsetY: 0,
      }
    };

    this.showChart = true;

    setTimeout(async () => {
      let docDefinition: any = {
        content: [
          {
            text: 'PDF Generated with Image from external URL',
            fontSize: 20,
          },
          {
            image: await this.getBase64ImagePie(), alignment: 'center', margin: [0, 5, 0, 0]
          },
        ],
      };
      pdfMake.createPdf(docDefinition).open();
    }, 1000);
    
  }

  getBase64Image(img: HTMLImageElement) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: any = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  getBase64ImagePie() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement: SVGGraphicsElement = document.querySelector('.apexcharts-svg');
      const imageBlobURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgElement.outerHTML);      
      
      img.onload = () => {
        const scaleFactor = 1; // Ajustar según sea necesario
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext('2d');
        
        // Ajustar la calidad del dibujado
        ctx.imageSmoothingQuality = 'high';
        
        // Escalar y dibujar la imagen SVG en el canvas
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(img, 0, 0);
        
        // Obtener la imagen en formato base64 con mejor calidad
        const dataURL = canvas.toDataURL('image/png', 1.0); // Calidad al 100%
        resolve(dataURL);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = imageBlobURL;
    });
  }
  
  error(error: any) {
    this.loading = false;
    this.loadingButton = false;
    if (error.error.err.message === 'Token no válido') {
      this.router.navigate(['/login']);
    } else {
      Swal.fire({
        text: 'Ocurrió un error, intente de nuevo',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
    }
  }

  errorSearch() {
    this.loading = false;
    this.loadingButton = false;
    Swal.fire({
      text: 'La búsqueda no arrojó resultados',
      icon: 'info',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
