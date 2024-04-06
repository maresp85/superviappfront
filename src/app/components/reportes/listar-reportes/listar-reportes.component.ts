import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { OrdenesModel } from '../../../models/ordenes.model';
import { ReportesService } from 'src/app/services/reportes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
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
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: any,
  title: ApexTitleSubtitle;
  colors: string[],
  plotOptions: any,
};

@Component({
  selector: 'app-listar-reportes',
  templateUrl: './listar-reportes.component.html',
  styleUrls: []
})
export class ListarReportesComponent implements OnInit {

  title: string = "Reportes semanales";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Semanales";
  cantImages = 0;
  content: any = [];
  empresa: any = this._usService.leerEmpresaUsuario();
  imagenesOrdenes: any = [];
  imagenesReportes: any = [];
  checkOrdenes: any = [];
  listado: any = [];
  loading: boolean = false;
  loadingButton: boolean = false;
  logo: any;
  pie: any;
  obraNombre: any = [];
  ordenTrabajoDB: any = [];
  ordenActividadDB: any = [];
  ordenes: OrdenesModel = new OrdenesModel();
  p: number = 1;
  urluploadimgordenes: any = environment.url + environment.uploadimgordenes_pdf;
  urluploadimgreportes: any = environment.url + environment.uploadimgreportes;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  usuario: any;
  usuarios: any = [];

  showPortada: boolean = true;
  showDocument: boolean = true;

