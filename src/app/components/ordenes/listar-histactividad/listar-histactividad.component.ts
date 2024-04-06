import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormGroup }  from '@angular/forms'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-histactividad',
  templateUrl: './listar-histactividad.component.html',
  styleUrls: []
})
export class ListarHistActividadComponent implements OnInit {

  title: string = "Consulta Actividad";
  breadcrumbtitle: string = "Gestión";
  breadcrumbtitle2: string = "Consulta Actividad";
  urluploadimgordenes: any = environment.url + environment.uploadimgordenes;
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  ordenActividad: any[] = [];
  loading: boolean = false;
  subtitle: string = '';
  listado: any = [];
  orden: any = [];
  _actividad: any;
  _ordentipotrabajo: any;
  usuarioDB: any;
  cumple: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _usService: UsuarioService,
              private _orService: OrdenesService) {
    this.activatedRoute.params.subscribe(params => {
      this._actividad = params['_actividad'];
      this._ordentipotrabajo = params['_ordentipotrabajo'];
    });
  }

  ngOnInit() {
    this.loading = true;
    this._orService.getUnaOrdenActividad(this._actividad)
                   .subscribe((res: any) => {
                      this.ordenActividad = res['ordenactividadDB'];
                      this.title = this.ordenActividad[0].tipotrabajo.nombre;
                      this.subtitle = this.ordenActividad[0].actividad.nombre;
                      this._orService.getOrActividadesOrTipoTrabajo(this.ordenActividad[0].actividad._id,
                                                                    this._ordentipotrabajo)
                                     .subscribe((res: any) => {
                                      this.loading = false;
                                      this.listado = res['ordenactividadDB'];
                                     }, error => {
                                        this.error();
                                     });
                    }, error => {
                      this.error();
                    });

  }

  consultarActividad(actividad: any) {
    this.router.navigate(['/listaractividad', actividad]);
  }

  regresar() {
    this.router.navigate(['/cargarordenes',
                          this.ordenActividad[0].ordentrabajo.id,
                          this.ordenActividad[0].ordentrabajo._id]);
  }

  error() {
    this.loading = false;
    Swal.fire({
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
