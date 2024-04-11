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
  email: string = '';
  fechaMejora: boolean = false;
  files: Array<File> = [];
  files2: Array<File> = [];
  subtitle: string = '';
  imgfirma: any; 
  checkList: any = [];
  listado: any = [];
  observaciones: any;
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
    this.getUnaOrden();
  }

  getUnaOrden = () => {
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
                this.setInformationCheck(this.listado);

                this._usService
                  .getUsuarioEmail(this.email)
                  .subscribe((res: any) => {
                    this.usuarioDB = res['usuarioDB'];
                    this.imgfirma = this.url + this.usuarioDB.imgfirma;
                  }, (err: any) => {
                    this.error('Ocurrió un error.');
                  });
                  this._orService.getUnaOrden(this.ordenActividad[0].ordentrabajo._id)
                      .subscribe((res: any) => {
                        this.orden = res.ordentrabajoDB[0];
                        this.fechaMejora = this.orden.trabajo.fechaMejora;
                        this.loading = false;
                      }, (err: any) => {
                        this.error('Ocurrió un error.');
                      });
              }, (err: any) => {
                this.error('Ocurrió un error.');
              });
        }, (err: any) => {
          this.error('Ocurrió un error.');
        });
  }

  setInformationCheck = (res: any) => {
    let temp: any = []; 
    res.forEach((item: any) => {           
      temp.push({ 
        _id: item._id, 
        etiqueta: item.etiqueta, 
        tipo: item.tipo,
        isChecked: false,
        fechaMejora: '',
      });           
    });        
    this.checkList = temp;    
  }

  checkboxChange = (_id: any) => {
    let temp: any = this.checkList.map((item: any) => {
      if (_id === item._id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    this.checkList = temp;    
  };

  verifiedDates(dateReference: any): boolean {
    const currentDate = new Date();
    return new Date(dateReference) < currentDate;
  }

  onChangeFechaMejora = (itemId: any, fechaMejora: any) => {
    if (this.verifiedDates(fechaMejora)) {
      this.error('La fecha seleccionada debe ser mayor a la fecha actual.');
      return;
    }
    let temp: any = this.checkList.map((item: any) => {
      if (itemId === item._id) {
        return { ...item, fechaMejora: fechaMejora };
      }
      return item;
    });
    this.checkList = temp;
  }

  fileUpload =(event: any, tipo: any) => {
    if (event.target.files.length > 2) {
      this.error('Solo se permiten dos imágenes');
      return;
    }
    if (tipo === 'EVIDENCIAS') {
      this.files = event.target.files;
    } else {
      this.files2 = event.target.files;
    }
  }

  legalizarOrdenActividad = () => {
    this.loadingButton = true;
    this._orService
        .putEstadoOrdenActividad(
          this._actividad,
          this.cumple,
          this.usuarioDB._id,
          this.files,
          this.files2,
          this.observaciones,
          this.fechaMejora,
          this.checkList,
        ).subscribe((res: any) => {
          if (res.ok == true) {
            this.loadingButton = false;
            Swal.fire({
              text: 'Orden Legalizada correctamente',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.router.navigate(['/cargarordenes', this.orden.id, this.orden._id]);
            });
          } else {
            this.error('Ocurrió un error.');
          }
        }, (err: any) => {
          this.error('Ocurrió un error.');
        });
  }

  error(msg: string) {
    this.loading = false;
    this.loadingButton = false;
    Swal.fire({
      text: msg,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
