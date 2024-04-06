import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-obras',
  templateUrl: './listar-obras.component.html',
  styleUrls: []
})
export class ListarObrasComponent implements OnInit {

  title: string = "Obras";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Obras";
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
    this.getObraEmpresa();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getObraEmpresa = () => {
    this.loading = true;
    this._conService
      .getObra()
      .subscribe((res: any) => {
        this.listado = res['obraDB'];
        this.loading = false;
      }, (error: any) => {
        this.error(error);
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
