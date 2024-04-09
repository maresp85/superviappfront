import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-itemactividades',
  templateUrl: './listar-itemactividades.component.html',
  styleUrls: []
})
export class ListarItemActividadesComponent implements OnInit {

  title: string = "Items actividad";
  breadcrumbtitle: string = "Configuración";
  breadcrumbtitle2: string = "Items";
  loading: boolean = false;
  listado: any = [];
  titulo: any;
  actividad: any;

  constructor(private activatedRoute: ActivatedRoute,
              private _conService: ConfiguracionService,
              public _usService: UsuarioService) {
    this.activatedRoute.params.subscribe(params => {
      this.actividad = params['actividad'];  
    });
            
  }

  ngOnInit() {
    this.getItemsActividad();
  }

  getItemsActividad() {
    this.loading = true;  
    this._conService.getItemsActividad(this.actividad)
                    .subscribe((res: any) => {                
                      this.listado = res['itemactividadDB']; 
                      this._conService.getUnaActividad(this.actividad)
                                      .subscribe((res: any) => {    
                                        this.loading = false;        
                                        this.titulo = res['actividadDB'];                                   
                                      }, error => {
                                        this.error();
                                      });
                    }, error => {
                      this.error();
                    });
  }

  deleteItemsActividad(_id: any) {
    Swal.fire({    
      text: '¿Está seguro que desea eliminar este item permanentemente?',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,      
      cancelButtonColor: '#aaa',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.value == true) {
        this.loading = true;  
        this._conService.deleteItemActividad(_id)
                        .subscribe((res: any) => {      
                          this.loading = false;          
                          if (res['ok'] == true) {
                            this.getItemsActividad();
                            Swal.fire({    
                              text: 'Item Eliminado',
                              icon: 'success',
                              confirmButtonText: 'OK',
                              allowOutsideClick: false
                            }).then((result) => { });     
                          }                        
                        }, error => {
                          this.error();
                        });
      } 
    });
  }

  error() {
    this.loading = false;   
    Swal.fire({    
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });                    
  }

}
