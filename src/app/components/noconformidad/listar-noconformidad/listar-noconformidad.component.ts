import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ReportesService } from 'src/app/services/reportes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-listar-noconformidad',
  templateUrl: './listar-noconformidad.component.html',
  styleUrls: []
})
export class ListarNoConformidadComponent implements OnInit {

  title: string = "Reporte de No Conformidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "No Conformidad";
  empresa: any = this._usService.leerEmpresaUsuario();
  imagenFirma: any;
  imagen1: any = [];
  imagen2: any = [];
  imagen3: any = [];
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  imagenNoDisponible: any;
  p: number = 1;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  urluploadimgnoconformidad: any = environment.url + environment.uploadimgnoconformidad;

  constructor(private router: Router,
              private _repoService: ReportesService,
              public _usService: UsuarioService) {

    if (this._usService.leerRoleUsuario() == '' ||
        this._usService.leerEmailUsuario() == '' ||
        this._usService.leerEmpresaUsuario() == '' ||
        this._usService.leerIDUsuario() == '') {
          this.router.navigate(["/login"]);
    }

  }

  ngOnInit(): void {
    this.getListado();
  }

   // Obtiene reportes de No Conformidad
  getListado() {
    this.loading = true;
    let role: any = this._usService.leerRoleUsuario();
    let idusuario: any = this._usService.leerIDUsuario()
    if (role == 'INGENIERO') {
      this._repoService
        .getReporteNoConformidadUsuario(idusuario)
        .subscribe((res: any) => {
          this.loading = false;
          this.listado = res['noconformidadDB'];
        }, (error: any) => {
          this.error(error);
        });
    } else {
      this._repoService
        .getReporteNoConformidad(this.empresa)
        .subscribe((res: any) => {
          this.loading = false;
          this.listado = res['noconformidadDB'];
        }, (error: any) => {
          this.error(error);
        });
    }
  }

  generatePdf(_noconformidad: any) {
    this.loading = true;
    let noconformidad: any;
    this.getBase64ImageFromURL('assets/logo_pdf.png').then((base64data) => {
      this.logo = base64data;
      this._repoService
          .getReporteNoConformidadUno(_noconformidad)
          .subscribe((res: any) => {
            noconformidad = res['noconformidadDB'][0];
            this.getImageBase64(noconformidad).then(() => {
              this.getDocument(noconformidad);
            }, (error: any) => {
              this.error(error);
            });
          }, (error: any) => {
            this.error(error);
          });
    });
  }

  getImageBase64(noconformidad: any) {
    return new Promise((resolve, reject) => {
      if (noconformidad.imagen1) {
        let img = this.urluploadimgnoconformidad + noconformidad.imagen1.originalname;
        this.getBase64ImageFromURL(img).then((base64data) => {
          this.imagen1 = base64data;
        });
      }
      if (noconformidad.imagen2) {
        let img = this.urluploadimgnoconformidad + noconformidad.imagen2.originalname;
        this.getBase64ImageFromURL(img).then((base64data) => {
          this.imagen2 = base64data;
        });
      }
      if (noconformidad.imagen3) {
        let img = this.urluploadimgnoconformidad + noconformidad.imagen3.originalname;
        this.getBase64ImageFromURL(img).then((base64data) => {
          this.imagen3 = base64data;
        });
      }
      setTimeout(() => {
        resolve(true)
      }, 10000);
    });
  }

