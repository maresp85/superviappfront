import { Component, OnInit } from '@angular/core';
import { HermeticidadModel } from '../../../models/hermeticidad.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { HermeticidadService } from 'src/app/services/hermeticidad.service';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-hermeticidad',
  templateUrl: './crear-hermeticidad.component.html',
  styleUrls: []
})
export class CrearHermeticidadComponent implements OnInit {

  title: string = "Nuevo Reporte de Hermeticidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Hermeticidad";
  loadingButton: boolean = false;
  loading: boolean = false;
  hermeticidad: HermeticidadModel = new HermeticidadModel();
  usuarios: any = [];
  usuarioid: any;
  usuarionombre: any;
  obra: any = [];
  empresa: any;
  today: string = '';

  constructor(private router: Router,
              public _usService: UsuarioService,
              private _herService: HermeticidadService,
              private _conService: ConfiguracionService) {
    this.hermeticidad.fecha = moment().format().slice(0, 16);
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
          this._conService
              .getObraEmpresa(this.empresa)
              .subscribe((res: any) => {
                this.loading = false;
                this.obra = res['obraDB'];
              }, error => {
                this.error();
              });
        }, error => {
          this.error();
        });
  }

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.loadingButton = true;
    this._herService.crearHermeticidad(this.empresa,
                                       this.hermeticidad.obra,
                                       this.hermeticidad.fecha,
                                       this.hermeticidad.usuario)
                    .subscribe((res: any) => {
                      if (res.ok == true) {
                        this.loadingButton = false;
                        Swal.fire({
                          text: 'Reporte de Hermeticidad Generado',
                          icon: 'success',
                          confirmButtonText: 'OK',
                          allowOutsideClick: false
                        }).then((result) => {
                          this.loadingButton = false;
                          this.router.navigate(['/listarhermeticidad']);
                        });
                      } else {
                        this.error();
                      }
                  }, error => {
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
