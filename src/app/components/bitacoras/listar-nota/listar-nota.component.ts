import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-nota',
  templateUrl: './listar-nota.component.html',
  styleUrls: []
})
export class ListarNotaComponent implements OnInit {

  title: string = 'Consulta Nota';
  breadcrumbtitle: string = 'Gestión';
  breadcrumbtitle2: string = "Consulta Nota";
  _actividad: any;
  _idimagenes: any;
  cantImg: number = 0;
  cumple: any;
  editaObservacion: boolean = false;
  disabledbutton: boolean = true;
  email: string = '';
  loadingButton: boolean = false;
  loading: boolean = false;
  estadolegaliza: any;
  files: Array<File> = [];
  firmaimg: any;
  fechalegaliza: any;
  fechaMejora: any;
  imagenes: any = [];
  isChecked: any = [];
  listado: any = [];
  checkList: any = [];
  observaciones: any = "";
  orden: any = [];
  ordenActividad: any[] = [];
  subtitle: string = '';
  urluploadfirmas: any = environment.url + environment.uploadfirmas;
  urluploadimgordenes: any = environment.url + environment.uploadimgordenes;
  usuariolegaliza: any;
  usuarioDB: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public _usService: UsuarioService,
    private _orService: OrdenesService
  ) {
    this.email = this._usService.leerEmailUsuario();       
    this.activatedRoute.params.subscribe(params => {
      this._actividad = params['_actividad'];
    });
  }

  ngOnInit() {
    this.getUnaOrdenActividad();
  }

  getUnaOrdenActividad() {
    this.loading = true;
    this._usService
        .getUsuarioEmail(this.email)
        .subscribe((res: any) => {
          this.usuarioDB = res['usuarioDB'];
        }, (err: any) => {
          this.error();
        });

    this._orService
        .getUnaOrdenActividad(this._actividad)
        .subscribe((res: any) => {
          this.ordenActividad = res['ordenactividadDB'];          
          this.title = this.ordenActividad[0].tipotrabajo.nombre;
          this.subtitle = this.ordenActividad[0].actividad.nombre;
          this.usuariolegaliza = this.ordenActividad[0].usuariolegaliza.nombre;
          this.firmaimg = this.urluploadfirmas+this.ordenActividad[0].usuariolegaliza.imgfirma;
          this.fechalegaliza = this.ordenActividad[0].fechalegaliza;
          this.fechaMejora = this.ordenActividad[0].fechaMejora;        
          this.estadolegaliza = this.ordenActividad[0].estado;
          this.observaciones = this.ordenActividad[0].observacion;

          this._orService
            .getItemsActividadNota(this.ordenActividad[0].actividad._id)
            .subscribe((res: any) => {
              this.listado = res['itemactividadDB'];
              this._orService
                .getUnaOrden(this.ordenActividad[0].ordentrabajo._id)
                .subscribe((res: any) => {
                  this.orden = res.ordentrabajoDB[0];
                  this.loading = false;
                }, (err: any) => {
                  this.error();
                });

              this._orService
                .getImgOrdenActividad(this.ordenActividad[0]._id)
                .subscribe((res: any) => {
                  this.imagenes = res['imgordenactividadDB'][0]['files'];
                  this._idimagenes = res['imgordenactividadDB'][0]['_id'];
                  this.imagenes.forEach((img: any) => {
                    if ('EVIDENCIAS' == this.checkTipoImagen(img.filename)) {
                      this.cantImg += 1;
                    }
                  });
                }, (err: any) => {
                  this.error();
                });

              this._orService
                .getCheckOrdenActividad(this.ordenActividad[0]._id)
                .subscribe((res: any) => {
                  this.checkList = res['checkOrdenActividadDB'];
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

  regresar() {
    this.router.navigate(['/cargarbitacoras', this.orden.id, this.orden._id]);
  }

  checkTipoImagen(filename: any) {
    var splitted = filename.split("=", filename.length);
    return splitted[0];
  }

  fileUpload(event: any, tipo: any) {
    this.files = event.target.files;
    this.disabledbutton = false;
  }

  changeDate() {
    this.disabledbutton = false;
  }

  deleteImagen(id: any) {
    Swal.fire({
      text: '¿Está seguro que desea eliminar esta imagen permanentemente?',
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
        this._orService.deleteImgOrdenActividad(id, this._idimagenes)
                       .subscribe((res: any) => {
                          this.loading = false;
                          if (res['ok'] == true) {
                            this.getUnaOrdenActividad();
                            Swal.fire({
                              text: 'Imagen Eliminada',
                              icon: 'success',
                              confirmButtonText: 'OK',
                              allowOutsideClick: false
                            }).then((result) => {});
                          }
                        }, error => {
                          this.error();
                        });
      }
    });
  }

  updateOrdenActividad() {
    this.loadingButton = true;
    this._orService
        .putImgOrdenActividad(
          this._idimagenes,
          this.files,
          this.ordenActividad[0]._id,
          this.observaciones,
          this.fechaMejora
        ).subscribe((res: any) => {
          if (res.ok == true) {
            this.loadingButton = false;
            this.disabledbutton = true;
            this.editaObservacion = false;
            Swal.fire({
              text: 'Actividad Actualizada',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.getUnaOrdenActividad();
            });
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
