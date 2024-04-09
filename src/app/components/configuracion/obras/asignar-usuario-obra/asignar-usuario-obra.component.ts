import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignar-usuario-obra',
  templateUrl: './asignar-usuario-obra.component.html',
  styleUrls: []
})
export class AsignarUsuarioObraComponent implements OnInit {

  title: string = "Asignar usuario a un aliado";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Aliados";
  empresa: any;
  loadingButton: boolean = false;
  listadoEmpresa: any = [];
  listadoUsuario: any = [];
  listadoObraUsuario: any = [];
  loading: boolean = false;  
  _obra: any;
  usuarioId: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this._obra = params['_obra']; 
    });  
  }

  ngOnInit() {
    this.validateRole();
    this.getEmpresa();
    this.usuarioObra();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  getEmpresa = () => {
    this.loading = true;
    this._conService
      .getEmpresa()
      .subscribe((res: any) => {
        this.loading = false;
        this.listadoEmpresa = res['empresaDB'];
      }, (error: any) => {
        this.error(error);
      });
  }

  usuarioObra = () => {    
    this.loading = true;
    this._conService
        .getObraUsuario(this._obra)
        .subscribe((res: any) => {
          this.loading = false;
          this.listadoObraUsuario = res['obrausuarioDB'];       
        }, (error: any) => {
          this.error('Ocurrió un error, contacte al administrador');
        });    
  }

  onChangeStateEmpresa = (empresa: any) => {
    this.empresa = empresa;
    this._usService
        .getUsuarioEmpresa(empresa)
        .subscribe((res: any) => {        
          this.listadoUsuario = res['usuarioDB'];   
          this.loading = false;
        }, (error: any) => {
          this.error('Ocurrió un error, contacte al administrador');
        });
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;    
    this._conService
        .asignarObraUsuario(
          this._obra,
          this.usuarioId,
          this.empresa
        ).subscribe((res: any) => { 
          if (res.ok == true) {
            this.loadingButton = false;
            this.loading = false;   
            this.usuarioObra();
            form.resetForm();
            Swal.fire({    
              text: 'Usuario asignado correctamente',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loadingButton = false;              
            });                  
          } else {
            this.error('Ocurrió un error, contacte al administrador');
          }         
        }, (error: any) => {
          console.log(error.error.err)
          this.error(error.error.err);
        }); 
  }

  deleteObraUsuario(_id: any) {
    Swal.fire({    
      text: '¿Está seguro que desea retirar este usuario del aliado?',
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
            .deleteObraUsuario(_id)
            .subscribe((res: any) => {      
              this.usuarioObra();     
              if (res['ok'] == true) {                
                Swal.fire({    
                  text: 'Usuario retirado del aliado',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false
                }).then((result: any) => { });     
              }                        
            }, error => {
              this.error('Ocurrió un error, contacte al administrador');
            });
      } 
    });
  }

  back() {
    this.router.navigate(['/listarobras']);
  }

  error(err: any) {
    this.loading = false;
    this.loadingButton = false;
    Swal.fire({    
      text: err,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
