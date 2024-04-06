import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: []
})
export class ListarUsuariosComponent implements OnInit {

  title: string = "Usuarios";
  breadcrumbtitle: string = "Administración";
  breadcrumbtitle2: string = "Usuarios";
  listado: any = [];
  loading: boolean = false;
  url: any = environment.url + "/uploads/usuarios/firmas/";
  p: number = 1;

  constructor(
    private router: Router,
    public _usService: UsuarioService
  ) {}

  ngOnInit() {
    this.validateRole();
  
    this.loading = true;
    this._usService
        .getUsuarios()
        .subscribe((res: any) => {        
          this.loading = false;  
          this.listado = res['usuarioDB'];     
        }, error => {
          this.error(error);
        });
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
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
