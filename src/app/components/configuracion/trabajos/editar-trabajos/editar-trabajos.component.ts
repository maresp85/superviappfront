import { Component, OnInit } from '@angular/core';
import { TrabajoModel } from 'src/app/models/trabajo.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-trabajos',
  templateUrl: './editar-trabajos.component.html',
  styleUrls: []
})
export class EditarTrabajosComponent implements OnInit {

  title: string = "Editar Trabajo";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Trabajo";
  trabajo: TrabajoModel;
  loadingButton: boolean = false;
  listadoTrabajo: any = [];
  loading: boolean = false;  
  _trabajo: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) {
    this.trabajo = new TrabajoModel();
    this.activatedRoute.params.subscribe(params => {
      this._trabajo = params['_trabajo']; 
    });  
  }

  ngOnInit() {
    this.validateRole();
    this.getTrabajo();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getTrabajo = () => {
    this.loading = true;
    this._conService
        .getUnTrabajo(this._trabajo)
        .subscribe((res: any) => {         
          this.listadoTrabajo = res['trabajoDB'][0];  
          this.trabajo.nombre = this.listadoTrabajo.nombre;
          this.trabajo.gradeChart = this.listadoTrabajo.gradeChart;
          this.trabajo.activo = this.listadoTrabajo.activo ? 1 : 0; ;
          this.trabajo.fechaMejora = this.listadoTrabajo.fechaMejora ? 1 : 0; ;          
          this.trabajo.legalizaCualquierOrden = this.listadoTrabajo.legalizaCualquierOrden ? 1 : 0; ;
          this.trabajo.bitacora = this.listadoTrabajo.bitacora ? 1 : 0; 
          this.loading = false;
        }, (err: any) => {
          this.error();
        });
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;    
    this._conService
      .putTrabajo(
        this._trabajo,
        this.trabajo.nombre,
        this.trabajo.activo,
        this.trabajo.fechaMejora,
        this.trabajo.legalizaCualquierOrden,
        this.trabajo.bitacora,
        this.trabajo.gradeChart,
      ).subscribe((res: any) => { 
        if (res.ok == true) {
          this.loadingButton = false;    
          Swal.fire({    
            text: 'Trabajo editado',
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false
          }).then((result) => {
            this.loadingButton = false;
            this.router.navigate(['/listartrabajos']);
          });                  
        } else {
          this.error();
        }         
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
