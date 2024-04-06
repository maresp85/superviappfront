import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NoConformidadModel } from '../../../models/noconformidad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-noconformidad',
  templateUrl: './editar-noconformidad.component.html',
  styleUrls: []
})
export class EditarNoConformidadComponent implements OnInit {

  title: string = "Editar Reporte de No Conformidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "No Conformidad";
  empresa: any;
  image1: File = null;
  image2: File = null;
  image3: File = null;
  loadingButton: boolean = false;
  loading: boolean = false;
  noconformidad: NoConformidadModel = new NoConformidadModel();
  _noconformidad: any;
  noconformidadDB: any = [];
  urluploadimgnoconformidad: any = environment.url + environment.uploadimgnoconformidad;
  usuarioDB: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public _usService: UsuarioService,
              private _repoService: ReportesService) {
    this.activatedRoute.params.subscribe(params => {
      this._noconformidad = params['_id'];
      this.title += ' N° ' + params['id'];
    });
  }

  ngOnInit(): void {
    this.getUnReporteNoConformidad();
  }

  getUnReporteNoConformidad() {
    this.loading = true;
    this.empresa = this._usService.leerEmpresaUsuario();
    this._repoService
        .getReporteNoConformidadUno(this._noconformidad)
        .subscribe((res: any) => {
          this.noconformidadDB = res['noconformidadDB'][0];
          this.noconformidad.descripcion = this.noconformidadDB.descripcion != 'undefined' ? this.noconformidadDB.descripcion : '';
          this.noconformidad.analisis = this.noconformidadDB.analisis != 'undefined' ? this.noconformidadDB.analisis : '';
          this.noconformidad.accion_correctiva = this.noconformidadDB.accion_correctiva != 'undefined' ? this.noconformidadDB.accion_correctiva : '';
          this.noconformidad.verificacion = this.noconformidadDB.verificacion != 'undefined' ? this.noconformidadDB.verificacion : '';
          this.noconformidad.fecha_verificacion = moment(this.noconformidadDB.fecha_verificacion).format().slice(0, 16);
          this.noconformidad.estado = this.noconformidadDB.estado;
          this._usService
              .getUnUsuario()
              .subscribe((res: any) => {
                this.usuarioDB = res['usuarioDB'];
                this.loading = false;
              }, (error: any) => {
                this.error();
              });
        }, (error: any) => {
          this.error();
        });
  }

  fileUpload1(fileInput: any) {
    this.image1 = <File>fileInput.target.files[0];
  }

  fileUpload2(fileInput: any) {
    this.image2 = <File>fileInput.target.files[0];
  }

  fileUpload3(fileInput: any) {
    this.image3 = <File>fileInput.target.files[0];
  }

  deleteImage(_id: any, _n: any) {
    Swal.fire({
      text: '¿Está seguro que desea eliminar esta imagen?',
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
        this._repoService.eliminaImgNoConformidad(_id, _n)
                        .subscribe((res: any) => {
                            this.loading = false;
                            if (res['ok'] == true) {
                              this.getUnReporteNoConformidad();
                              Swal.fire({
                                text: 'Imagen Eliminada',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false
                              }).then((result) => {});
                            }
                          }, (error: any) => {
                            this.error();
                          });
      }
    });
  }

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.loadingButton = true;
    this._repoService.editarNoConformidad(this.noconformidadDB._id,
                                        this.noconformidad.descripcion,
                                        this.noconformidad.analisis,
                                        this.noconformidad.accion_correctiva,
                                        this.noconformidad.verificacion,
                                        this.noconformidad.fecha_verificacion,
                                        this.noconformidad.estado,
                                        this.image1,
                                        this.image2,
                                        this.image3)
                    .subscribe((res: any) => {
                      if (res.ok == true) {
                        this.loadingButton = false;
                        let msj = 'Reporte de No Conformidad Actualizado';
                        if (this.noconformidad.estado == 'CERRADO') {
                          msj = 'Reporte de No Conformidad Cerrado, no se puede volver a editar'
                        }
                        Swal.fire({
                          text: msj,
                          icon: 'success',
                          confirmButtonText: 'OK',
                          allowOutsideClick: false
                        }).then((result) => {
                          this.loadingButton = false;
                          this.router.navigate(['/listarnoconformidad']);
                        });
                      } else {
                        this.error();
                      }
                  }, (error: any) => {
                    this.error();
                  });
  }

  error() {
    this.loadingButton = false;
    this.loading = false;
    Swal.fire({
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
