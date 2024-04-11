import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-usuarios-clave',
  templateUrl: './editar-usuarios-clave.component.html',
  styleUrls: []
})
export class EditarUsuariosClaveComponent implements OnInit {

  title: string = "Editar Usuario";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Usuarios";
  usuario: UsuarioModel;
  loadingButton: boolean = false;
  listado: any = [];
  loading: boolean = false;  
  email: any;
  options: any = ['1', '0']; 
  estado: any;
  passwordInvalid: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _usService: UsuarioService
  ) {
    this.usuario = new UsuarioModel();
    this.activatedRoute.params.subscribe(params => {
      this.email = params['email']; 
    });  
  }

  ngOnInit() {
    this.loading = true;
    this._usService
        .getUsuarioEmailFromAdmin(this.email)
        .subscribe((res: any) => {    
          this.loading = false;  
          this.listado = res['usuarioDB'];  
          this.usuario._id = this.listado._id;
          this.usuario.nombre = this.listado.nombre;
          this.usuario.email = this.listado.email;
        }, error => {
          this.error();
        });
  }

  validatePassword(password: string): boolean {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*+#?&])[a-zA-Z\d@$!%*+#?&]{8,}$/;

    const match = regex.exec(password);

    if (match) return true;

    return false
  }

  onchangePassword = () => {
    this.passwordInvalid = false;
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    if (!this.validatePassword(this.usuario.password)) {
      this.passwordInvalid = true;
      return;
    }

    this.loadingButton = true;    
    this._usService
        .putUsuarioClave(
          this.usuario._id,
          this.usuario.password
        ).subscribe((res: any) => { 
          if (res.ok == true) {
            this.loadingButton = false;    
            Swal.fire({    
              text: 'Usuario editado',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loadingButton = false;
              this.router.navigate(['/listarusuarios']);
            });                  
          } else {
            this.error();
          }         
        }, error => {
          this.error();
        });   
  }

  error() {
    this.loadingButton = false;
    Swal.fire({    
      text: 'Ocurrió un error, contacte al administrador',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
