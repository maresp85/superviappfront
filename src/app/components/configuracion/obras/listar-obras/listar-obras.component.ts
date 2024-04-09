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

  title: string = "Aliados";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Aliados";
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

  deleteObra(_id: any) {    
    Swal.fire({
      text: '¿Está seguro que desea eliminar este aliado permanentemente?',
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
          .deleteObra(_id)
          .subscribe((res: any) => {
            this.loading = false;
            if (res['ok'] == true) {
              this.getObraEmpresa();
              Swal.fire({
                text: 'Aliado Eliminado',
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
