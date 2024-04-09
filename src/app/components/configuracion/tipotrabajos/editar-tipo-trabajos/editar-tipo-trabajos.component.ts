import { Component, OnInit } from '@angular/core';
import { TipoTrabajoModel } from 'src/app/models/tipotrabajo.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-tipo-trabajos',
  templateUrl: './editar-tipo-trabajos.component.html',
  styleUrls: []
})
export class EditarTipoTrabajosComponent implements OnInit {

  title: string = "Editar Tipo de Trabajo";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Tipos de Trabajo";
  tipotrabajo: TipoTrabajoModel;
  loadingButton: boolean = false;
  listadoTipoTrabajo: any = [];
  listadoTrabajo: any = [];
  loading: boolean = false;  
  _tipotrabajo: any;
  empresa: any;
  activo: any;
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService,
  ) {
    this.tipotrabajo = new TipoTrabajoModel();
    this.activatedRoute.params.subscribe(params => {
      this._tipotrabajo = params['_tipotrabajo']; 
    });  
  }

  ngOnInit() {
    this.loading = true;
    this.empresa = this._usService.leerEmpresaUsuario();
    this._conService
        .getUnTipoTrabajo(this._tipotrabajo)
        .subscribe((res: any) => {    
            this.loading = false;        
            this.listadoTipoTrabajo = res['tipotrabajoDB'][0];
            this.tipotrabajo.nombre = this.listadoTipoTrabajo.nombre;
            this.tipotrabajo.orden = this.listadoTipoTrabajo.orden;
            this.tipotrabajo.trabajo = this.listadoTipoTrabajo.trabajo[0]._id;
            this.tipotrabajo.activo = this.listadoTipoTrabajo.activo ? 1 : 0;            
            this._conService
              .getTrabajoEmpresa(this.empresa)
              .subscribe((res: any) => {    
                this.loading = false;        
                this.listadoTrabajo = res['trabajoDB'];     
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
    this._conService.putTipoTrabajo(
        this._tipotrabajo,
        this.tipotrabajo.nombre,
        this.tipotrabajo.trabajo,
        this.tipotrabajo.orden,
        this.tipotrabajo.activo,
      ).subscribe((res: any) => { 
          if (res.ok == true) {
            this.loadingButton = false;    
            Swal.fire({    
              text: 'Tipo de Trabajo editado',
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
