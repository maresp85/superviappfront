import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-empresas',
  templateUrl: './listar-empresas.component.html',
  styleUrls: []
})
export class ListarEmpresasComponent implements OnInit {

  title: string = "Empresas";
  breadcrumbtitle: string = "Administración";
  breadcrumbtitle2: string = "Empresas";
  listado: any = [];
  loading: boolean = false;
  url: any = environment.url + "/uploads/empresas/logos/"

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService,
  ) {}

  ngOnInit() {    
    this.validateRole();
    
    this.loading = true;
    this._conService
        .getEmpresa()
        .subscribe((res: any) => {        
            this.loading = false;       
            this.listado = res;     
        }, error => {
          this.error();
        });
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  error() {
    this.loading = false;   
    Swal.fire({    
      text: 'Ocurrió un error, contacte al administrador',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }

}
