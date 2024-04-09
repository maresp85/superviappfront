import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HermeticidadService } from 'src/app/services/hermeticidad.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-lectura',
  templateUrl: './listar-lectura.component.html',
  styleUrls: []
})
export class ListarLecturaComponent implements OnInit {

  title: string = "Lecturas Reporte Hermeticidad";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Hermeticidad";
  empresa: any = this._usService.leerEmpresaUsuario();
  hermeticidad: any;
  _hermeticidad: any;
  listado: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  logo: any;
  p: number = 1;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  urluploadimghermeticidad: any = environment.url + environment.uploadimghermeticidad;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _herService: HermeticidadService,
              public _usService: UsuarioService) {

    if (this._usService.leerRoleUsuario() == '' ||
        this._usService.leerEmailUsuario() == '' ||
        this._usService.leerEmpresaUsuario() == '' ||
        this._usService.leerIDUsuario() == '') {
          this.router.navigate(["/login"]);
    }

    this.activatedRoute.params.subscribe(params => {
      this._hermeticidad = params['_hermeticidad'];
      this.hermeticidad = params['hermeticidad'];
      this.title = this.title + " N° " + this.hermeticidad;
    });

  }

  ngOnInit(): void {
    this.getListado();
  }

   // Obtiene lecturas asociadas al reporte de hermeticidad
  getListado() {
    this.loading = true;
    this._herService
      .getLecturaHermeticidad(this._hermeticidad)
      .subscribe((res: any) => {
        this.loading = false;
        this.listado = res['hermeticidadlecturaDB'];
      }, error => {
        this.error(error);
      });
  }

  error(error: any) {
    this.loading = false;
    this.loadingButton = false;
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
