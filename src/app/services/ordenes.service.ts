import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {

  url: any;

  constructor(
    private http: HttpClient,
    private _usService: UsuarioService
  ) {
    this.url = environment.url;
  }

  getQuery(query: string) {
    const url = `${ this.url }/${ query }/`;
    const headers = new HttpHeaders(
      { 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() }
    );

    return this.http.get(url, { headers });
  }

   // Obtener todas las ordenes de trabajo
  getOrdenes(empresa: any) {
    return this.getQuery(`ordentrabajo/listar/${ empresa }`);
  }

    // Obtener todas las ordenes de trabajo/ bitácora x filtro
  getOrdenesBitacora(usuario: any, bitacora: any) {
    return this.getQuery(`ordentrabajo/listarusuario-obra/${ usuario }/${ bitacora }`);
  }

    // Obtener todas las ordenes de trabajo / bitácoras x usuario
  getOrdenesBitacoraUsuario(usuario: any, empresa: any, bitacora: any) {
    return this.getQuery(`ordentrabajo-filtrobitacora/listarusuario/${ usuario }/${ empresa }/${ bitacora }`);
  }

    // Obtener todas las ordenes de trabajo / bitácoras x empresa
  getOrdenesBitacoraTodas(empresa: any, bitacora: any) {
    return this.getQuery(`ordentrabajo-filtrobitacora/listar/${ empresa }/${ bitacora }`);
  }

   // Obtener ordenes de trabajo por estado (conteo)
  getOrdenesConteoEstado(empresa: any) {
    return this.getQuery(`ordentrabajo/contarestado/${ empresa }`);
  }

   // Obtener una sola orden
  getUnaOrden(_id: any) {
    return this.getQuery(`ordentrabajo/listaruna/${ _id }`);
  }

   // Crear orden de trabajo
  crearOrdenes(
    empresa: any,
    trabajo: any,
    obra: any,
    usuario: any,
    fecha: any,
    observaciones: string
  ) {
    const myObj = {
      'empresa': empresa,
      'trabajo': trabajo,
      'obra': obra,
      'usuario': usuario,
      'fecha': fecha,
      'observaciones': observaciones
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordentrabajo/crear/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.post(url, params, { headers });
  }

  // Crear orden de trabajo
  crearBitacoras(
    empresa: any,
    trabajo: any,
    obra: any,
    usuario: any,
    fecha: any,
    observaciones: string
  ) {
    const myObj = {
      'empresa': empresa,
      'trabajo': trabajo,
      'obra': obra,
      'usuario': usuario,
      'fecha': fecha,
      'observaciones': observaciones
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordentrabajo-bitacora/crear/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.post(url, params, { headers });
  }

   // Buscar orden de trabajo
  buscarOrdenes = (
    id: any,
    usuarioId: any,
    estado: any,
    trabajo: any,
    obra: any,
    fecha: any,
    fechaf: any
  ) => {
    const myObj = {
      'id': id,
      'usuarioId': usuarioId,
      'estado': estado,
      'trabajo': trabajo,
      'obra': obra,
      'fecha': fecha,
      'fechaf': fechaf,
    };

    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordentrabajo/buscar-app/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.post(url, params, { headers });
  }

   // Elimina Orden de Trabajo
  deleteOrdenTrabajo(_id: any) {
    const url = `${ this.url }/ordentrabajo/eliminar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

    // Cierra Orden de Trabajo
  cerrarOrdenTrabajo(_id: any) {
    const url = `${ this.url }/ordentrabajo/cerrar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.put(url, { headers });
  }

    // Cierra Nota
  cerrarNota = (_id: any) => {
    const url = `${ this.url }/ordenactividad/cerrar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.put(url, { headers });
  }

  updateExtraFieldsData = (_id: any, extraFieldsData: any) => {
    const myObj = {
      'extraFieldsData': extraFieldsData
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordentrabajo/extraFields/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.put(url, params, { headers });
  }

    // Obtener ordenes tipo trabajo
  getOrdenesTipo(ordentrabajo: any) {
    return this.getQuery(`ordentipotrabajo/listar/${ ordentrabajo }`);
  }

   // Obtener ordenes actividades x orden de trabajo x estado
  getOrdenesActividades(ordentrabajo: any, activo: any) {
    return this.getQuery(`ordenactividad/listar/${ ordentrabajo }/${ activo }`);
  }

   // Obtener ordenes actividades x orden de trabajo x estado
  getOrdenesActividadesTodas(ordentrabajo: any) {
    return this.getQuery(`ordenactividad/listartodas/${ ordentrabajo }`);
  }

    // Obtener ordenes actividades NO CUMPLE x orden de trabajo
  getOrdenesActividadesTodasNoCumple(ordentrabajo: any) {
    return this.getQuery(`ordenactividad/listartodasnocumple/${ ordentrabajo }`);
  }

   // Obtener ordenes actividades x tipo de trabajo x actividad
  getOrActividadesOrTipoTrabajo(actividad: any, ordentipotrabajo: any) {
    return this.getQuery(`ordenactividad/listarordentipotrabajo/${ actividad }/${ ordentipotrabajo }`);
  }

   // Obtener una orden actividad x id
  getUnaOrdenActividad(id: any) {
    return this.getQuery(`ordenactividad/listaruna/${ id }`);
  }

   // Obtener items de actividades
  getItemsActividad(actividad: any) {
    return this.getQuery(`itemactividad/listar/${ actividad }`);
  }

   // Obtener todos los items de actividades
  getItemsActividadTodos() {
    return this.getQuery(`itemactividad/listartodos`);
  }

   // Obtener items de actividades x cumplimiento
  getItemsActividadEstado(actividad: any, cumple: any) {
    return this.getQuery(`itemactividad/listarcumple/${ actividad }/${ cumple }`);
  }

    // Obtener items de actividades x nota
  getItemsActividadNota(actividad: any) {
    return this.getQuery(`itemactividad/listarnota/${ actividad }`);
  }

   // Elimina Orden de Trabajo
  deleteImgOrdenActividad(id: any, _id: any) {
    const url = `${ this.url }/imgordenactividad/eliminarimagen/${ id }/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

  // Elimina Orden de Trabajo
  deleteOrdenActividad(_id: any) {
    const url = `${ this.url }/ordenactividad/eliminar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

   // Actualizar id viga orden trabajo
  putIdVigaOrdenTrabajo(_id: any, idviga: any) {
    const myObj = {
      "idviga": idviga
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordentrabajo/idviga/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.put(url, params, { headers });
  }

   // Actualizar estado orden actividad
  putEstadoOrdenActividad(
    _id: any,
    estado: any,
    usuario: any,
    files: Array<File>,
    files2: Array<File>,
    observacion: any,
    fechaMejora: any,
    checkList: any,
  ) {

    (estado == 1) ? estado = "CUMPLE" : estado = "NO CUMPLE";
    var fechalegaliza: any = Date.now();

    const params = new FormData();
    params.append('estado', estado);
    params.append('usuariolegaliza', usuario);
    params.append('fechalegaliza', fechalegaliza);
    params.append('observacion', observacion);
    params.append('fechaMejora', fechaMejora);
    params.append('checklist', JSON.stringify(checkList));

    if (files) {
      for (let i=0; i < files.length; i++) {
        params.append('uploads[]', files[i], 'EVIDENCIAS=' + Date.now() + files[i]['name']);
      }
    }

    if (files2) {
      for (let i=0; i < files2.length; i++) {
        params.append('uploads[]', files2[i], 'FOTOBITACORA=' + Date.now() + files2[i]['name']);
      }
    }

    const url = `${ this.url }/ordenactividad/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

  putDigitalSignature = (
    _id: any,
    signatureImage: File,
  ) => {

    let firmaUsuario: any = Date.now() + signatureImage.name;
    const params = new FormData();
    params.append('firmaUsuario', firmaUsuario);
    params.append('image', signatureImage);

    const url = `${ this.url }/signature-order-web/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

   // Actualizar estado orden actividad
  putInactivaOrdenActividad(_id: any) {
    const myObj = {
      "activo": 0
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/ordenactividad/inactivar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.put(url, params, { headers })
  }

   // Obtener imágenes ordenes de actividades
  getImgOrdenActividad(ordenactividad: any) {
    return this.getQuery(`imgordenactividad/listar/${ ordenactividad }`);
  }

    // Obtener checklist ordenes de actividades
  getCheckOrdenActividad(ordenactividad: any) {
    return this.getQuery(`checkordenactividad/listar/${ ordenactividad }`);
  }

    // Obtener checklist ordenes de actividades
  getCheckOrdenActividadTrabajo(ordentrabajo: any) {
    return this.getQuery(`checkordenactividad/listarordentrabajo/${ ordentrabajo }`);
  }

   // Obtener imágenes ordenes de trabajo
  getImgOrdenTrabajo(ordentrabajo: any) {
    return this.getQuery(`imgordenactividad/listartodas/${ ordentrabajo }`);
  }

    // Actualizar imágenes de una legalización
  putImgOrdenActividad = (
    _id: any,
    files: Array<File>,
    id: any,
    observacion: any,
    fechaMejora: any
  ) => {
    const params = new FormData();

    params.append("id", id);
    params.append("observacion", observacion);
    params.append("fechaMejora", fechaMejora);

    if (files) {
      for (let i=0; i < files.length; i++) {
        params.append("uploads[]", files[i], 'EVIDENCIAS=' + Date.now() + files[i]['name']);
      }
    }

    const url = `${ this.url }/imgordenactividad/editarimg/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

    // Obtener ordenes x usuario en un rango de fechas
  getOrdenUsuarioFechas(usuario: any, fecha: any, fechaf: any) {
    return this.getQuery(`ordentrabajo/listarusuariofecha/${ usuario }/${ fecha }/${ fechaf }`);
  }

}
