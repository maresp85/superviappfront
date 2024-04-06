import { Component } from '@angular/core';
import { UsuarioService } from './services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sistemaordenes';

  constructor(private router: Router,
              private _usService: UsuarioService) {

    if (this._usService.leerRoleUsuario() == '' || 
        this._usService.leerEmailUsuario() == '' ||
        this._usService.leerEmpresaUsuario() == '' ||
        this._usService.leerIDUsuario() == '') {
          this.router.navigate(["/login"]);
    }

  }
}
