import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  url: any;

  constructor(
    private http: HttpClient,
    private _usService: UsuarioService
  ) {
    this.url = environment.url;
  }

  getQuery = (query: string) => {
    const url = `${ this.url }/${ query }/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.get(url, { headers });
  }

  putQuery = (url: any, myObj: any) => {
    const params = JSON.stringify(myObj);   
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

  //GET todas las empresas
  getEmpresa() {
    return this.getQuery('empresa/listar');
  }

  // POST crear empresas
  crearEmpresa(
    nombre: any, 
    ubicacion: any, 
    telefono: any, 
    activo: any,
    logoImage: File
  ) {
    let logo: any = Date.now() + logoImage.name;
    const params = new FormData();
    params.append('nombre', nombre);
    params.append('ubicacion', ubicacion);
    params.append('telefono', telefono);
    params.append('activo', activo);
    params.append('logo', logo);
    params.append('logoImage', logoImage);

    console.log(logoImage)

    const url = `${ this.url }/empresa/crear/`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // GET trabajos
  getTrabajo() {
    return this.getQuery('trabajo/listar');
  }

   // GET trabajos x empresa
  getTrabajoEmpresa(empresa: any) {
    return this.getQuery(`trabajo/listar/${ empresa }`);
  }

  // GET trabajos
  getTrabajoEmpresaFiltroBitacora(empresa: any, bitacora: any) {
    return this.getQuery(`trabajo/listar-filtrobitacora/${ empresa }/${ bitacora }`);
  }

  // Obtiene actividad x id
  getUnTrabajo(id: any) {
    return this.getQuery(`trabajo/listaruno/${ id }`);
  }

   // POST crear trabajos
  crearTrabajo(
    nombre: any, 
    fechaMejora: any, 
    legalizaCualquierOrden: any, 
    bitacora: any, 
    empresa: any
  ) {
    const myObj = {
      'nombre': nombre,
      'fechaMejora': fechaMejora,
      'legalizaCualquierOrden': legalizaCualquierOrden,
      'bitacora': bitacora,
      'empresa': empresa,
    };

    const params = JSON.stringify(myObj);
    const url = `${ this.url }/trabajo/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Edita trabajo
  putTrabajo = (
    _id: any,
    nombre: any,
    activo: any,
    fechaMejora: any,
    legalizaCualquierOrden: any,
    bitacora: any
  ) => {
    const myObj = {
      'nombre': nombre,
      'activo': activo,
      'fechaMejora': fechaMejora,
      'legalizaCualquierOrden': legalizaCualquierOrden,
      'bitacora': bitacora,
    };
    
    const url = `${ this.url }/trabajo/editar/${ _id }`;
    return this.putQuery(url, myObj);
  }

  addTrabajoExtraFields = (_id: any, extraFields: any) => {
    const myObj = {
      'extraFields': extraFields,
    };

    const url = `${ this.url }/trabajo/editar/${ _id }`;
    return this.putQuery(url, myObj);
  }

    // GET Obras
  getObra() {
    return this.getQuery('obra/listar');
  }

    // Elimina una obra
  deleteObra(_id: any) {
    const url = `${ this.url }/obra/eliminar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.delete(url, { headers });
  }

   // GET Obras x Empresa
   getObraEmpresa(empresa: any) {
    return this.getQuery(`obra/listar/${ empresa }`);
  }

    // GET Obras x usuario
  getObraEmpresasxUsuario(usuario: any) {
    return this.getQuery(`obra/listar-usuario/${ usuario }`);
  }

  // GET actividad x id
  getUnaObra(id: any) {
    return this.getQuery(`obra/listaruna/${ id }`);
  }

   // POST crear Obras
  crearObra(nombre: any, direccion: any, empresa: any) {
    const myObj = {
      "nombre": nombre,
      "direccion": direccion,
      "empresa": empresa
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/obra/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Editar Obra
  putObra(
    _id: any,
    nombre: any,
    direccion: any,
    activo: any
  ) {
    const myObj = {
      "nombre": nombre,
      "direccion": direccion,
      "activo": activo
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/obra/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

    // Obtiene tipos de trabajo
  getTipoTrabajo() {
    return this.getQuery('tipotrabajo/listar');
  }

   // Obtiene tipos de trabajo x Empresa
  getTipoTrabajoEmpresa(empresa: any) {
    return this.getQuery(`tipotrabajo/listar/${ empresa }`);
  }

   // Obtiene un tipo de trabajo x id
  getUnTipoTrabajo(id: any) {
    return this.getQuery(`tipotrabajo/listaruno/${ id }`);
  }

   // Crea tipos de trabajos
  crearTipoTrabajo(nombre: any, trabajo: any, empresa: any) {
    const myObj = {
      "nombre": nombre,
      "trabajo": trabajo,
      "empresa": empresa
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/tipotrabajo/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

   // Edita tipo de trabajo
  putTipoTrabajo(
    _id: any,
    nombre: any,
    trabajo: any,
    orden: any,
    activo: any,
  ) {
    const myObj = {
      "nombre": nombre,
      "trabajo": trabajo,
      "orden": orden,
      "activo": activo,
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/tipotrabajo/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

   // Elimina Orden de Trabajo
  deleteTipoTrabajo(_id: any) {
    const url = `${ this.url }/tipotrabajo/eliminar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.delete(url, { headers });
  }

   // Obtiene actividades x empresa
  getActividad(empresa: any) {
    return this.getQuery(`actividad/listar/${ empresa }`);
  }

    // Obtiene actividades x trabajo x empresa
  getActividadTrabajo(empresa: any, trabajo: any) {
    return this.getQuery(`actividad/listartrabajo/${ empresa }/${ trabajo }`);
  }

   // Obtiene actividad x id
  getUnaActividad = (id: any) => {
    return this.getQuery(`actividad/listaruna/${ id }`);
  }

   // Crea actividades
  crearActividad(nombre: any, orden: any, tipotrabajo: any, role: any) {
    const myObj = {
      'nombre': nombre,
      'orden': orden,
      'tipotrabajo': tipotrabajo,
      'role': role,
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/actividad/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Editar Actividad
  putActividad = (
    _id: any,
    nombre: any,
    orden: any,
    role: any,
    trabajo: any,
    tipotrabajo: any,
    empresa: any
  ) => {

    const myObj = {
      'nombre': nombre,
      'orden': orden,
      'role': role,
      'trabajo': trabajo,
      'tipotrabajo': tipotrabajo,
      'empresa': empresa
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/actividad/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

  // Elimina Orden de Trabajo
  deleteActividad(_id: any) {
    const url = `${ this.url }/actividad/eliminar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.delete(url, { headers });
  }

   // Obtiene items de actividades
  getItemsActividad(actividad: any) {
    return this.getQuery(`itemactividad/listar/${ actividad }`);
  }

    // Obtiene un item actividad
  getUnItemActividad(id: any) {
    return this.getQuery(`itemactividad/listaruna/${ id }`);
  }

   // Crea Item Actividad
  crearItemActividad(
    empresa: any,
    actividad: any,
    cumple: boolean,
    tipo: string,
    etiqueta: any,
    imagen: boolean
  ) {
    const myObj = {
      "empresa": empresa,
      "actividad": actividad,
      "cumple": cumple,
      "tipo": tipo,
      "etiqueta": etiqueta,
      "imagen": imagen
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/itemactividad/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

   // Actualiza Item Actividad
  putItemActividad(
    _id: any,
    cumple: any,
    tipo: any,
    etiqueta: any,
    imagen: any,
    activo: any
  ) {
    const myObj = {
      "cumple": cumple,
      "tipo": tipo,
      "etiqueta": etiqueta,
      "imagen": imagen,
      "activo": activo
    };
  
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/itemactividad/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }
  

    // Elimina Item Actividad
  deleteItemActividad(_id: any) {
    const url = `${ this.url }/itemactividad/eliminar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.delete(url, { headers });
  }

   // Obtiene campos ordenes
  getCamposOrdenes(tipoordenes_id: any, empresas_id: any) {
    return this.getQuery(`camposordenes/listar/${tipoordenes_id}/${empresas_id}`);
  }

    // Crea ordenes de trabajo
  crearCamposOrdenes(
    tipoordenes_id: any,
    empresas_id: any,
    name: any,
    label: any,
    placeholder: any,
    type: any,
    length: any) {
    const myObj = {
      "tipoordenes": tipoordenes_id,
      "empresas": empresas_id,
      "name": name,
      "label": label,
      "placeholder": placeholder,
      "type": type,
      "length": length
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/camposordenes/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Obtiene usuarios x obra
  getObraUsuario(obra: any) {
    return this.getQuery(`obrausuario/listar/${ obra }`);
  }

    // Asignar usuario a una obra
  asignarObraUsuario(obra: any, usuario: any, empresa: any) {
    const myObj = {
      "obra": obra,
      "usuario": usuario,
      "empresa": empresa
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/obrausuario/crear/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

  // Elimina Orden de Trabajo
  deleteObraUsuario(_id: any) {
    const url = `${ this.url }/obrausuario/eliminar/${ _id }`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this._usService.leerToken() });

    return this.http.delete(url, { headers });
  }

}
