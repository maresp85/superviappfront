import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { environment } from 'src/environments/environment';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { OrdenesModel } from '../../../models/ordenes.model';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import * as moment from 'moment';

import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTitleSubtitle
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
};

@Component({
  selector: 'app-listar-biracoras',
  templateUrl: './listar-bitacoras.component.html',
  styleUrls: []
})
export class ListarBitacorasComponent implements OnInit {

  title: string = 'Bitácoras';
  breadcrumbtitle: string = 'Gestión';
  breadcrumbtitle2: string = 'Bitácoras';
  currentDate = moment();
  empresa: any = this._usService.leerEmpresaUsuario();
  firmasImg: any = [];
  imagenesOrdenes: any = [];
  checkOrdenes: any = [];
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  ordenes: OrdenesModel = new OrdenesModel();
  obra: any = [];
  pb: number = 1;
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
      this.router.navigate(["/login"]);
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
          .getTrabajoEmpresaFiltroBitacora(this.empresa, true)
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

    if (role === 'INGENIERO') {
      this._orService
        .getOrdenesBitacoraUsuario(idusuario, this.empresa, true)
        .subscribe((res: any) => {
          this.listado = res['ordentrabajoDB'];
          this.loading = false;
        }, error => {
          this.error(error);
        });
    } else if (role === 'DIRECTOR DE OBRA') {
      this._orService
        .getOrdenesBitacora(idusuario, true)
        .subscribe((res: any) => {
          this.listado = res['ordentrabajoDB'];
          this.loading = false;
        }, (err: any) => {
          this.error(err);
        });
    } else {
      this._orService
        .getOrdenesBitacoraTodas(this.empresa, true)
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

    this.loading = true;
    this.loadingButton = true;
    this._orService
        .buscarOrdenes(
          this.empresa,
          this.ordenes.id,
          this.ordenes.usuario,
          this.ordenes.estado,
          this.ordenes.idviga,
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
    this.getBase64ImageFromURL('assets/logo_st_bn.jpg').then((base64data) => {
      this.logo = base64data;
    });     

    this._orService
        .getUnaOrden(_id)
        .subscribe((res: any) => {

          let ordentrabajo: any = res.ordentrabajoDB[0];          

          this._conService
              .getObraUsuario(ordentrabajo.obra._id)
              .subscribe((res: any) => {

                let listadoObraUsuario = res['obrausuarioDB'];
                
                listadoObraUsuario.forEach((item: any) =>{
                  this.getBase64ImageFromURL(this.urluploadfirmas+item.usuario.imgfirma)
                      .then((base64data: any) => {
                        try {
                          this.firmasImg.push({
                            'nombre': item.usuario.nombre,
                            'role': item.usuario.role,
                            'firma': base64data,
                          });
                        } catch {}                        
                  });
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
              
              }, (error: any) => {
                console.log('Error: ', error)
                this.error('Ocurrió un error, contacte al administrador');
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
    let color: string;
    let content: any[] = [
      {
        table: {
          headerRows: 1,
          widths: [180, '*', '*'],
          body: [
            [
              { image: this.logo, width: 90, alignment: 'center' },
              { text: 'REPORTE BITÁCORA', alignment: 'center', colSpan: 2, fontSize: 11, bold: true, margin: [0, 15, 0, 0] },
              ''
            ],
            [
              { text: fecha.toLocaleString(), alignment: 'center', fontSize: 10, bold: true },
              { text: (ordentrabajo.obra.nombre).toUpperCase(), alignment: 'center', colSpan: 2, fontSize: 10, bold: true },
              ''
            ],
          ]
        },
        margin: [0, 0, 0, 10]
      }
    ];  

    ordentipotrabajo.forEach((element: any) => {       
 
      ordenactividad.forEach((elementact: any, idx: any) => {

        if (elementact.ordentipotrabajo == element._id && elementact.actividad && elementact.estado !== 'PENDIENTE') {
                    
          let estadoAct = elementact.estado;
          let fechalegaliza = new Date(elementact.fechalegaliza).toLocaleString();

          if (elementact.estado === 'NO CUMPLE') {
            this.series[0] += 1;
            color = 'red';
            if (ordentrabajo.trabajo.bitacora) estadoAct = 'ABIERTA';
          } else if (elementact.estado === 'CUMPLE') {
            this.series[1] += 1;
            color = 'green';
            if (ordentrabajo.trabajo.bitacora) estadoAct = 'CERRADA';
          } else {
            this.series[2] += 1;
            color = 'blue';
            fechalegaliza = '';
          }
 
        }

      }); //orden actividad

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

    setTimeout(async () => {

      this.getBase64ImagePie().then((pieImage: any) => {             

        ordentipotrabajo.forEach((element: any) => {
    
          ordenactividad.forEach((elementact: any) => {

            if (elementact.ordentipotrabajo == element._id && elementact.actividad && elementact.estado !== 'PENDIENTE') {

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
                widths: ['*'],
                headerRows: 1,
                  body: [
                    [
                      {
                        text: 'NOTA ' + elementact.consecutivo,
                        fillColor: '#ececec',
                        fontSize: 11,
                        bold: true
                      }
                    ]
                  ]
              }, margin: [0, 10, 0, 0], layout: 'noBorders'});

              content.push({table: {
                widths: [260, 160, '*'],
                headerRows: 1,
                  body: [
                    [
                      { text: elementact.role, alignment: 'justify', fontSize: 10, bold: true },
                      { text: fechalegaliza, fontSize: 10, alignment: 'center' },
                      { text: estadoAct, fontSize: 9, bold: true, alignment: 'center', color: color }
                    ]
                  ]
              }, layout: 'lightHorizontalLines', margin: [0, 10, 0, 0]})
                  
              for (let item of this.checkOrdenes) {
                if (elementact._id == item.ordenactividad) {
                  let value = [];
                  value.push({ text: item.etiqueta, fontSize: 10, bold: true });
                  if (item.fechaMejora) {
                    value.push({ text: ' Fecha Mejora: ' + item.fechaMejora, fontSize: 10, bold: false });
                  }
                  content.push({table: {
                    headerRows: 1,
                      body: [
                          value
                      ]
                  }, layout: 'noBorders', margin: [0, 5, 0, 0]});
                }
              }  
        
              if (elementact.observacion != 'undefined' && elementact.observacion != '' && elementact.observacion != null) {                
                content.push({ text: elementact.observacion, fontSize: 10, margin: [0, 5, 0, 0] });
              }

              itemactividad.forEach((item: any) => {

                if (item.actividad == elementact.actividad._id) {

                  if (item.tipo == 'EVIDENCIAS') {                   

                    let value = [];
                    for (let img of this.imagenesOrdenes) {
                      if (elementact._id == img.ordenactividad && img.tipo == 'EVIDENCIAS') {
                        value.push({ image: img.image, width: 126 });
                      }
                    }

                    content.push({table: {
                      headerRows: 1,
                        body: [
                          value
                        ]
                    }, layout: 'noBorders', margin: [0, 5, 0, 5]});

                  } else if (item.tipo == 'FOTO BITÁCORA') {                    

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
                    }, layout: 'noBorders', margin: [0, 5, 0, 5]});

                  }

                }

              });  //itemactividad
              
              //línea en blanco
              content.push({ text: ' ', fontSize: 10, margin: [0, 0, 0, 0] });

            }

          }); //orden actividad

        });
        
        content.push(
          { text: '', alignment: 'center', fontSize: 12, pageBreak: 'before' }
        );

        this.firmasImg.forEach((item: any) => {
          content.push({ image: item.firma, width: 140, margin: [0, 20, 0, 0] });
          content.push({ text: "_______________________________________" });
          content.push({ text: item.nombre });
          content.push({ text: item.role });
        });

      });

      setTimeout(() => {
        let docDefinition: any = {
          content: content,
          footer: {
            columns: [
              { text: `Fecha generación: ${ this.currentDate.format('YYYY-MM-DD hh:mm A') }`, style: 'footer' }
            ]
          },
          styles: {
            filledText: {
              fontSize: 18,
              bold: true,
              fillColor: '#ddd'
            },
            name: {
              fontSize: 16,
              bold: true
            },
            footer: {
              color: '#cccccc',
              fontSize: 9,
              margin: [30, 5, 0, 0] //left, top
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
      text: '¿Está seguro de cerrar esta bitácora permanentemente?',
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
                text: 'Bitácora Cerrada',
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
