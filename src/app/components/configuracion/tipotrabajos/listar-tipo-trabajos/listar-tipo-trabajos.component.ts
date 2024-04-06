import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-tipo-trabajos',
  templateUrl: './listar-tipo-trabajos.component.html',
  styleUrls: []
})
export class ListarTipoTrabajosComponent implements OnInit {

  title: string = 'Tipos de Trabajo';
  breadcrumbtitle: string = 'Configuración';
  breadcrumbtitle2: string = 'Tipos de Trabajo';
  listado: any = [];
  loading: boolean = false;
  p: number = 1;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) { }

  ngOnInit() {
    this.validateRole();
    this.getTiposTrabajo();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getTiposTrabajo() {
    this.loading = true;    
    this._conService
        .getTipoTrabajo()
        .subscribe((res: any) => {
          this.listado = res['tipotrabajoDB'];
          this.loading = false;       
        }, error => {
          this.error(error);
        });
  }

  deleteTipoTrabajo(_id: any) {
    Swal.fire({    
      text: '¿Está seguro que desea eliminar este tipo de trabajo permanentemente y sus actividades asociadas?',
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
        this._conService.deleteTipoTrabajo(_id)
                        .subscribe((res: any) => {      
                          this.loading = false;          
                          if (res['ok'] == true) {
                            this.getTiposTrabajo();
                            Swal.fire({    
                              text: 'Tipo de Trabajo Eliminado',
                              icon: 'success',
                              confirmButtonText: 'OK',
                              allowOutsideClick: false
                            }).then((result: any) => { });     
                          }                        
                        }, error => {
                          this.error(error);
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
