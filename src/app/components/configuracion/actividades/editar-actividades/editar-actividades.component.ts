import { Component, OnInit } from '@angular/core';
import { ActividadModel } from 'src/app/models/actividad.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-actividades',
  templateUrl: './editar-actividades.component.html',
  styleUrls: []
})
export class EditarActividadesComponent implements OnInit {

  title: string = "Editar actividad";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Actividades";
  actividad: ActividadModel;
  loadingButton: boolean = false;
  loading: boolean = false;  
  listadoTipoTrabajo: any = [];  
  listado: any = [];  
  _actividad: any;
  empresa: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) {
    this.actividad = new ActividadModel();
    this.activatedRoute.params.subscribe(params => {
      this._actividad = params['_actividad']; 
    });  
  }

  ngOnInit() {
    this.loading = true;  
    this.empresa = this._usService.leerEmpresaUsuario();
    this._conService
        .getUnaActividad(this._actividad)
        .subscribe((res: any) => {                            
          this.listado = res['actividadDB'];
          this.actividad.nombre = this.listado.nombre;
          this.actividad.orden = this.listado.orden;
          this.actividad.role = this.listado.role;
          this.actividad.tipotrabajo = this.listado.tipotrabajo[0];
          this._conService
              .getTipoTrabajoEmpresa(this.empresa)
              .subscribe((res: any) => {    
                this.loading = false;        
                this.listadoTipoTrabajo = res['tipotrabajoDB'];     
              }, (err: any) => {
                this.error();
              }); 
        }, (err: any) => {
          this.error();
        });
  }  

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }
    this.loadingButton = true;    
    this._conService
        .getUnTipoTrabajo(this.actividad.tipotrabajo)
        .subscribe((res: any) => {
            var trabajo = res['tipotrabajoDB'][0].trabajo[0]._id;
            this._conService
                .putActividad(
                  this._actividad,
                  this.actividad.nombre,
                  this.actividad.orden,
                  this.actividad.role,
                  trabajo,
                  this.actividad.tipotrabajo,
                  this.empresa
                )
                .subscribe((res: any) => { 
                  if (res.ok == true) {
                    this.loadingButton = false;    
                    Swal.fire({    
                      text: 'Actividad Editada',
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
        }, (err: any) => {
          this.error();
        });
  }

  error() {
    this.loading = false;  
    this.loadingButton = false;
    Swal.fire({    
      text: 'Ocurrió un error, contacte al administrador',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
