import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-trabajos',
  templateUrl: './listar-trabajos.component.html',
  styleUrls: []
})
export class ListarTrabajosComponent implements OnInit {

  title: string = 'Trabajos';
  breadcrumbtitle: string = 'Configuración';
  breadcrumbtitle2: string = 'Trabajos';
  extraFieldsList: any = [];
  newExtraField: string;
  editExtraField: string;
  indexEditExtraField: any;
  listado: any = [];
  loading: boolean = false;
  showModalExtraFields: boolean = false;
  showModalEditExtraFields: boolean = false;  
  _trabajo: any;
  p: number = 1;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService,
  ) { }

  ngOnInit() {
    this.validateRole();
    this.getTrabajo();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getTrabajo() {
    this.loading = true;
    this._conService
        .getTrabajo()
        .subscribe((res: any) => {
          this.listado = res['trabajoDB'];
          this.loading = false;
        }, (err: any) => {
          this.error(err);
        });
  }

  modalExtraFields = (trabajo: any) => {
    this._trabajo = trabajo._id;
    this.extraFieldsList = trabajo.extraFields;
    this.showModalExtraFields = true;
  }

  deleteExtraField = (element: any) => {
    Swal.fire({    
      text: '¿Está seguro que desea eliminar este campo extra permanentemente?',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,      
      cancelButtonColor: '#aaa',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.value == true) {
        let index = this.extraFieldsList.indexOf(element);
        this.extraFieldsList.splice(index, 1);
        this.handleExtraFields('Campo extra eliminado correctamente.')
        .then(() => {});
      } 
    });
  }

  modalEditExtraField = (element: any) => {    
    this.indexEditExtraField = this.extraFieldsList.indexOf(element);
    this.editExtraField = element;
    this.showModalExtraFields = false;
    this.showModalEditExtraFields = true;
  }

  onSubmitExtraFields(form: NgForm) {  
    if (form.invalid) { return; }
    
    this.extraFieldsList.push(this.newExtraField.toUpperCase());
    this.handleExtraFields('Nuevo campo extra agregado correctamente.')
        .then(() => {
          form.resetForm();;
        })
  }

  onSubmitEditExtraFields(form: NgForm) {  
    if (form.invalid) { return; }
    
    this.extraFieldsList[this.indexEditExtraField] = this.editExtraField.toUpperCase();
    this.handleExtraFields('Campo extra editado correctamente.')
        .then(() => {
          form.resetForm();
          this.showModalEditExtraFields = false;
          this.showModalExtraFields = true;
        })
  }

  handleExtraFields = (message: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        this.loading = true;
        this._conService.addTrabajoExtraFields(this._trabajo, this.extraFieldsList)
            .subscribe((res: any) => {
                if (res.ok === true) {
                  this.loading = false;
                  Swal.fire({
                    text: message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                  }).then((result) => {
                      this.getTrabajo();
                      resolve();
                  });
                } else {
                  this.loading = false;
                  this.error('Ocurrió un error, intente de nuevo');
                  reject();
                }
            }, (err: any) => {
                this.loading = false;
                this.error('Ocurrió un error, intente de nuevo');
                reject();
            });
    });
  }

  deleteTrabajo(_id: any) {
    Swal.fire({    
      text: '¿Está seguro que desea eliminar este trabajo permanentemente?',
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
            .deleteTrabajo(_id)
            .subscribe((res: any) => {      
              this.loading = false;          
              if (res['ok'] == true) {
                this.getTrabajo();
                Swal.fire({    
                  text: 'Tipo de Trabajo Eliminado',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false
                }).then((result: any) => { });     
              }                        
            }, error => {
              this.error(error);
            });
      } 
    });
  }

  error(error: any) {
    this.loading = false;
    if (error.error.err.message === 'Token no válido') {
      this.router.navigate(['/login']);
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
