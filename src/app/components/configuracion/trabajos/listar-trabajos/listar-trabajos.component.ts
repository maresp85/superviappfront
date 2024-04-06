import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-trabajos',
  templateUrl: './listar-trabajos.component.html',
  styleUrls: []
})
export class ListarTrabajosComponent implements OnInit {

  title: string = "Trabajos";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Trabajos";
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
    this.getTrabajo()
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getTrabajo() {
    this.loading = true;
    this._conService
        .getTrabajo()
        .subscribe((res: any) => {
          this.listado = res['trabajoDB'];
          this.loading = false;
        }, (err: any) => {
          this.error(err);
        });
  }

  error(error: any) {
    this.loading = false;
    if (error.error.err.message == 'Token no válido') {
      this.router.navigate(['/login']);
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
