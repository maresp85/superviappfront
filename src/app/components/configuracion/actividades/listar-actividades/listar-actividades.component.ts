import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-actividades',
  templateUrl: './listar-actividades.component.html',
  styleUrls: []
})
export class ListarActividadesComponent implements OnInit {

  title: string = "Actividades";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Actividades";
  empresa: any 
  loading: boolean = false;
  listado: any = [];
  listadoEmpresa: any = [];
  listadoTrabajos: any = [];
  p: number = 1;
  trabajo: any;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) { }

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
        this.error(error);
      });
  }

  onChangeStateEmpresa(empresa: any) {
    this.empresa = empresa;
    this.loading = true;
    this._conService
        .getTrabajoEmpresa(this.empresa)
        .subscribe((res: any) => {
          this.listadoTrabajos = res['trabajoDB'];
          this.listadoTrabajos.forEach((item: any, index: number) => {   
            if (index == 0) {
              this.trabajo = item._id;
            }
          });
          this.getActividades();
          this.loading = false;
        }, (err: any) => {
          this.error(err);
        });
  }

  getActividades() {      
    this.loading = true;    
    this._conService
        .getActividadTrabajo(this.empresa, this.trabajo)
        .subscribe((res: any) => {    
          this.listado = res['actividadDB'];
          this.loading = false;        
        }, (err: any) => {
          this.error(err);
        });
  }

  onChangeStateTrabajo(trabajo: string) {
    this.trabajo = trabajo;
    this.getActividades();
  }

  deleteActividad(_id: any) {
    Swal.fire({    
      text: '¿Está seguro que desea eliminar esta Actividad permanentemente y sus items asociados?',
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
        this._conService
            .deleteActividad(_id)
            .subscribe((res: any) => {      
              this.loading = false;          
              if (res['ok'] == true) {
                this.getActividades();
                Swal.fire({    
                  text: 'Actividad Eliminada',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false
                }).then((result) => { });     
              }                        
            }, (err: any) => {
              this.error(err);
            });
      } 
    });
  }

  error(error: any) {
    this.loading = false;   
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
