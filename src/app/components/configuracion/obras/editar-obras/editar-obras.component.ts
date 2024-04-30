import { Component, OnInit } from '@angular/core';
import { ObraModel } from 'src/app/models/obra.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-obras',
  templateUrl: './editar-obras.component.html',
  styleUrls: []
})
export class EditarObrasComponent implements OnInit {

  title: string = "Editar aliado";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Aliados";
  obra: ObraModel;
  loadingButton: boolean = false;
  listadoObra: any = [];
  loading: boolean = false;  
  _obra: any;
  activo: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    public _usService: UsuarioService
  ) {
    this.obra = new ObraModel();
    this.activatedRoute.params.subscribe(params => {
      this._obra = params['_obra']; 
    });  
  }

  ngOnInit() {
    this.validateRole();
    this.getObras();  
  }

  getObras = () => {
    this.loading = true;
    this._conService
        .getUnaObra(this._obra)
        .subscribe((res: any) => {    
            this.loading = false;  
            this.listadoObra = res['obraDB'][0];  
            this.obra.nombre = this.listadoObra.nombre;
            this.obra.direccion = this.listadoObra.direccion;
            this.obra.activo = this.listadoObra.activo ? 1 : 0;
            this.loading = false;
        }, error => {
          this.error();
        });
  }

  validateRole = () => {
    if (this._usService.leerRoleUsuario() !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;    
    this._conService.putObra(
      this._obra,
      this.obra.nombre,
      this.obra.direccion,
      this.obra.activo
    ).subscribe((res: any) => { 
        if (res.ok == true) {
          this.loadingButton = false;    
          Swal.fire({    
            text: 'Aliado editado',
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
    this.loading = false;
    this.loadingButton = false;
    Swal.fire({    
      text: 'Ocurrió un error, contacte al administrador',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
