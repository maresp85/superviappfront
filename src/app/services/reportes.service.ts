import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  url: any;

  constructor(private http: HttpClient,
              private _usService: UsuarioService) {
    this.url = environment.url;
  }

  getQuery(query: string) {
    const url = `${ this.url }/${ query }/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.get(url, { headers });
  }

   // Obtener todos los reportes
  getReportes(empresa: any) {
    return this.getQuery(`reporte/listar/${ empresa }`);
  }

    // Obtener todos los reportes semanales x usuario
  getReportesUsuario(usuario: any) {
    return this.getQuery(`reporte/listarusuario/${ usuario }`);
  }

    // Cargar imagen al reporte
  putReporte(_id: any, titulo: string, file: File) {
    const params = new FormData();

    params.append('titulo', titulo);
    params.append('file', file, Date.now() + file['name']);

    const url = `${ this.url }/reporte/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

    // Obtener imágenes reporte semanal
  getImgReporte(_id: any) {
    return this.getQuery(`reporte/listar/imagenes/${ _id }`);
  }

   // Elimina Orden de Trabajo
  deleteImgReporte(_id: any, _reporte: any) {
    const url = `${ this.url }/reporte/eliminarimagen/${ _id }/${ _reporte }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

   // Buscar reportes
  buscarReportes(empresa: any,
                 id: any,
                 usuario: any,
                 fecha: any,
                 fechaf: any) {

    const myObj = {
      "empresa": empresa,
      "id": id,
      "usuario": usuario,
      "fecha": fecha,
      "fechaf": fechaf,
    };

    const params = JSON.stringify(myObj);
    const url = `${ this.url }/reporte/buscar/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.post(url, params, { headers });
  }

  //==========================================================================//
  //                       Reporte de No Conformidad                          //
  //==========================================================================//

   // Obtener todos los reportes de No Conformidad
  getReporteNoConformidad(empresa: any) {
    return this.getQuery(`noconformidad/listar/${ empresa }`);
  }

   // Obtener todos los reportes de No Conformidad x usuario
  getReporteNoConformidadUsuario(usuario: any) {
    return this.getQuery(`noconformidad/listarusuario/${ usuario }`);
  }

   // Obtener un reporte de No Conformidad
  getReporteNoConformidadUno(_id: any) {
    return this.getQuery(`noconformidad/listaruno/${ _id }`);
  }

   // Crear reporte No Conformidad
  crearNoConformidad(empresa: any,
                    fecha_evidencia: any,
                    proceso: any,
                    tipo_accion: any,
                    descripcion: any,
                    tipo_grado: any,
                    quien_detecta: any,
                    numeral_norma: any,
                    resolver: any,
                    analisis: any,
                    accion_correctiva: any,
                    verificacion: any,
                    fecha_verificacion: any,
                    estado: any,
                    usuario: any,
                    obra: any,
                    image1: File,
                    image2: File,
                    image3: File) {

    const params = new FormData();
    params.append("empresa", empresa);
    params.append("fecha_evidencia", fecha_evidencia);
    params.append("proceso", proceso);
    params.append("tipo_accion", tipo_accion);
    params.append("descripcion", descripcion);
    params.append("tipo_grado", tipo_grado);
    params.append("quien_detecta", quien_detecta);
    params.append("numeral_norma", numeral_norma);
    params.append("resolver", resolver);
    params.append("analisis", analisis);
    params.append("accion_correctiva", accion_correctiva);
    params.append("verificacion", verificacion);
    params.append("fecha_verificacion", fecha_verificacion);
    params.append("estado", estado);
    params.append("usuario", usuario);
    params.append("obra", obra);

    if (image1) {
      params.append("uploads[]", image1, Date.now() + image1.name);
    }
    if (image2) {
      params.append("uploads[]", image2, Date.now() + image2.name);
    }
    if (image3) {
      params.append("uploads[]", image3, Date.now() + image3.name);
    }

    const url = `${ this.url }/noconformidad/crear`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Editar reporte No Conformidad
  editarNoConformidad(_id: any,
                      descripcion: any,
                      analisis: any,
                      accion_correctiva: any,
                      verificacion: any,
                      fecha_verificacion: any,
                      estado: any,
                      image1: File,
                      image2: File,
                      image3: File) {

  const params = new FormData();
  params.append("descripcion", descripcion);
  params.append("analisis", analisis);
  params.append("accion_correctiva", accion_correctiva);
  params.append("verificacion", verificacion);
  params.append("fecha_verificacion", fecha_verificacion);
  params.append("estado", estado);

  if (image1) {
    params.append("img1", '1');
    params.append("uploads[]", image1, Date.now() + image1.name);
  }

  if (image2) {
    params.append("img2", '1');
    params.append("uploads[]", image2, Date.now() + image2.name);
  }

  if (image3) {
    params.append("img3", '1');
    params.append("uploads[]", image3, Date.now() + image3.name);
  }

  const url = `${ this.url }/noconformidad/actualizar/${ _id }`;
  const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

  return this.http.put(url, params, { headers });
}

   // Elimina reporte No Conformidad
  eliminarNoConformidad(_id: any) {
    const url = `${ this.url }/noconformidad/eliminar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

  // Elimina Orden de Trabajo
  eliminaImgNoConformidad(_id: any, _n: any) {
    const url = `${ this.url }/noconformidad/eliminarimagen/${ _id }/${ _n }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

}
