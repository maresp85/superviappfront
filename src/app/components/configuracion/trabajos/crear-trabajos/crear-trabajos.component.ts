import { Component, OnInit } from '@angular/core';
import { TrabajoModel } from 'src/app/models/trabajo.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-trabajos',
  templateUrl: './crear-trabajos.component.html',
  styleUrls: []
})

export class CrearTrabajosComponent implements OnInit {

  title: string = 'Trabajos';
  breadcrumbtitle: string = 'Configuración';
  breadcrumbtitle2: string = 'Trabajos';
  listadoEmpresa: any = [];
  loading: boolean = false;
  trabajo: TrabajoModel;
  loadingButton: boolean = false;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService,
  ) {
    this.trabajo = new TrabajoModel();
  }

  ngOnInit() {
    this.validateRole();
    this.getEmpresa();
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

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.loadingButton = true;

    this._conService.crearTrabajo(
      this.trabajo.nombre,
      this.trabajo.fechaMejora,    
      this.trabajo.legalizaCualquierOrden,
      this.trabajo.bitacora,
      this.trabajo.empresa
    ).subscribe((res: any) => {
      if (res.ok == true) {
        Swal.fire({
          text: 'Trabajo creado',
          icon: 'success',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then((result) => {
          this.loadingButton = false;
          this.router.navigate(['/listartrabajos']);
        });
      } else {
        this.error('Error');
      }
    }, error => {      
      this.error(error);
    });
  }

  error(error: any) {
    this.loadingButton = false;
    if (error.error.err.message == "Token no válido") {
      this.router.navigate(["/login"]);
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
