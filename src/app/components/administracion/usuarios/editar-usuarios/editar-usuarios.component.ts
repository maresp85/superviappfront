import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.component.html',
  styleUrls: []
})
export class EditarUsuariosComponent implements OnInit {

  title: string = 'Editar Usuario';
  breadcrumbtitle: string = 'Configuración';
  breadcrumbtitle2: string = 'Usuarios';
  usuario: UsuarioModel;
  loadingButton: boolean = false;
  listado: any = [];
  listadoEmpresa: any = [];
  loading: boolean = false;
  options: any = ['1', '0'];
  email: any;
  sendemail: any;
  enterweb: any;
  entermovil: any;
  editorder: any;
  signImg: File = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService
  ) {
    this.usuario = new UsuarioModel();
    this.activatedRoute.params.subscribe(params => {
      this.email = params['email'];
    });
  }

  ngOnInit() {
    this.getEmpresa();
    this.getUser();
  }

  getUser = () => {
    this.loading = true;
    this._usService
      .getUsuarioEmailFromAdmin(this.email)
      .subscribe((res: any) => {
        this.loading = false;
        this.listado = res['usuarioDB'];
        this.usuario._id = this.listado._id;
        this.usuario.nombre = this.listado.nombre;
        this.usuario.email = this.listado.email;
        this.usuario.role = this.listado.role;
        this.usuario.empresa = this.listado.empresa[0];
        this.usuario.estado = this.listado.estado ? 1 : 0;
        this.usuario.sendemail = this.listado.sendemail ? 1 : 0;
        this.usuario.enterweb = this.listado.enterweb ? 1 : 0;
        this.usuario.entermovil = this.listado.entermovil ? 1 : 0;
        this.usuario.editorder = this.listado.editorder ? 1 : 0;
      }, (error: any) => {
        this.error(error.error.err.message);
      });
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

  // Cargue de la firma digital
  signUpload(fileInput: any) {
    this.signImg = <File>fileInput.target.files[0];
  }

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.loadingButton = true;
    this._usService.putUsuario(
      this.usuario._id,
      this.usuario.nombre,
      this.usuario.email,
      this.usuario.role,
      this.usuario.empresa,
      this.usuario.estado,
      this.usuario.sendemail,
      this.usuario.enterweb,
      this.usuario.entermovil,
      this.usuario.editorder,
      this.signImg
    ).subscribe((res: any) => {
      if (res.ok == true) {
        this.loadingButton = false;
        Swal.fire({
          text: 'Usuario Editado',
          icon: 'success',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then((result: any) => {
          this.loadingButton = false;
          this.router.navigate(['/listarusuarios']);
        });
      } else {
        this.error('Error al editar el usuario');
      }
    }, (error: any) => {
      this.error(error.error.err.message);
    });
  }

  error(error: any) {
    this.loading = false;
    this.loadingButton = false;
    Swal.fire({
      text: error,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }
}
