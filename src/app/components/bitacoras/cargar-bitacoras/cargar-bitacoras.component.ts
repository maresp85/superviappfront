import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cargar-bitacoras',
  templateUrl: './cargar-bitacoras.component.html',
  styleUrls: []
})
export class CargarBitacorasComponent implements OnInit {

  title: string = 'Notas Bitácora';
  breadcrumbtitle: string = 'Gestión';
  breadcrumbtitle2: string = 'Consulta Nota Bitácoras';
  listadoActividades: any = [];
  fechaMejora: boolean;
  loadingButton: boolean = false;
  loading: boolean = false;
  idviga: any;
  listado: any = [];
  ordenes: any;
  _ordenes: any;
  pb: number = 1;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _orService: OrdenesService,
    public _usService: UsuarioService
  ) {

    if (
      this._usService.leerRoleUsuario() == '' ||
      this._usService.leerEmailUsuario() == '' ||
      this._usService.leerEmpresaUsuario() == '' ||
      this._usService.leerIDUsuario() == ''
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
    this.initialData();
  }

  initialData() {
    this.loading = true;
    this._orService
        .getUnaOrden(this._ordenes)
        .subscribe((res: any) => {
          this.fechaMejora = res.ordentrabajoDB[0].trabajo.fechaMejora;          
          this.idviga = res.ordentrabajoDB[0].idviga;
        }, (err: any) => {
          this.error("Ocurrió un error al consultar la orden, intente de nuevo")
        });

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

  cerrarNota(_id: any) {    
    Swal.fire({
      text: '¿Está seguro de cerrar esta Nota?',
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
        this._orService
          .cerrarNota(_id)
          .subscribe((res: any) => {
            this.loading = false;
            if (res['ok'] == true) {
              this.initialData();
              Swal.fire({
                text: 'Nota Cerrada',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then((result) => { });
            }
          }, (err: any) => {
            console.log(err);
            this.error(err);
          });
      }
    });
  }

  consultarActividad(actividad: any) {
    this.router.navigate(['/listarnota', actividad]);
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
