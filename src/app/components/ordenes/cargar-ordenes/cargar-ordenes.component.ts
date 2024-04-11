import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/services/ordenes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgForm } from '@angular/forms';
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
  extraFields: any = [];
  inputValues: { [key: string]: any } = {};
  listadoActividades: any = [];
  fechaMejora: boolean;
  signatureImage: File = null;
  loadingButton: boolean = false;
  loading: boolean = false;
  listado: any = [];
  ordenes: any;
  ordenTrabajo: any = [];
  _ordenes: any;
  showModalExtraFields: boolean = false;
  showSignatureButton: boolean = false;
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
      this.router.navigate(['/login']);
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
          this.ordenTrabajo = res.ordentrabajoDB[0];
          this.fechaMejora = this.ordenTrabajo.trabajo.fechaMejora;
          
          if (
            this.ordenTrabajo.extraFields.length > 0 
            && this.ordenTrabajo.extraFieldsData.length === 0
          ) {
            this.extraFields = this.ordenTrabajo.extraFields;
            this.showModalExtraFields = true;
          }
          
          this.getOrdenesTipoTrabajo();
        }, (err: any) => {
          this.error("Ocurrió un error al consultar la orden, intente de nuevo")
        });
  }
  
  getOrdenesTipoTrabajo = () => {
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

  onSubmit(form: NgForm) {
  
    if (form.invalid) { return; }

    if (Object.keys(this.inputValues).length< this.extraFields.length) { 
      this.error('Todos los campos deben ser diligenciados.')
      return; 
    }

    const extraFieldsList = Object.entries(this.inputValues).map(([field, value]) => ({ field, value }));

    this.loading = true;
    this.showModalExtraFields = false;

    this._orService
        .updateExtraFieldsData(
          this.ordenTrabajo._id,
          extraFieldsList,
        ).subscribe((res: any) => { 
          if (res.ok === true) {
            form.resetForm();
            Swal.fire({    
              text: 'Datos enviados correctamente.',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loading = false;            
              this.unaOrden();
            });                  
          } else {
            this.error('Ocurrió un error, intente de nuevo');
          }         
        }, (err: any) => {
          this.error('Ocurrió un error, intente de nuevo');
        });
  }

  goToOrdenes = () => {
    this.router.navigate(['/listarordenes']);
  }

   // Legaliza orden de trabajo
  legalizarActividad(actividad: any) {
    Swal.fire({
      text: 'Legalización de Actividad',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'CUMPLE <i class="fa fa-thumbs-up"></i>',
      cancelButtonText: 'NO CUMPLE <i class="fa fa-thumbs-down"></i>',
      denyButtonText: 'N/A',
      denyButtonColor: '#7c7c7c',
    }).then((result: any) => {
      if (result.value == true) {
        this.router.navigate(['/legalizarordenes', actividad, 1]);
      } else if (result.dismiss == 'cancel') {
        this.router.navigate(['/legalizarordenes', actividad, 0]);
      } else {
        this.deleteOrdenActividad(actividad);
      }
    });
  }

  // Re-Legaliza orden de trabajo
  reLegalizarActividad(actividad: any) {
    Swal.fire({
      text: 'Legalizar nuevamente Actividad',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'CUMPLE <i class="fa fa-thumbs-up"></i>',
      cancelButtonText: 'NO CUMPLE <i class="fa fa-thumbs-down"></i>',
      denyButtonText: 'N/A',
      denyButtonColor: '#7c7c7c',
    }).then((result: any) => {
      if (result.value == true) {
        this.router.navigate(['/relegalizarordenes', actividad, 1]);
      } else if (result.dismiss == "cancel") {
        this.router.navigate(['/relegalizarordenes', actividad, 0]);
      } else {
        this.deleteOrdenActividad(actividad);
      }
    });
  }

  deleteOrdenActividad(actividad: any) {    
    Swal.fire({
      text: '¿Está seguro que desea eliminar esta actividad permanentemente?',
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
            .deleteOrdenActividad(
              actividad
            ).subscribe((res: any) => { 
              if (res.ok === true) {   
                Swal.fire({    
                  text: 'Actividad eliminada correctamente.',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false
                }).then((result) => {
                  this.loading = false;            
                  this.unaOrden();
                });                  
              } else {
                this.error('Ocurrió un error, intente de nuevo');
              }         
            }, (err: any) => {
              this.error('Ocurrió un error, intente de nuevo');
            });        
      }
    });
  }

  fileUpload = (fileInput: any) => {
    this.signatureImage = <File>fileInput.target.files[0];
    this.showSignatureButton = true; 
  }

  sendSignatureImage = () => {
    if (this.signatureImage == null) {
      this.error('Cargue la imagen de la firma.');
      return;
    }

    this.showSignatureButton = false; 

    this._orService
        .putDigitalSignature(
          this.ordenTrabajo._id,
          this.signatureImage,
        ).subscribe((res: any) => { 
          if (res.ok === true) { 
            Swal.fire({    
              text: 'Firma digital enviada correctamente.',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loading = false;            
              this.unaOrden();
            });                  
          } else {
            this.error('Ocurrió un error, intente de nuevo');
          }         
        }, (err: any) => {
          this.error('Ocurrió un error, intente de nuevo');
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
