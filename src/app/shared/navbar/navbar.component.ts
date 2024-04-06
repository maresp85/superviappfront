import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {

  constructor(public router: Router,
              public _usService: UsuarioService) { }

  ngOnInit() {
  }

  cerrarSesion() {    
    this._usService.cerrar_sesion().then(()=>{
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      
      Toast.fire({
        icon: 'success',
        title: 'Cerrando sesión'
      })
      this.router.navigateByUrl('/login');
    });    
  }

}
