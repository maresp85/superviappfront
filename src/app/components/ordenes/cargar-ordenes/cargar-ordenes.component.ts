import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cargar-ordenes',
  templateUrl: './cargar-ordenes.component.html',
  styleUrls: []
})
export class CargarOrdenesComponent implements OnInit {

  title: string = 'Legalizar Orden de Trabajo';
  breadcrumbtitle: string = 'Gestión';
  breadcrumbtitle2: string = 'Legalización Ordenes';
  listadoActividades: any = [];
  fechaMejora: boolean;
  loadingButton: boolean = false;
  loading: boolean = false;
  listado: any = [];
  ordenes: any;
  ordenTrabajo: any = [];
  _ordenes: any;
  urlUploadFirmaUsuario: any = environment.url + environment.uploadImgFirmaUsuario;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _orService: OrdenesService,
    public _usService: UsuarioService,
  ) {

    if (
      this._usService.leerRoleUsuario() === '' ||
      this._usService.leerEmailUsuario() === '' ||
      this._usService.leerEmpresaUsuario() === '' ||
      this._usService.leerIDUsuario() === ''
    ) {
      this.router.navigate(["/login"]);
    }

    this.activatedRoute.params.subscribe(params => {
      this.ordenes = params['ordenes'];
      this._ordenes = params['_ordenes'];
      this.title = this.title + " N° " + this.ordenes;
    });

  }

  ngOnInit() {
    this.unaOrden();
  }
  
  unaOrden = () => {
    this.loading = true;
    this._orService
        .getUnaOrden(this._ordenes)
        .subscribe((res: any) => {
          this.fechaMejora = res.ordentrabajoDB[0].trabajo.fechaMejora;
          this.ordenTrabajo = res.ordentrabajoDB[0];
          // Llamar a getOrdenes después de obtener unaOrden
          this.getOrdenes();
        }, (err: any) => {
          this.error("Ocurrió un error al consultar la orden, intente de nuevo")
        });
  }
  
  getOrdenes = () => {
    this._orService
    .getOrdenesTipo(this._ordenes)
    .subscribe((res: any) => {
      this.listado = res['ordentipotrabajoDB'];      
      this._orService
          .getOrdenesActividades(this._ordenes, 1)
          .subscribe((res: any) => {
            this.loading = false;
            this.listadoActividades = res['ordenactividadDB'];            
          }, (err: any) => {
            this.error('Ocurrió un error, intente de nuevo');
          });
    }, (err: any) => {
      this.error('Ocurrió un error, intente de nuevo');
    });
  }  

   // Legaliza orden de trabajo
  legalizarActividad(actividad: any) {
    Swal.fire({
      text: 'Legalización de Actividad',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'CUMPLE <i class="fa fa-thumbs-up"></i>',
      cancelButtonText: 'NO CUMPLE <i class="fa fa-thumbs-down"></i>',
    }).then((result: any) => {
      if (result.value == true) {
        this.router.navigate(['/legalizarordenes', actividad, 1]);
      } else if (result.dismiss == "cancel") {
        this.router.navigate(['/legalizarordenes', actividad, 0]);
      }
    });
  }

  // Re-Legaliza orden de trabajo
  reLegalizarActividad(actividad: any) {
    Swal.fire({
      text: 'Legalizar nuevamente Actividad',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'CUMPLE <i class="fa fa-thumbs-up"></i>',
      cancelButtonText: 'NO CUMPLE <i class="fa fa-thumbs-down"></i>',
    }).then((result: any) => {
      if (result.value == true) {
        this.router.navigate(['/relegalizarordenes', actividad, 1]);
      } else if (result.dismiss == "cancel") {
        this.router.navigate(['/relegalizarordenes', actividad, 0]);
      }
    });
  }

  consultarActividad(actividad: any) {
    this.router.navigate(['/listaractividad', actividad]);
  }

  historialActividad(_actividad: any, _ordentipotrabajo: any) {
    this.router.navigate(['/listarhistactividad', _actividad, _ordentipotrabajo]);
  }

  error(txt: string) {
    this.loading = false;
    Swal.fire({
      text: txt,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
