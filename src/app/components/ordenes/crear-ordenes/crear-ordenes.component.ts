import { Component, OnInit } from '@angular/core';
import { OrdenesModel } from '../../../models/ordenes.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-ordenes',
  templateUrl: './crear-ordenes.component.html',
  styleUrls: []
})
export class CrearOrdenesComponent implements OnInit {

  title: string = "Nueva Orden de Trabajo";
  breadcrumbtitle: string = "Gestión";
  breadcrumbtitle2: string = "Ordenes";
  loadingButton: boolean = false;
  loading: boolean = false;
  ordenes: OrdenesModel = new OrdenesModel();
  usuarios: any = [];
  usuarioid: any;
  usuarionombre: any;
  trabajo: any = [];
  obra: any = [];  
  empresa: any;
  role: any;
  today: string = '';

  constructor(
    private router: Router,
    public _usService: UsuarioService,
    private _orService: OrdenesService,
    private _conService: ConfiguracionService
  ) {
    this.ordenes.fecha = moment().format().slice(0, 16);
  }

  ngOnInit(): void {
    this.loading = true;
    this.empresa = this._usService.leerEmpresaUsuario(); 
    this.usuarioid = this._usService.leerIDUsuario();
    this.usuarionombre = this._usService.leerNombreUsuario();
    this.role = this._usService.leerRoleUsuario();

    this._conService
        .getTrabajoEmpresaFiltroBitacora(this.empresa, false)
        .subscribe((res: any) => {                                               
          this.trabajo = res['trabajoDB'];                                       
        }, error => {
          this.error();
        });

    if (this.role == 'COORDINADOR') {
      this._usService
      .getUsuarioEmpresa(this.empresa)
      .subscribe((res: any) => {               
        this.usuarios = res['usuarioDB'];
        this.loading = false;       
      }, error => {
        this.error();
      });
    } else {
      this._conService
          .getObraEmpresasxUsuario(this.usuarioid)
          .subscribe((res: any) => {    
            this.obra = res['obraDB'];                                                                  
            this.loading = false;  
          }, error => {
            this.error();
          });
    }              
  }

  onChangeUsuario(usuarioId: any) {
    this.obra = [];
    this.loading = true;
    this._conService
          .getObraEmpresasxUsuario(usuarioId)
          .subscribe((res: any) => {    
            this.obra = res['obraDB'];                                                                  
            this.loading = false;  
          }, error => {
            this.error();
          });
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }
    
    this.loadingButton = true;
    this._orService
      .crearOrdenes(
        this.empresa,
        this.ordenes.trabajo,
        this.ordenes.obra,
        this.ordenes.usuario,
        this.ordenes.fecha,
        this.ordenes.observaciones
      )
        .subscribe((res: any) => {                       
          if (res.ok == true) {  
            this.loadingButton = false;                    
            Swal.fire({    
              text: 'Orden de trabajo generada y asignada',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loadingButton = false;
              this.router.navigate(['/listarordenes']);
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