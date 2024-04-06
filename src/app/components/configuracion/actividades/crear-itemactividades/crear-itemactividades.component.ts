import { Component, OnInit } from '@angular/core';
import { ItemActividadModel } from 'src/app/models/itemactividad.model';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-itemactividades',
  templateUrl: './crear-itemactividades.component.html',
  styleUrls: []
})
export class CrearItemActividadesComponent implements OnInit {

  title: string = "Crear item";
  breadcrumbtitle: string = "Actividades";
  breadcrumbtitle2: string = "Items";
  itemactividad: ItemActividadModel;
  loadingButton: boolean = false;
  loading: boolean = false;
  actividad: any;
  empresa: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _conService: ConfiguracionService,
              private _usService: UsuarioService) {
    this.itemactividad = new ItemActividadModel();
    this.activatedRoute.params.subscribe(params => {
      this.actividad = params['actividad'];  
    });
  }

  ngOnInit() {
    this.empresa = this._usService.leerEmpresaUsuario();
  }  

  onSubmit(form: NgForm) {   
  
    if (form.invalid) { return; }

    this.loadingButton = true;    
    this._conService.crearItemActividad(this.empresa,
                                        this.actividad,
                                        this.itemactividad.cumple,
                                        this.itemactividad.tipo,
                                        this.itemactividad.etiqueta,
                                        this.itemactividad.imagen)
                    .subscribe((res: any) => { 
                      if (res.ok == true) {
                        this.loadingButton = false;    
                        Swal.fire({    
                          text: 'Item de Actividad creado',
                          icon: 'success',
                          confirmButtonText: 'OK',
                          allowOutsideClick: false
                        }).then((result) => {
                          this.loadingButton = false;
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
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }
}
