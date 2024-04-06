import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-legalizar-ordenes',
  templateUrl: './legalizar-ordenes.component.html',
  styleUrls: []
})
export class LegalizarOrdenesComponent implements OnInit {

  title: string = "Legalizar Orden de Trabajo";
  breadcrumbtitle: string = "Gestión";
  breadcrumbtitle2: string = "Legalización Ordenes";
  url: any = environment.url + environment.uploadfirmas;
  ordenActividad: any[] = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  existsFile: boolean = false;
  disabledbutton: boolean = true;
  existeimagen: boolean = false;
  fechaMejora: boolean = false;
  files: Array<File> = [];
  files2: Array<File> = [];
  subtitle: string = '';
  imgfirma: any;
  isChecked: any = [];
  listado: any = [];
  observaciones: any;
  orden: any = [];
  _actividad: any;
  usuarioDB: any;
  cumple: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _usService: UsuarioService,
              private _orService: OrdenesService) {
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
                  .getUnUsuario()
                  .subscribe((res: any) => {
                    this.usuarioDB = res['usuarioDB'];
                    this.imgfirma = this.url + this.usuarioDB.imgfirma;
                  }, (err: any) => {
                    this.error();
                  });
                  this._orService.getUnaOrden(this.ordenActividad[0].ordentrabajo._id)
                      .subscribe((res: any) => {
                        this.orden = res.ordentrabajoDB[0];
                        this.fechaMejora = this.orden.trabajo.fechaMejora;
                        this.loading = false;
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
    let disabled = false;
    this.isChecked[pos] = true;
    //se revisa si todos los indices son true
    for (let _i = 0; _i < this.listado.length; _i++) {
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
    this.loadingButton = true;
    this._orService
        .putEstadoOrdenActividad(
          this._actividad,
          this.cumple,
          this.usuarioDB._id,
          this.files,
          this.files2,
          this.observaciones,
          this.fechaMejora
        ).subscribe((res: any) => {
          if (res.ok == true) {
            this.loadingButton = false;
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
