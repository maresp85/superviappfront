import { Component, OnInit } from '@angular/core';
import { ActividadModel } from 'src/app/models/actividad.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-actividades',
  templateUrl: './crear-actividades.component.html',
  styleUrls: []
})
export class CrearActividadesComponent implements OnInit {

  title: string = "Actividades";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Actividades";
  actividad: ActividadModel;
  loadingButton: boolean = false;
  loading: boolean = false;
  listadoEmpresa: any = [];
  listadoTipoTrabajo: any = [];
  empresa: any;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService
  ) {
    this.actividad = new ActividadModel();
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

  onChangeStateEmpresa(empresa: any) {
    this.empresa = empresa;
    this._conService
        .getTipoTrabajoEmpresa(this.empresa)
        .subscribe((res: any) => {    
          this.loading = false;        
          this.listadoTipoTrabajo = res['tipotrabajoDB'];     
        }, (err: any) => {
          this.error();
        });
  } 

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;    
    this._conService
      .crearActividad(
        this.actividad.nombre,
        this.actividad.orden,
        this.actividad.tipotrabajo,
        this.actividad.role,
      )
      .subscribe((res: any) => { 
        if (res.ok == true) {
          this.loadingButton = false;    
          Swal.fire({    
            text: 'Actividad creada',
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false
          }).then((result) => {
            this.loadingButton = false;
            this.router.navigate(['/listaractividades']);
          });                  
        } else {
          this.error();
        }         
      }, (err: any) => {
        this.error();
      }); 
  }

  error() {
    this.loadingButton = false;
    Swal.fire({    
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
