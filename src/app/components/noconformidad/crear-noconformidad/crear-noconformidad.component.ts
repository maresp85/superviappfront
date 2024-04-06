import { Component, OnInit } from '@angular/core';
import { NoConformidadModel } from '../../../models/noconformidad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-noconformidad',
  templateUrl: './crear-noconformidad.component.html',
  styleUrls: []
})
export class CrearNoConformidadComponent implements OnInit {

  title: string = "Nuevo Reporte de No Conformidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "No Conformidad";
  empresa: any;
  image1: File = null;
  image2: File = null;
  image3: File = null;
  loadingButton: boolean = false;
  loading: boolean = false;
  noconformidad: NoConformidadModel = new NoConformidadModel();
  obra: any = [];
  usuarios: any = [];
  usuarioid: any;
  usuarionombre: any;

  constructor(private router: Router,
              public _usService: UsuarioService,
              private _repoService: ReportesService,
              private _conService: ConfiguracionService) {
    this.noconformidad.fecha_evidencia = moment().format().slice(0, 16);
    this.noconformidad.resolver = moment().format().slice(0, 16);
  }

  ngOnInit(): void {
    this.loading = true;
    this.empresa = this._usService.leerEmpresaUsuario();
    this.usuarioid = this._usService.leerIDUsuario();
    this.usuarionombre = this._usService.leerNombreUsuario();
    this._usService
      .getUsuarioEmpresa(this.empresa)
      .subscribe((res: any) => {
        this.usuarios = res['usuarioDB'];
        this._conService.getObraEmpresa(this.empresa)
                        .subscribe((res: any) => {
                            this.loading = false;
                            this.obra = res['obraDB'];
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

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.loadingButton = true;
    this._repoService.crearNoConformidad(this.empresa,
                                        this.noconformidad.fecha_evidencia,
                                        this.noconformidad.proceso,
                                        this.noconformidad.tipo_accion,
                                        this.noconformidad.descripcion,
                                        this.noconformidad.tipo_grado,
                                        this.noconformidad.quien_detecta,
                                        this.noconformidad.numeral_norma,
                                        this.noconformidad.resolver,
                                        this.noconformidad.analisis,
                                        this.noconformidad.accion_correctiva,
                                        this.noconformidad.verificacion,
                                        this.noconformidad.fecha_verificacion,
                                        this.noconformidad.estado,
                                        this.noconformidad.usuario,
                                        this.noconformidad.obra,
                                        this.image1,
                                        this.image2,
                                        this.image3)
                    .subscribe((res: any) => {
                      if (res.ok == true) {
                        this.loadingButton = false;
                        Swal.fire({
                          text: 'Reporte de No Conformidad Generado',
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
