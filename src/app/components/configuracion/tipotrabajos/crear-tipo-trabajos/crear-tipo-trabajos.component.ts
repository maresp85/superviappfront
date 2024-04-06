import { Component, OnInit } from '@angular/core';
import { TipoTrabajoModel } from 'src/app/models/tipotrabajo.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-crear-tipo-trabajos',
  templateUrl: './crear-tipo-trabajos.component.html',
  styleUrls: []
})
export class CrearTipoTrabajosComponent implements OnInit {

  title: string = "Tipos de Trabajo";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Tipos de Trabajo";
  tipotrabajo: TipoTrabajoModel;
  loadingButton: boolean = false;
  loading: boolean = false;
  listadoEmpresa: any = [];
  listadoTrabajo: any = [];

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService
  ) {
    this.tipotrabajo = new TipoTrabajoModel();
  }

  ngOnInit() {
    this.validateRole();
    this.getEmpresa();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getEmpresa = () => {
    this.loading = true;
    this._conService
      .getEmpresa()
      .subscribe((res: any) => {
        this.loading = false;
        this.listadoEmpresa = res['empresaDB'];
      }, (error: any) => {
        this.error();
      });
  }

  onChangeStateEmpresa = (empresa: any) => {
    this._conService
    .getTrabajoEmpresa(empresa)
    .subscribe((res: any) => {                
      this.listadoTrabajo = res['trabajoDB'];     
      this.loading = false;  
    }, error => {
      this.error();
    });
  }

  onSubmit(form: NgForm) {   
  
    if ( form.invalid ) { return; }

    this.loadingButton = true;    
    this._conService
        .crearTipoTrabajo(
          this.tipotrabajo.nombre,
          this.tipotrabajo.trabajo,
          this.tipotrabajo.empresa
        ).subscribe((res: any) => { 
          if (res.ok == true) {
            this.loadingButton = false;    
            Swal.fire({    
              text: 'Tipo de Trabajo creado',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loadingButton = false;
              this.router.navigate(['/listartipotrabajos']);
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
    Swal.fire({    
      text: 'Ocurrió un error, contacte al administrador',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }

}
