import { Component, OnInit } from '@angular/core';
import { ObraModel } from 'src/app/models/obra.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-obras',
  templateUrl: './crear-obras.component.html',
  styleUrls: []
})

export class CrearObrasComponent implements OnInit {
 
  title: string = 'Crear aliado';
  breadcrumbtitle: string = 'Configuración';
  breadcrumbtitle2: string = 'Aliados';
  listadoEmpresa: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  obra: ObraModel;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService
  ) {
    this.obra = new ObraModel();
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
        this.error();
      });
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;
     
    this._conService
        .crearObra(
          this.obra.nombre,
          this.obra.direccion,
          this.obra.empresa
        ).subscribe((res: any) => { 
          if (res.ok == true) {
            Swal.fire({    
              text: 'Aliado creado',
              icon: 'success',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            }).then((result) => {
              this.loadingButton = false;
              this.router.navigate(['/listarobras']);
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
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }

}
