import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ReporteModel } from 'src/app/models/reporte.model';
import { ReportesService } from 'src/app/services/reportes.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cargar-imagenes',
  templateUrl: './cargar-imagenes.component.html',
  styleUrls: []
})
export class CargarImagenesComponent implements OnInit {

  @ViewChild('Image') InputImage: ElementRef;

  title: string = "Cargar imágenes al reporte semanal";
  breadcrumbtitle: string = "Reportes";
  breadcrumbtitle2: string = "Semanales";
  file: File;
  imagenes: any = [];
  loadingButton: boolean = false;
  loading: boolean = false;
  reporte: ReporteModel;
  urluploadimgreportes: any = environment.url + environment.uploadimgreportes;
  _id: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _repoService: ReportesService,
              public _usService: UsuarioService) {

    if (this._usService.leerRoleUsuario() == '' ||
        this._usService.leerEmailUsuario() == '' ||
        this._usService.leerEmpresaUsuario() == '' ||
        this._usService.leerIDUsuario() == '') {
          this.router.navigate(["/login"]);
    }

    this.reporte = new ReporteModel();
    this.activatedRoute.params.subscribe(params => {
      this._id = params['_reporte'];
    });
  }

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this._repoService.getImgReporte(this._id)
                     .subscribe((res: any) => {
                        this.imagenes = res['imgreporteDB'];
                      }, error => {
                        this.error();
                      });
  }

  fileUpload(event: any) {
    this.file = <File>event.target.files[0];
  }

  onSubmit(form: NgForm) {

    if (form.invalid) { return; }

    if (!this.file) {
      Swal.fire({
        text: 'Seleccione una imagen',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      return;
    }

    this.loadingButton = true;
    this._repoService.putReporte(this._id,
                                 this.reporte.titulo,
                                 this.file)
                      .subscribe((res: any) => {
                        if (res.ok == true) {
                          this.loadingButton = false;
                          Swal.fire({
                            text: 'Imagen cargada al reporte',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false
                          }).then((result) => {
                            this.loadingButton = false;
                            this.imagenes = res['imgreporteDB'];
                            this.InputImage.nativeElement.value = '';
                            form.resetForm();
                          });
                        } else {
                          this.error();
                        }
                      }, error => {
                        this.error();
                      });
  }

  deleteImagen(_id: any) {
    this._repoService.deleteImgReporte(_id, this._id)
                     .subscribe((res: any) => {
                        if (res.ok == true) {
                          this.loadingButton = false;
                          Swal.fire({
                            text: 'Imagen eliminada correctamente',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false
                          }).then((result) => {
                            this.loadingButton = false;
                            this.imagenes = res['imgreporteDB'];
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
