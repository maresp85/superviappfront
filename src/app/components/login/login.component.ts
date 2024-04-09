import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd  } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioModel } from '../../models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  usuario: UsuarioModel;
  loadingButton: boolean = false;
  
  constructor(
    private router: Router,
    private _usService: UsuarioService
  ) { }

  ngOnInit() {
    this.usuario = new UsuarioModel();
   }  

    // Login de usuario
  onSubmit(form: NgForm) { 
    
    if (form.invalid) { return; }

    this.loadingButton = true;
    this._usService
        .autenticarUsuario(this.usuario.email, this.usuario.password)
        .subscribe((res: any) => { 
          if (res.ok == true) {
            this.loadingButton = false;
            
            let empresa: any = null;
            let empresaNombre: any = null;

            if (res.usuarioDB.empresa[0]) {
              empresa = res.usuarioDB.empresa[0]._id;
              empresaNombre = res.usuarioDB.empresa[0].nombre;
            }

            this._usService.guardarLocalUsuario(
              res.usuarioDB._id,
              res.usuarioDB.email,
              res.usuarioDB.role,
              res.usuarioDB.nombre,
              empresa,
              empresaNombre,
              res.token,
            )
            .then(() => {
              this.router.navigate(['/home']);
            }).catch(() => {});
          } else {                        
            this.error('Ocurrió un error. Intente nuevamente');
          }         
    }, (err: any) => {
      this.error(err.error.err.message);
    }); 

  }

  error(msj: any) {
    this.loadingButton = false;
    Swal.fire({    
      text: msj,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });               
  }

}