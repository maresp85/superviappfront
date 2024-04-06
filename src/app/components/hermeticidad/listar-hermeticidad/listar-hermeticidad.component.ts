import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HermeticidadService } from 'src/app/services/hermeticidad.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-listar-hermeticidad',
  templateUrl: './listar-hermeticidad.component.html',
  styleUrls: []
})
export class ListarHermeticidadComponent implements OnInit {

  title: string = "Reporte de Hermeticidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Hermeticidad";
  empresa: any = this._usService.leerEmpresaUsuario();
  imagenFirma: any;
  imagenInicial: any = [];
  imagenFinal: any = [];
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  imagenNoDisponible: any;
  p: number = 1;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  urluploadimghermeticidad: any = environment.url + environment.uploadimghermeticidad;

  constructor(private router: Router,
              private _herService: HermeticidadService,
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

   // Obtiene reportes de hermeticidad
  getListado() {
    this.loading = true;
    let role: any = this._usService.leerRoleUsuario();
    let idusuario: any = this._usService.leerIDUsuario()
    if (role == 'INGENIERO') {
      this._herService
        .getHermeticidadUsuario(idusuario)
        .subscribe((res: any) => {
          this.loading = false;
          this.listado = res['hermeticidadDB'];
        }, error => {
          this.error(error);
        });
    } else {
      this._herService
        .getHermeticidad(this.empresa)
        .subscribe((res: any) => {
          this.loading = false;
          this.listado = res['hermeticidadDB'];
        }, error => {
          this.error(error);
        });
    }
  }

  generatePdf(_hermeticidad: any) {
    this.loading = true;
    let hermeticidad: any;
    this.getBase64ImageFromURL("assets/no-disponible.png").then((base64data) => {
      this.imagenNoDisponible = base64data;
    });
    this.getBase64ImageFromURL("assets/logo_st_bn.jpg").then((base64data) => {
      this.logo = base64data;
      this._herService
          .getHermeticidadUna(_hermeticidad)
          .subscribe((res: any) => {
            hermeticidad = res['hermeticidadDB'][0];
            this.getBase64ImageFromURL(this.urluploadfirmas+hermeticidad.usuario.imgfirma).then((base64data) => {
              this.imagenFirma = base64data;
              this._herService
                .getLecturaHermeticidad(_hermeticidad)
                .subscribe((res: any) => {
                  this.getImageBase64(res['hermeticidadlecturaDB']).then(() => {
                    this.getDocument(hermeticidad, res['hermeticidadlecturaDB']);
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
    });
  }

  getImageBase64(lectura: any) {
    return new Promise((resolve, reject) => {
      lectura.forEach((item: any, i: any) => {
        let imgInit = this.urluploadimghermeticidad + item.imageninicial;
        let imgEnd = this.urluploadimghermeticidad + item.imagenfinal;
        this.getBase64ImageFromURL(imgInit).then((base64data) => {
          this.imagenInicial.push({ _id: item._id, image: base64data });
        });
        if (item.imagenfinal != null) {
          this.getBase64ImageFromURL(imgEnd).then((base64data) => {
            this.imagenFinal.push({ _id: item._id, image: base64data });
          });
        }
      });
      setTimeout(() => {
        resolve(true)
      }, 10000);
    });
  }

  getDocument(hermeticidad: any, lectura: any) {
    let content: any[] = [
      {
        table: {
          headerRows: 1,
          widths: [105, '*', '*'],
          body: [
            [
              { image: this.logo, width: 90, alignment: 'center' },
              {
                text: 'INSPECCIÓN RUTINARIA DE ELEMENTOS CONSTRUCTIVOS -PRUEBAS DE HERMETICIDAD',
                alignment: 'center',
                colSpan: 2,
                fontSize: 12,
                bold: true
              },
              ''
            ],
            [
              { text: 'OBRA', fontSize: 11, bold: true },
              {
                text: hermeticidad.obra.nombre,
                alignment: 'center',
                colSpan: 2,
                fontSize: 11,
                bold: true
              },
              ''
            ],
            [
              { text: 'NOMBRE RESIDENTE DE SUPERVISIÓN TÉCNICA', fontSize: 11, bold: true },
              {
                text: (hermeticidad.usuario.nombre).toUpperCase(),
                alignment: 'center',
                colSpan: 2,
                fontSize: 11,
                bold: true
              },
              ''
            ]
          ]
        },
        margin: [0, 0, 0, 0]
      }
    ];

    content.push(
      {
        table: {
          headerRows: 1,
          widths: [105, 40, 55, '*', '*', 40, 55, '*', 70, 70, '*'],
          body: [
            [
              {
                text: 'Ubicación',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Lectura inicial (psi)',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Fecha y Hora',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Realizó',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Revisó y Aprobó',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Lectura final (psi)',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Fecha y Hora',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Observaciones',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Registro fotográfico inicial',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Registro fotográfico final',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
              {
                text: 'Firma quien aprueba',
                alignment: 'center',
                border: [1,0,1,1],
                fillColor: '#ccc',
                fontSize: 10,
                bold: true
              },
            ]
          ]
        },
        margin: [0, 0, 0, 0]
      }
    );

    let fechainicial: string;
    let fechafinal: string;
    let observaciones = '';
    let resultado: any = [];
    let imagenInicial: string;
    let imagenFinal: string;

    lectura.forEach((item: any, i: any) => {
      fechainicial = new Date(item.fechainicial).toLocaleString();
      console.log(item.fechafinal);
      fechafinal = item.fechafinal != null ? new Date(item.fechafinal).toLocaleString() : '';
      observaciones = item.observaciones != 'undefined' ? item.observaciones : '';

      //imágenes
      resultado = this.imagenInicial.find((element: any) => element._id === item._id);
      imagenInicial = resultado ? resultado.image : this.imagenNoDisponible;

      resultado = this.imagenFinal.find((element: any)  => element._id === item._id);
      imagenFinal = resultado ? resultado.image : this.imagenNoDisponible;

      content.push(
        {
          table: {
            headerRows: 1,
            widths: [105, 40, 55, '*', '*', 40, 55, '*', 70, 70, '*'],
            body: [
              [
                {
                  text: item.ubicacion,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 10,
                },
                {
                  text: item.lecturainicial,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 10,
                },
                {
                  text: fechainicial,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 9,
                },
                {
                  text: item.realizo,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 10,
                },
                {
                  text: hermeticidad.usuario.nombre,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 9,
                },
                {
                  text: item.lecturafinal,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 10,
                },
                {
                  text: fechafinal,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 9,
                },
                {
                  text: observaciones,
                  alignment: 'center',
                  border: [1,0,1,1],
                  fontSize: 8,
                },
                {
                  image: imagenInicial, width: 68, border: [1,0,1,1],
                },
                {
                  image: imagenFinal, width: 68, border: [1,0,1,1],
                },
                {
                  image: this.imagenFirma, width: 48, border: [1,0,1,1],
                },
              ]
            ]
          },
          margin: [0, 0, 0, 0]
        }
      );
    });

    setTimeout(() => {
      let docDefinition: any = {
        content: content,
        pageOrientation: 'landscape',
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

  deleteHermeticidad(_id: any) {
    Swal.fire({
      text: '¿Está seguro que desea eliminar este reporte permanentemente?',
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
        this._herService.eliminarHermeticidad(_id)
                        .subscribe((res: any)  => {
                          this.loading = false;
                          if (res['ok'] == true) {
                            this.getListado();
                            Swal.fire({
                              text: 'Reporte Hermeticidad Eliminado',
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
