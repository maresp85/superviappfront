import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userservice: UsuarioService,
              private router: Router ) {} 

  canActivate(): boolean {
   
    if (this.userservice.estaAutenticado()){    
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true   
  }
  
}