  getDocument(noconformidad: any) {
    let fecha = noconformidad.fecha != null ? new Date(noconformidad.fecha).toLocaleString() : '';
    let fecha_evidencia = noconformidad.fecha_evidencia != null ? new Date(noconformidad.fecha_evidencia).toLocaleString() : '';
    let ac = noconformidad.tipo_accion == 'A.C' ? 'X' : '';
    let ac_bold = noconformidad.tipo_accion == 'A.C' ? true : false;
    let ap = noconformidad.tipo_accion == 'A.P' ? 'X' : '';
    let ap_bold = noconformidad.tipo_accion == 'A.P' ? true : false;
    let pnc = noconformidad.tipo_accion == 'PNC' ? 'X' : '';
    let pnc_bold = noconformidad.tipo_accion == 'PNC' ? true : false;
    let resolver = noconformidad.resolver != null ? new Date(noconformidad.resolver).toLocaleString() : 'Inmediata';
    let verificacion = noconformidad.verificacion != 'undefined' ? noconformidad.verificacion : ' ';
    let fecha_verificacion = noconformidad.fecha_verificacion != null ? new Date(noconformidad.fecha_verificacion).toLocaleString() : '';

    let consecutivo = noconformidad.id;
    if (consecutivo.toString().length == 1) {
      consecutivo = `00${consecutivo}`
    }
    if (consecutivo.toString().length == 2) {
      consecutivo = `0${consecutivo}`
    }

    let content: any[] = [
      {
        table: {
          headerRows: 1,
          widths: [120, 320, '*'],
          body: [
            [
              { image: this.logo, width: 90, alignment: 'center' },
              {
                text: 'REPORTE DE NO CONFORMIDAD',
                alignment: 'center',
                bold: true,
                fontSize: 11,
              },
              {
                text: 'FECHA: ' + fecha,
                alignment: 'center',
                bold: true,
                fontSize: 11,
              },
            ],
            [
              { text: 'OBRA', alignment: 'center', fontSize: 11, bold: true },
              {
                text: noconformidad.obra.nombre,
                alignment: 'center',
                bold: true,
                fontSize: 11,
              },
              { text: 'CONSECUTIVO: ' + consecutivo, alignment: 'center', fontSize: 11, bold: true },
            ],
            [
              {
                text: 'A COMPLETAR POR QUIÉN DETALLA',
                bold: true,
                color: 'white',
                colSpan: 3,
                fillColor: '#000',
                fontSize: 10,
              },
            ],
            [
              { text: 'FECHA DE LA EVIDENCIA', colSpan: 1, fontSize: 10 },
              { text: fecha_evidencia, colSpan: 2, fontSize: 10 },
              '',
            ],
          ]
        },
        margin: [0, 0, 0, 0]
      }
    ];

    content.push({table: {
      headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              columns: [
                { text: 'NO CONFORMIDAD OBSERVADA EN EL PROCESO:', fontSize: 10, width: '42%' },
                [
                  { text: noconformidad.proceso, decoration: 'underline', fontSize: 10 },
                ]
              ]
            },
          ],
          [
            {
              columns: [
                { text: 'TIPO DE ACCIÓN:', fontSize: 10, width: '42%' },
                [
                  { text: 'A.C ' + ac, bold: ac_bold, fontSize: 10 },
                ],
                [
                  { text: 'A.P ' + ap, bold: ap_bold, fontSize: 10 },
                ],
                [
                  { text: 'PNC ' + pnc, bold: pnc_bold, fontSize: 10 },
                ]
              ]
            }
          ]
        ]
    }, margin: [0, -1, 0, 0]}); // margin: [left, top, right, bottom]

    content.push(
      {
        table: {
          headerRows: 1,
          widths: [120, 320, '*'],
          body: [
            [
              {
                text: 'DESCRIPCIÓN DE LA EVIDENCIA OBJETIVA',
                bold: true,
                colSpan: 3,
                fontSize: 10,
              },
            ],
            [
              {
                text: noconformidad.descripcion,
                colSpan: 3,
                fontSize: 10,
              },
            ],
          ]
        },
        margin: [0, -1, 0, 0]
      }
    );

    content.push(
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'GRADO', alignment: 'center', fillColor: '#cecece', fontSize: 10 },
              { text: 'QUIÉN DETECTA', alignment: 'center', fillColor: '#cecece', fontSize: 10 },
              { text: 'NUMERAL DE LA NORMA', alignment: 'center', fillColor: '#cecece', fontSize: 10 },
              { text: 'RESOLVER', alignment: 'center', fillColor: '#cecece', fontSize: 10 },
            ],
            [
              { text: noconformidad.tipo_grado, bold: true, fontSize: 9 },
              { text: noconformidad.quien_detecta, bold: true, fontSize: 9 },
              { text: noconformidad.numeral_norma, bold: true, fontSize: 9 },
              { text: resolver, bold: true, fontSize: 9 },
            ],
            [
              {
                text: 'DILIGENCIA QUIÉN GENERA',
                bold: true,
                color: 'white',
                colSpan: 4,
                fillColor: '#000',
                fontSize: 10,
              },
            ],
            [
              {
                text: 'ANÁLISIS DE CAUSA RAIZ ¿QUÉ ESTÁ FALLANDO DENTRO DEL PROCESO PARA QUE ESTO OCURRA?',
                bold: true,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                text: noconformidad.analisis,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                text: 'ACCIÓN CORRECTIVA ¿QUÉ ACCIÓN SE TOMA PARA CORREGIR EL PROBLEMA Y NO VUELVA A OCURRIR?',
                bold: true,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                text: noconformidad.accion_correctiva,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                text: 'DILIGENCIA QUIÉN HACE EL SEGUIMIENTO',
                bold: true,
                color: 'white',
                colSpan: 4,
                fillColor: '#000',
                fontSize: 10,
              },
            ],
            [
              {
                text: 'VERIFICACIÓN DE LAS ACCIONES CORRECTIVAS (COMENTARIOS DE LA VERIFICACIÓN)',
                bold: true,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                text: verificacion,
                colSpan: 4,
                fontSize: 10,
              },
            ],
            [
              {
                colSpan: 4,
                columnGap: 2,
                columns: [
                  { text: 'FECHA DE VERIFICACIÓN:', fontSize: 10, width: '24%' },
                  [
                    { text: fecha_verificacion, decoration: 'underline', fontSize: 10 },
                  ],
                  { text: 'ESTADO DE LA NO CONFORMIDAD:', fontSize: 10, width: '30%' },
                  [
                    { text: noconformidad.estado, decoration: 'underline', fontSize: 10 },
                  ],
                ]
              },
            ],
          ]
        },
        margin: [0, -1, 0, 0]
      }
    );

    content.push({ text: 'REGISTRO FOTOGRÁFICO', fontSize: 10, bold: true , margin: [0, 10, 0, 5]});

    var value = [];
    if (this.imagen1.length) {
      value.push({ image: this.imagen1, width: 180 });
    }
    if (this.imagen2.length) {
      value.push({ image: this.imagen2, width: 180 });
    }
    if (this.imagen3.length) {
      value.push({ image: this.imagen3, width: 180 });
    }

    content.push({table: {
      headerRows: 1,
        body: [
            value
        ]
    }, layout: 'lightHorizontalLines', margin: [0, 5, 0, 5]});

    setTimeout(() => {
      let docDefinition: any = {
        content: content,
        pageMargins: [10, 20, 10, 10 ], // left, top
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
    }, 1000);

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

  deleteNoConformidad(_id: any) {
    Swal.fire({
      text: '¿Está seguro que desea eliminar este reporte?',
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
        this._repoService.eliminarNoConformidad(_id)
                        .subscribe((res: any) => {
                          this.loading = false;
                          if (res['ok'] == true) {
                            this.getListado();
                            Swal.fire({
                              text: 'Reporte de No Conformidad Eliminado',
                              icon: 'success',
                              confirmButtonText: 'OK',
                              allowOutsideClick: false
                            }).then((result) => { });
                          }
                        }, error => {
                          this.error(error);
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

}
