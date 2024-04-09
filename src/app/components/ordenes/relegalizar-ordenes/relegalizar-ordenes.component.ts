import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-relegalizar-ordenes',
  templateUrl: './relegalizar-ordenes.component.html',
  styleUrls: []
})
export class ReLegalizarOrdenesComponent implements OnInit {

  title: string = "Legalizar Orden de Trabajo";
  breadcrumbtitle: string = "Gestión";
  breadcrumbtitle2: string = "ReLegalización Ordenes";
  url: any = environment.url + environment.uploadfirmas;
  ordenActividad: any[] = [];
  loadingButton: boolean = false;
  observaciones: any;
  loading: boolean = false;
  disabledbutton: boolean = true;
  email: string = '';
  existsFile: boolean = false;
  existeimagen: boolean = false;
  fechaMejora: boolean = false;
  files: Array<File> = [];
  files2: Array<File> = [];
  subtitle: string = '';
  imgfirma: any;
  isChecked: any = [];
  listado: any = [];
  orden: any = [];
  _actividad: any;
  usuarioDB: any;
  cumple: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _usService: UsuarioService,
    private _orService: OrdenesService
  ) {
    this.email = this._usService.leerEmailUsuario();
    this.activatedRoute.params.subscribe(params => {
      this._actividad = params['_actividad'];
      this.cumple = params['cumple'];
    });
  }

  ngOnInit() {
    this.loading = true;
    this._orService
        .getUnaOrdenActividad(this._actividad)
        .subscribe((res: any) => {
          this.ordenActividad = res['ordenactividadDB'];
          this.title = this.ordenActividad[0].tipotrabajo.nombre;
          this.subtitle = this.ordenActividad[0].actividad.nombre;
          this._orService
              .getItemsActividadEstado(this.ordenActividad[0].actividad._id, this.cumple)
              .subscribe((res: any) => {
                this.listado = res['itemactividadDB'];
                for (let l of this.listado) {
                  if (l.imagen == true) {
                    this.existeimagen = true;
                  }
                }
                this._usService
                  .getUsuarioEmail(this.email)
                    .subscribe((res: any) => {
                      this.usuarioDB = res['usuarioDB'];
                      this.imgfirma = this.url + this.usuarioDB.imgfirma;
                    }, (err: any) => {
                      this.error();
                    });
                this._orService.
                    getUnaOrden(this.ordenActividad[0].ordentrabajo._id)
                    .subscribe((res: any) => {
                      this.loading = false;
                      this.orden = res.ordentrabajoDB[0];
                      this.fechaMejora = this.orden.trabajo.fechaMejora;
                    }, (err: any) => {
                      this.error();
                    });
              }, (err: any) => {
                this.error();
              });
        }, (err: any) => {
          this.error();
        });

  }

  listaChequeo(pos: any, event: any) {
    var disabled = false;
    this.isChecked[pos] = event;
    //se revisa si todos los indices son true
    for (var _i = 0; _i < this.listado.length; _i++) {
      if (!this.isChecked[_i]) {
        disabled = true;
      }
    }

    if (disabled) {
      this.disabledbutton = true;
    } else {
      this.disabledbutton = false;
    }

  }

  fileUpload(event: any, tipo: any) {
    if (tipo == 'EVIDENCIAS') {
      this.files = event.target.files;
    } else {
      this.files2 = event.target.files;
    }
  }

  legalizarOrdenActividad() {
    if (this.files.length == 0 && this.existeimagen) {
      this.existsFile = true;
      return;
    } else {
      this.existsFile = false;
    }

    this.loadingButton = true;
    this._orService
        .putInactivaOrdenActividad(this._actividad)
        .subscribe((res: any) => {
          if (res.ok == true) {
            ///
            this._orService
                .putEstadoOrdenActividad(res['ordenactividadDB']._id,
                                        this.cumple,
                                        this.usuarioDB._id,
                                        this.files,
                                        this.files2,
                                        this.observaciones,
                                        this.fechaMejora)
              .subscribe((res: any) => {
                this.loadingButton = false;
                if (res.ok == true) {
                  Swal.fire({
                    text: 'Actividad Legalizada',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                  }).then((result) => {
                    this.router.navigate(['/cargarordenes', this.orden.id, this.orden._id]);
                  });
                } else {
                  this.error();
                }
              }, (err: any) => {
                this.error();
              });
            ///
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
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