  showChart: boolean = false;
  series: any = [0, 0, 0];
  labels: any = ['No Cumplidas', 'Cumplidas', 'Pendientes'];
  
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private router: Router,
    private _orService: OrdenesService,
    private _repoService: ReportesService,
    public _usService: UsuarioService
  ) {

    if (this._usService.leerRoleUsuario() == '' ||
        this._usService.leerEmailUsuario() == '' ||
        this._usService.leerEmpresaUsuario() == '' ||
        this._usService.leerIDUsuario() == '') {
          this.router.navigate(["/login"]);
    }

  }

  ngOnInit(): void {
    this.getReportes();
  }

   // Obtiene listado de Reportes
  getReportes() {
    this.loading = true;
    let role: any = this._usService.leerRoleUsuario();
    let usuario_id: any = this._usService.leerIDUsuario();

    if (role == 'INGENIERO') {
      this._repoService
          .getReportesUsuario(usuario_id)
          .subscribe((res: any) => {
            this.listado = res['reporteDB'];
            this.loading = false;
          }, error => {
            this.error(error);
          });
    } else {
      this._repoService
          .getReportes(this.empresa)
          .subscribe((res: any) => {
            this.listado = res['reporteDB'];
            this.loading = false;
            this._usService
              .getUsuarioEmpresa(this.empresa)
              .subscribe((res: any) => {
                this.usuarios = res['usuarioDB'];
              }, error => {
                this.error(error);
              });
          }, error => {
            this.error(error);
          });
    }
  }

  generatePdf(_id: any, usuario_id: any, fechaInicio:any, fechaFin: any, noCumple: boolean) {
    let pos: number = 0;
    this.showPortada = true;
    this.showDocument = true;
    this.series = [0, 0, 0];
    this.loading = true;
    this.content = [];
    this.imagenesOrdenes = [];
    this.imagenesReportes = [];
    this.obraNombre = [];
    this.ordenTrabajoDB = [];
    this.ordenActividadDB = [];

    this.getBase64ImageFromURL("assets/logo_st_bn.jpg")
        .then((base64data) => {
      this.logo = base64data;
    });

    this._usService
      .getUsuarioId(usuario_id)
      .subscribe((res: any) => {
        this.usuario = res['usuarioDB'];
        this.getBase64ImageFromURL(this.urluploadfirmas+this.usuario.imgfirma)
            .then((base64data) => {
          this.usuario.imgfirma = base64data;
        });

        this._orService
          .getOrdenUsuarioFechas(usuario_id, fechaInicio, fechaFin)
          .subscribe((res: any) => {
            
            this.ordenTrabajoDB = res.ordentrabajoDB;
            this.ordenTrabajoDB.forEach((ordentrabajo: any, i: number, array: any) => {
              
              if (ordentrabajo.estado == 'ASIGNADA') {
                return;
              }

              this._orService
                .getOrdenesTipo(ordentrabajo._id)
                .subscribe((res: any) => {
                  
                  let ordentipotrabajo: any = res['ordentipotrabajoDB'];
                  this._orService
                    .getOrdenesActividadesTodas(ordentrabajo._id)
                    .subscribe((res: any) => {
                      
                      let ordenactividad: any = res['ordenactividadDB'];
                      this.ordenActividadDB.push(ordenactividad);
                      if (!this.obraNombre.includes(ordentrabajo.obra.nombre)) {
                        this.obraNombre.push(ordentrabajo.obra.nombre);
                      }

                      this._orService
                        .getItemsActividadTodos()
                        .subscribe((res: any) => {
                          let itemactividad: any = res['itemactividadDB'];
                          this._orService
                            .getImgOrdenTrabajo(ordentrabajo._id)
                            .subscribe((res: any) => {

                            let imgOrdenActividadDB = res['imgordenactividadDB'];

                            this._orService
                                .getCheckOrdenActividadTrabajo(ordentrabajo._id)
                                .subscribe((res: any) => {
                                  this.checkOrdenes.push(res['checkOrdenActividadDB']);
                            
                                  this.getImgOrdenTrabajoBase64(imgOrdenActividadDB)
                                      .then(() => {
                                      
                                      this.getDocument(
                                        ordentrabajo,
                                        ordentipotrabajo,
                                        ordenactividad,
                                        itemactividad,
                                        fechaInicio,
                                        fechaFin,
                                        noCumple,
                                      );

                                      // Última orden, obtiene imágenes del reporte y genera PDF
                                      ++pos;
                                      if (pos == array.length) {
                                        this._repoService
                                          .getImgReporte(_id)
                                          .subscribe((res: any) => {
                                            
                                            if (res['imgreporteDB'].length != 0) {
                                              
                                              this.getImgReporteBase64(res['imgreporteDB'])
                                                  .then(() => { 
                                                                                              
                                                setTimeout(() => {
                                                  this.createPdf();
                                                }, this.cantImages * 155);

                                              }, (error: any) => {
                                                this.error(error);
                                              });

                                            } else {

                                              setTimeout(() => {
                                                this.createPdf();
                                              }, this.cantImages * 135);
                                            }

                                          }, (error: any) => {
                                            this.error(error);
                                          });
                                      }
                                  }, (error: any) => {
                                    this.error(error);
                                  });

                                });

                          });

                        });
                      }, (error: any) => {
                        this.error(error);
                      });
                  }, (error: any) => {
                    this.error(error);
                  });
                }, (error: any) => {
                  this.error(error);
                });
          });
      }, (error: any) => {
        this.error(error);
      });
  }

  getDocument = (
    ordentrabajo: any,
    ordentipotrabajo: any,
    ordenactividad: any,
    itemactividad: any,
    fechaInicio: any,
    fechaFin: any,
    noCumple: boolean
  ) => {

    let fecha = new Date(ordentrabajo.fecha);
    let usuariolegaliza: string;
    let color: string;
    this.series = [0, 0, 0];

    if (this.showPortada) {

      this.showPortada = false;  

      this.content.push(
        {
          table: {
            widths: ['*'],
            headerRows: 1,
              body: [
                [
                  { image: this.logo, width: 90 }
                ]
              ]
          }, margin: [0, 0, 0, 20], layout: 'noBorders'
        }
      );

      fechaInicio = fechaInicio.split('T')[0];
      fechaFin = new Date(fechaFin);
      const offset = fechaFin.getTimezoneOffset();
      fechaFin = new Date(fechaFin.getTime() - (offset*60*1000));
      fechaFin = fechaFin.toISOString().split('T')[0];
      let titleNoCumple = (noCumple) ? 'INCUMPLIMIENTO' : '';
      let title = `REPORTE SEMANAL - EJECUCIÓN ${ titleNoCumple } ${ fechaInicio } A ${ fechaFin }`;
          
      this.content.push({ table: {
        widths: ['*'],
        headerRows: 1,
          body: [
            [
            {
                alignment: 'center',
                bold: true,
                fillColor: '#efefef',
                fontSize: 12,
                text: title,
              }
            ]
          ]
      }, margin: [0, 10, 0, 0], layout: 'noBorders'});

      this.obraNombre.forEach((obra: any) => {           

        this.ordenTrabajoDB.forEach((ordenTrabajo: any) => {       
        
          if (ordenTrabajo.obra.nombre == obra) {
          
            let titleEncabezado = true;
            let borderBottom = false;
        
            this.ordenActividadDB.forEach((ordenActividad: any) => {   
                           
              ordenActividad.forEach((elementact: any) => {

                let existsCheck: boolean = false;

                if (ordenTrabajo._id == elementact.ordentrabajo._id && elementact.actividad) {

                  if (elementact.estado == 'NO CUMPLE') {
                    this.series[0] += 1;
                    color = 'red';
                  } else if (elementact.estado == 'CUMPLE') {
                    this.series[1] += 1;
                    color = 'green';
                  } else {
                    this.series[2] += 1;
                    color = 'blue';
                  }  
                  
                  if (noCumple && (elementact.estado == 'CUMPLE' || elementact.estado == 'PENDIENTE')) {
                    return;
                  }   

                  if (titleEncabezado) {

                    titleEncabezado = false;
    
                    this.content.push({ 
                      text: 'OBRA: ' + obra.toUpperCase(), fontSize: 11, bold: true, margin: [0, 20, 0, 0] 
                    });
                    
                    this.content.push({
                      text: `TRABAJO: ${ ordenTrabajo.trabajo.nombre } (${ ordenTrabajo.idviga })`,
                      fontSize: 11,
                      bold: true,
                      margin: [0, 5, 0, 5] //left, top, right, bottom
                    });
        
                    this.content.push({
                      style: 'tableHeader',
                      table: {
                        widths: [120, 155, 60, '*', '*'],
                        body: [
                          [
                            { 
                              alignment: 'center', 
                              bold: true, 
                              border: [true, true, true, true],
                              text: 'TIPO DE TRABAJO', 
                              fontSize: 8, 
                              fillColor: '#efefef', 
                            },
                            { 
                              alignment: 'center', 
                              bold: true, 
                              border: [true, true, true, true],
                              text: 'ACTIVIDAD', 
                              fontSize: 8, 
                              fillColor: '#efefef', 
                            },
                            { 
                              alignment: 'center', 
                              bold: true, 
                              border: [true, true, true, true],
                              text: 'CUMPLIMIENTO', 
                              fontSize: 8, 
                              fillColor: '#efefef', 
                            },
                            { 
                              alignment: 'center', 
                              bold: true, 
                              border: [true, true, true, true] ,
                              text: 'CAUSAL NO CUMPLIMIENTO', 
                              fontSize: 8, 
                              fillColor: '#efefef', 
                            },
                            { 
                              alignment: 'center',
                              bold: true, 
                              border: [true, true, true, true],
                              text: 'FECHA MEJORA', 
                              fontSize: 8, 
                              fillColor: '#efefef', 
                            },
                          ],
                          
                        ]
                      }
                    });
    
                  }

                  this.checkOrdenes.forEach((checkOrden: any) => {
                    checkOrden.forEach((checkAct: any) => {

                      if (elementact._id == checkAct.ordenactividad) {
                        existsCheck = true;

                        this.content.push({
                          style: 'tableHeader',
                          table: {
                            widths: [120, 155, 60, '*', '*'],           
                            body: [
                              [
                              { 
                                text: elementact.tipotrabajo.nombre, 
                                fontSize: 7, 
                                border: [true, false, true, true] 
                              },
                              { 
                                text: elementact.actividad.nombre, 
                                fontSize: 8, 
                                border: [true, false, true, true] 
                              },
                              { 
                                text: elementact.estado, 
                                fontSize: 8, 
                                bold: true, 
                                color: color, 
                                border: [true, false, true, true] 
                              },
                              { 
                                text: checkAct.etiqueta, 
                                fontSize: 8, 
                                border: [true, false, true, true]  
                              },
                              { 
                                text: 
                                checkAct.fechaMejora, 
                                fontSize: 8, 
                                border: [true, false, true, true]  
                              },
                              ]
                            ]
                          }
                        });
                      }

                    });
                  });

                  if (!existsCheck) {

                    this.content.push({
                      style: 'tableHeader',
                      table: {
                        widths: [120, 155, 60, '*', '*'],
                        body: [
                          [
                            { 
                              text: elementact.tipotrabajo.nombre, 
                              fontSize: 7, 
                              border: [true, false, true, true] 
                              //borderColor: ['#ff00ff', '#00ffff', '#ff00ff', '#00ffff']
                            },
                            { 
                              text: elementact.actividad.nombre, 
                              fontSize: 8, 
                              border: [true, false, true, true] 
                            },
                            { 
                              text: elementact.estado, 
                              fontSize: 8, 
                              bold: true, 
                              color: color, 
                              border: [true, false, true, true]  
                            },
                            { 
                              text: " ", 
                              fontSize: 8, 
                              border: [true, false, true, true]  
                            },
                            { 
                              text: " ", 
                              fontSize: 8, 
                              border: [true, false, true, true] 
                            },
                          ]
                        ]
                      }
                    });

                  }

                }

              });

            });

          }

        });

      });

      this.chartOptions = {
        series: this.series,        
        colors : ['#b84644', '#28a745', '#4576b5'],
        chart: {
          width: 380,
          type: "pie",
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

      this.showChart = true;

    } // Finaliza la portada

    let time = 0;
    if (this.showDocument) {
      time = 1400;
    }

    setTimeout(async () => {

      this.getBase64ImagePie().then((pieImage: any) => {
        
        if (this.showDocument) {

          this.showDocument = false;

          let totalActividades = this.series[0] + this.series[1] + this.series[2];

          this.content.push(
            { 
              text: 'ESTADÍSTICAS', 
              alignment: 'center', 
              fontSize: 11, 
              bold: true, 
              margin: [0, 40, 0, 10],
              //pageBreak: 'before' 
            },      
          );  

          this.content.push(
            { image: pieImage, alignment: 'center', margin: [0, 20, 0, 0] },
          );  

          this.content.push({
            style: 'tableHeader',
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'N° ORDENES EJECUTAS EN LA SEMANA', fontSize: 10, fillColor: '#efefef', bold: true, },
                  { text: this.ordenTrabajoDB.length, fontSize: 10, bold: true, },
                ],
                [
                  { text: 'TOTAL ACTIVIDADES', fontSize: 10, fillColor: '#efefef', bold: true, },
                  { text: totalActividades, fontSize: 10, bold: true, },
                ],
                [
                  { text: 'N° ACTIVIDADES NO CUMPLIDAS', fontSize: 10, fillColor: '#efefef', bold: true, },
                  { text: this.series[0], fontSize: 10, bold: true, },
                ],
                [
                  { text: 'N°ACTIVIDADES CUMPLIDAS', fontSize: 10, fillColor: '#efefef', bold: true, },
                  { text: this.series[1], fontSize: 10, bold: true, },
                ],
                [
                  { text: 'N°ACTIVIDADES PENDIENTES', fontSize: 10, fillColor: '#efefef', bold: true, },
                  { text: this.series[2], fontSize: 10, bold: true, },
                ],
              ]
            }, margin: [50, 0, 50, 0]
          });

          this.content.push(
            { 
              text: 'EJECUCIÓN DE ACTIVIDADES', 
              alignment: 'center', 
              fontSize: 11, 
              bold: true, 
              margin: [0, 40, 0, 10],
              pageBreak: 'before' 
            },      
          );  

        }         

        ordentipotrabajo.forEach((element: any) => {  

          let header: boolean = true;
    
          ordenactividad.forEach((elementact: any) => {
            
            if (elementact.ordentipotrabajo == element._id && elementact.actividad) {

              try {
                usuariolegaliza = elementact.usuariolegaliza.nombre;
              } catch (error) {
                usuariolegaliza = '';
              }
    
              let fechalegaliza = new Date(elementact.fechalegaliza).toLocaleString()
              if (elementact.estado == 'NO CUMPLE') {  
                color = 'red';
              } else if (elementact.estado == 'CUMPLE') {            
                color = 'green';
              } else {        
                color = 'blue';
                fechalegaliza = '';
              }
              
              if (noCumple && (elementact.estado == 'CUMPLE' || elementact.estado == 'PENDIENTE')) {
                return;
              }          
              
              if (header) {    
    
                header = false;
    
                this.content.push({table: {
                  widths: ['*'],
                  headerRows: 1,
                    body: [
                      [
                      {
                        text: 'OBRA: ' + (element.ordentrabajo.obra.nombre).toUpperCase(),
                        fillColor: '#ececec',
                        fontSize: 11,
                        bold: true
                        },
                      ]
                    ]
                }, margin: [0, 5, 0, 0], layout: 'noBorders'});
        
                this.content.push({table: {
                  widths: ['*'],
                  headerRows: 1,
                    body: [
                      [               
                        {
                          text: 'TIPO DE TRABAJO: ' + (element.tipotrabajo.nombre).toUpperCase() + '  - ' + ordentrabajo.idviga,
                          fillColor: '#ececec',
                          fontSize: 11,
                          bold: true
                        }
                      ]
                    ]
                }, margin: [0, 0, 0, 15], layout: 'noBorders'});
            
              }
    
              this.content.push({table: {
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
    
              this.content.push({table: {
                widths: [300, 120, '*'],
                headerRows: 1,
                  body: [
                    [
                      { text: elementact.actividad.nombre, alignment: 'justify', fontSize: 10 },
                      { text: fechalegaliza, fontSize: 10, alignment: 'center' },
                      { text: elementact.estado, fontSize: 9, bold: true, alignment: 'center', color: color }
                    ]
                  ]
              }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 2]});
    
              let estado = elementact.estado == "CUMPLE" ? 1 : 0;
    
              itemactividad.forEach((item: any) => {
    
                if (item.actividad == elementact.actividad._id && item.cumple == estado) {
    
                  if (item.tipo == "ETIQUETA") {
    
                    this.content.push({ ul: [
                      { text: item.etiqueta, fontSize: 10, bold: true, margin: [0, 15, 0, 5] }
                    ]});
    
                  } else if (item.tipo == "EVIDENCIAS") {
    
                    this.content.push({ ul: [
                      ({ text: item.etiqueta + ':', fontSize: 10, bold: true })
                    ]});
    
                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo == "EVIDENCIAS") {
                        value.push({ image: img.image, width: 126 });
                      }
                    }
    
                    this.content.push({table: {
                      headerRows: 1,
                        body: [
                            value
                        ]
                    }, layout: 'noBorders', margin: [3, 5, 0, 5]});
    
                  } else if (item.tipo == "FOTO BITÁCORA") {
    
                    this.content.push({ ul: [
                      ({ text: item.etiqueta + ':', fontSize: 10, bold: true })
                    ]});
    
                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo == "FOTOBITACORA") {
                        value.push({ image: img.image, width: 126 });
                      }
                    }
    
                    this.content.push({table: {
                      headerRows: 1,
                        body: [
                            value
                        ]
                    }, layout: 'noBorders', margin: [3, 5, 0, 5]});
    
                  }
    
                }
    
              });  //itemactividad
    
              this.content.push({ ul: [
                ({ text: 'Lista de Chequeo: ', fontSize: 10, bold: true, margin: [0, 5, 0, 0] })
              ]});
    
              this.checkOrdenes.forEach((checkOrden: any) => {
                checkOrden.forEach((checkAct: any) => {
    
                  if (elementact._id == checkAct.ordenactividad) {
                    let value = [];
                    value.push({ text: checkAct.etiqueta, fontSize: 10, bold: true });
                    if (checkAct.fechaMejora) {
                      value.push({ text: '- Fecha de mejora: ' + checkAct.fechaMejora, fontSize: 10, bold: false });
                    }
                    this.content.push({table: {
                      headerRows: 1,
                        body: [
                            value
                        ]
                    }, layout: 'noBorders', margin: [10, 4, 0, 0]});
                  }
    
                });
              });
    
              if (elementact.observacion != 'undefined' && elementact.observacion != '' && elementact.observacion != null) {
                this.content.push({ ul: [
                  ({ text: 'Observaciones: ', fontSize: 10, bold: true, margin: [0, 10, 0, 0] })  //left, top, right, bottom
                ]});
                this.content.push({ text: elementact.observacion, fontSize: 10, margin: [10, 5, 0, 0] });
              }
    
              if (elementact.fechaMejora) {
                this.content.push({ ul: [
                  ({ text: 'Fecha proyectada de Mejora: ', fontSize: 10, bold: true, margin: [0, 5, 0, 0] })
                ]});
                this.content.push({ text: elementact.fechaMejora, fontSize: 10, margin: [10, 5, 0, 0] });
              }
              //línea en blanco
              this.content.push({ text: ' ', fontSize: 10, margin: [0, 10, 0, 0] });
    
            }
    
          }); //orden actividad
    
        });

      });     

    }, time);     

  }

  showAnexos = () => {
    for (let img of this.imagenesReportes) {
      this.content.push({ image: img.image, alignment: 'center', width: 480, margin: [0, 30, 0, 0] });
      this.content.push({ text: img.titulo, alignment: 'center', margin: [0, 5, 0, 0]  });
    }
    this.content.push({ image: this.usuario.imgfirma, width: 140, margin: [0, 100, 0, 0] });
    this.content.push({ text: "____________________________________" });
    this.content.push({ text: this.usuario.nombre });
  }

  createPdf() {
    
    this.showAnexos();

    setTimeout(() => {
      let docDefinition = {
        content: this.content,
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

      this.loading = false;

    }, 9000);
  }

  getImgOrdenTrabajoBase64(imgordenactividad: any) {
    return new Promise((resolve, reject) => {

      this.imagenesOrdenes = [];
      let cantImages = 1;
      imgordenactividad.forEach((item: any, i: any) => {
        item.files.forEach(async (img: any, n: any) => {
          cantImages += n;
          if (img.originalname) {
            let imgorden = this.urluploadimgordenes + img.originalname;
            await this.getImgBase64(img, item, imgorden).then(() => {});
          }
        });
      });

      let timeout = cantImages * 1200;
      setTimeout(() => {
        resolve(true)
      }, timeout);
    });
  }

  getImgBase64(img: any, item: any, imgorden: any) {
    return new Promise((resolve, reject) => {

      let splitted: any;
      this.getBase64ImageFromURL(imgorden).then((base64data) => {
        splitted = img.originalname.split("=", img.originalname.length);
        this.imagenesOrdenes.push(
          { 
            ordenactividad: item.ordenactividad,
            image: base64data,
            tipo: splitted[0] 
          }
        );
        this.cantImages += 1;
        resolve(true);
      });
    });
  }

  getBase64ImagePie() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement: SVGGraphicsElement = document.querySelector('.apexcharts-svg');
      const imageBlobURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgElement.outerHTML);      
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

  getImgReporteBase64(imgreporte: any) {
    return new Promise((resolve, reject) => {
      this.imagenesReportes = [];
      let cantImages = 1;

      imgreporte.forEach((item: any, i: any) => {
        cantImages += i;
        if (item.file.originalname) {
          let img = this.urluploadimgreportes + item.file.originalname;
          this.getBase64ImageFromURL(img).then((base64data) => {
            this.imagenesReportes.push(
              { 
                image: base64data,
                titulo: item.titulo 
              }
            );
            if (imgreporte.length-1 == i) {
              setTimeout(() => {
                resolve(true)
              }, 400);
            }
          });
        }
        let timeout = cantImages * 3000;
        setTimeout(() => {
          resolve(true)
        }, timeout);
      });
    });
  }

  getBase64ImageFromURL(url: any) {
    return new Promise((resolve, reject) => {
      let img = new Image();

      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        let dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  async showPdfButton() {

    this.chartOptions = {
      series: [28, 39, 11],
      colors : ['#b84644', '#4576b5', '#28a745'],
      chart: {
        width: 380,
        type: "pie"          
      },
      title: {
        text: 'Ejecución de Actividades',
      },
      labels: this.labels,
     
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

  // Búsqueda de reportes
  onSearch(form: NgForm) {
    
    if (form.invalid) { return; }

    this.loading = true;
    this.loadingButton = true;
    this._repoService
        .buscarReportes
        (
          this.empresa,
          this.ordenes.id,
          this.ordenes.usuario,
          this.ordenes.fecha,
          this.ordenes.fechaf
        ).subscribe((res: any) => {
          this.loading= false;
          this.loadingButton = false;
          this.listado = res['reporteDB'];
          this.ordenes.id = null;
          this.ordenes.usuario = null;
          this.ordenes.fecha = null;
          this.ordenes.fechaf = null;
        }, (error: any) => {
          this.errorSearch();
        });
  }

  error(error: any) {
    this.loading = false;
    this.loadingButton = false;
    if (error.error.err.message == "Token no válido") {
      this.router.navigate(["/login"]);
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
