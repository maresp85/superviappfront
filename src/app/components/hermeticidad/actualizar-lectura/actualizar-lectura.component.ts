import { Component, OnInit } from '@angular/core';
import { LecturaModel } from '../../../models/lectura.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { HermeticidadService } from 'src/app/services/hermeticidad.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-actualizar-lectura',
  templateUrl: './actualizar-lectura.component.html',
  styleUrls: []
})
export class ActualizarLecturaComponent implements OnInit {

  title: string = "Actualizar Lectura";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Hermeticidad";
  existsFile: boolean = false;
  _hermeticidad: any;
  _id: any;
  hermeticidad: any;
  loadingButton: boolean = false;
  loading: boolean = false;
  image: File = null;
  lectura: LecturaModel = new LecturaModel();

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public _usService: UsuarioService,
              private _herService: HermeticidadService) {

    this.activatedRoute.params.subscribe(params => {
      this._id = params['_id'];
      this._hermeticidad = params['_hermeticidad'];
      this.hermeticidad = params['hermeticidad'];
    });
  }

  ngOnInit(): void {

  }

   // Cargue de imagen
  fileUpload(fileInput: any) {
    this.image = <File>fileInput.target.files[0];
  }

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    this.existsFile = false;
    if (this.image == null) {
      this.existsFile = true;
      return;
    }

    this.loadingButton = true;
    this._herService.actualizarLectura(this._id,
                                       this.lectura.lectura_final,
                                       this.lectura.fecha_final,
                                       this.image)
                    .subscribe((res: any) => {
                      if (res.ok == true) {
                        this.loadingButton = false;
                        Swal.fire({
                          text: 'Lectura Actualizada',
                          icon: 'success',
                          confirmButtonText: 'OK',
                          allowOutsideClick: false
                        }).then((result) => {
                          this.loadingButton = false;
                          this.router.navigate(['/listarlectura', this.hermeticidad, this._hermeticidad]);
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
    this.loading = false;
    Swal.fire({
      text: 'Ocurrió un error, intente de nuevo',
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

}
