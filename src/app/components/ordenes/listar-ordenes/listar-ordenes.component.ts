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
  imagenesOrdenes: any = [];
  checkOrdenes: any = [];
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  ordenes: OrdenesModel = new OrdenesModel();
  obra: any = [];
  p: number = 1;
  trabajo: any = [];
  usuarios: any = [];
  urluploadimgordenes: any = environment.url + environment.uploadimgordenes_pdf;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;

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

    if (
      this._usService.leerRoleUsuario() == '' ||
      this._usService.leerEmailUsuario() == '' ||
      this._usService.leerEmpresaUsuario() == '' ||
      this._usService.leerIDUsuario() == ''
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
    let role: any = this._usService.leerRoleUsuario();
    let idusuario: any = this._usService.leerIDUsuario();

    this._usService
      .getUsuarioEmpresa(this.empresa)
      .subscribe((res: any) => {
        this.usuarios = res['usuarioDB'];
        this._conService
          .getTrabajoEmpresaFiltroBitacora(this.empresa, false)
          .subscribe((res: any) => {
              this.trabajo = res['trabajoDB'];
              this._conService
                .getObraEmpresa(this.empresa)
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

    if (role === 'SUPERVISOR SSTA' || role === 'SUPERVISOR LEGAL LABORAL') {
      this._orService
        .getOrdenesBitacoraUsuario(idusuario, this.empresa, false)
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

    // Actualiza Identificador - IDViga
  actualizaIDViga(_id: any, fechaMejora: boolean) {  
    let title: string = ' el identificador';

    if (fechaMejora) {
      title = ' el n° de apartamento';
    }

    Swal.fire({
      title: `Digite ${ title }`,
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: (valueIdViga) => {
        if (valueIdViga == "") {
          Swal.showValidationMessage(
            `Ingrese ${ title }`
          );
        } else {
          this._orService
              .putIdVigaOrdenTrabajo(_id, valueIdViga)
              .subscribe((res: any) => {
                return true
              }, (err: any) => {
                Swal.showValidationMessage(
                  `Error al enviar el dato`
                );
              });
        }
      },
    }).then((result: any) => {
      if (result.value) {
        this.getOrdenes();
        Swal.fire({
          title: 'Actualización Exitosa'
        });
      }
    })
  }

  // Submit para la búsqueda de ordenes
  onSearch(form: NgForm) {
    if (form.invalid) { return; }

    this.loading = true;
    this.loadingButton = true;
    this._orService
        .buscarOrdenes(
          this.empresa,
          this.ordenes.id,
          this.ordenes.usuario,
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

  generatePdf(_id: any) {
    this.loading = true;
    this.getBase64ImageFromURL("assets/logo_st_bn.jpg").then((base64data) => {
      this.logo = base64data;
    });
    this._orService
        .getUnaOrden(_id)
        .subscribe((res: any) => {

          let ordentrabajo: any = res.ordentrabajoDB[0];

          try {
            this.getBase64ImageFromURL(this.urluploadfirmas+ordentrabajo.usuario.imgfirma)
                .then((base64data) => {
              this.firmaImg = base64data;
            });
          } catch {}          

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
    
    let titleIdentification: string = "IDENTIFICACIÓN: ";
    if (ordentrabajo.trabajo.fechaMejora) {
      titleIdentification = "N° APARTAMENTO: ";
    }

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

    ordentipotrabajo.forEach((element: any) => {

      let estado = element.estado;
      if (ordentrabajo.trabajo.bitacora) {
        if (ordentrabajo.estado == 'NO CUMPLE') {
          estado = 'ABIERTA';
        } else if (ordentrabajo.estado == 'CUMPLE') {       
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

          if (elementact.estado == 'NO CUMPLE') {
            this.series[0] += 1;
            color = 'red';
            if (ordentrabajo.trabajo.bitacora) estadoAct = 'ABIERTA';
          } else if (elementact.estado == 'CUMPLE') {
            this.series[1] += 1;
            color = 'green';
            if (ordentrabajo.trabajo.bitacora) estadoAct = 'CERRADA';
          } else {
            this.series[2] += 1;
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
 
        }

      }); //orden actividad

    });

    content.push(
      { text: '', alignment: 'center', fontSize: 12, pageBreak: 'before' }
    );

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

    setTimeout(async () => {

      this.getBase64ImagePie().then((pieImage: any) => {

        let totalActividades = this.series[0] + this.series[1] + this.series[2];

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
                  text: 'ESTADÍSTICAS',
                }
              ]
            ]
        }, margin: [0, 40, 0, 10], layout: 'noBorders'});

        content.push(
          { image: pieImage, alignment: 'center', margin: [0, 20, 0, 0] },
        );

        content.push({
          style: 'tableHeader',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'N° ORDENES EJECUTADAS', fontSize: 10, fillColor: '#efefef', bold: true, },
                { text: ordentipotrabajo.length, fontSize: 10, bold: true, },
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
       
        content.push(
          { text: '', alignment: 'center', fontSize: 12, pageBreak: 'before' }
        );

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
          if (ordentrabajo.trabajo.bitacora) {
            if (ordentrabajo.estado == 'NO CUMPLE') {
              estado = 'ABIERTA';
            } else if (ordentrabajo.estado == 'CUMPLE') {       
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
    
          ordenactividad.forEach((elementact: any) => {

            if (elementact.ordentipotrabajo == element._id && elementact.actividad) {

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

              if (elementact.estado == 'NO CUMPLE') {
                color = 'red';
                if (ordentrabajo.trabajo.bitacora) estadoAct = 'ABIERTA';
              } else if (elementact.estado == 'CUMPLE') {
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

              let estado = elementact.estado == 'CUMPLE' ? 1 : 0;

              itemactividad.forEach((item: any) => {

                if (item.actividad == elementact.actividad._id && item.cumple == estado) {

                  if (item.tipo === 'ETIQUETA') {

                    content.push({ ul: [
                      { text: item.etiqueta, fontSize: 10, bold: true, margin: [0, 15, 0, 0] } //
                    ]});

                  } else if (item.tipo === 'EVIDENCIAS') {

                    content.push({ ul: [
                      ({ text: item.etiqueta + ':', fontSize: 10, bold: true, margin: [0, 15, 0, 0] })
                    ]});

                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo === "EVIDENCIAS") {
                        value.push({ image: img.image, width: 126 });
                      }
                    }

                    content.push({table: {
                      headerRows: 1,
                        body: [
                          value
                        ]
                    }, layout: 'noBorders', margin: [3, 5, 0, 5]});

                  } else if (item.tipo === 'FOTO BITÁCORA') {

                    content.push({ ul: [
                      ({ text: item.etiqueta + ':', fontSize: 10, bold: true })
                    ]});

                    var value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo == 'FOTOBITACORA') {
                        value.push({ image: img.image, width: 126 });
                      }
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

              if (elementact.fechaMejora) {
                content.push({ ul: [
                  ({ text: 'Fecha proyectada de Mejora: ', fontSize: 10, bold: true, margin: [0, 5, 0, 0] })
                ]});
                content.push({ text: elementact.fechaMejora, fontSize: 10, margin: [10, 5, 0, 0] });
              }
              //línea en blanco
              content.push({ text: ' ', fontSize: 10, margin: [0, 10, 0, 0] });

            }

          }); //orden actividad

        });

        content.push({ image: this.firmaImg, width: 140, margin: [0, 100, 0, 0] });
        content.push({ text: "_______________________________________" });
        content.push({ text: ordentrabajo.usuario.nombre });
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
            console.log(err);
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
