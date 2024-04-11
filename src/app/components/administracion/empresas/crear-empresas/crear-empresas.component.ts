import { Component, OnInit } from '@angular/core';
import { EmpresaModel } from 'src/app/models/empresa.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-empresas',
  templateUrl: './crear-empresas.component.html',
  styleUrls: []
})

export class CrearEmpresasComponent implements OnInit {
 
  title: string = "Empresas";
  breadcrumbtitle: string = "Administración";
  breadcrumbtitle2: string = "Empresas";
  empresa: EmpresaModel;
  existsFile: boolean = false;
  loadingButton: boolean = false;
  logoImage: File = null;

  constructor(
    private router: Router,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService,
  ) {
    this.empresa = new EmpresaModel();
    _usService.leerRoleUsuario()
  }

  ngOnInit() {
    this.validateRole();
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  // Cargue de la firma digital
  logoUpload(fileInput: any) {
    this.logoImage = <File>fileInput.target.files[0];
  }

  onSubmit(form: NgForm) {
  
    if ( form.invalid ) { return; }

    if (this.logoImage == null) {
      this.existsFile = true;
      return;
    } else {
      this.existsFile = false;
    }

    this.loadingButton = true;
     
    this._conService.crearEmpresa(
      this.empresa.nombre,
      this.empresa.ubicacion,
      this.empresa.telefono,
      this.empresa.activo,
      this.logoImage
    ).subscribe((res: any) => { 
      if (res.ok == true) {
        Swal.fire({    
          text: 'Empresa creada',
          icon: 'success',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then((result) => {
          this.loadingButton = false;
          this.router.navigate(['/listarempresas']);
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
