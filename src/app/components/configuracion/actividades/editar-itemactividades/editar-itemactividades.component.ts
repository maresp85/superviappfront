import { Component, OnInit } from '@angular/core';
import { ItemActividadModel } from 'src/app/models/itemactividad.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-itemactividades',
  templateUrl: './editar-itemactividades.component.html',
  styleUrls: []
})
export class EditarItemActividadesComponent implements OnInit {

  title: string = "Editar item";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Items";
  itemactividad: ItemActividadModel;
  loadingButton: boolean = false;
  listado: any = [];
  loading: boolean = false;  
  actividad: any;
  item: any;
  cumple: any;
  imagen: any;
  activo: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _conService: ConfiguracionService,
    private _usService: UsuarioService
  ) {
    this.itemactividad = new ItemActividadModel();
    this.activatedRoute.params.subscribe(params => {
      this.item = params['item']; 
      this.actividad = params['actividad']; 
    });  
  }

  ngOnInit() {
    this.validateRole();
    this.getItemsActividades();
  }

  getItemsActividades = () => {
    this.loading = true;  
    this._conService
        .getUnItemActividad(this.item)
        .subscribe((res: any) => {                            
          this.listado = res['itemactividadDB'][0];  
          this.itemactividad.tipo = this.listado.tipo;
          this.itemactividad.etiqueta = this.listado.etiqueta;
          this.itemactividad.cumple = this.listado.cumple ? 1 : 0;
          this.itemactividad.imagen = this.listado.imagen ? 1 : 0;
          this.itemactividad.activo = this.listado.activo ? 1 : 0;
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
    this._conService.putItemActividad(
      this.item,
      this.itemactividad.cumple,
      this.itemactividad.tipo,
      this.itemactividad.etiqueta,
      this.itemactividad.imagen,
      this.itemactividad.activo
    ).subscribe((res: any) => { 
        if (res.ok == true) {
          this.loadingButton = false;    
          Swal.fire({    
            text: 'Item Editado',
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false
          }).then((result) => {
            this.router.navigate(['/listaritemactividades', this.actividad]);
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
