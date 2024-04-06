import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  url: any;

  constructor( private http: HttpClient ) {
    this.url = environment.url;
  }

  getQuery(query: string) {
    const url = `${ this.url }/${ query }/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.leerToken()
    });

    return this.http.get(url, { headers });
  }

    // Se autentica el usuario que es registrado por Email
  autenticarUsuario(email: any, password: any) {
    const myObj = {
      'email': email,
      'password': password,
    };
    const params = JSON.stringify(myObj);
    const url = `${ this.url }/loginweb/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, params, { headers });
  }

   // Consulta de todos los usuarios
  getUsuarios() {
    return this.getQuery('usuario');
  }

   // Consulta todos los usuarios x empresa
  getUsuarioEmpresa(empresa: any) {
    return this.getQuery(`usuario/${ empresa }`);
  }

   // Consulta de un usuario
  getUnUsuario() {
    let email = this.leerEmailUsuario();
    return this.getQuery(`unusuario/${ email }`);
  }

  getUsuarioEmail(email: any) {
    return this.getQuery(`unusuario/${ email }`);
  }

  getUsuarioId(id: any) {
    return this.getQuery(`unusuarioid/${ id }`);
  }

   // POST crear usuarios
  crearUsuario(
    nombre: any, 
    password: any, 
    email: any, 
    role: any, 
    empresa: any, 
    signimg: File,
  ) {
    let activo: any = true;
    let imgfirma: any = Date.now() + signimg.name;
    const params = new FormData();
    params.append('nombre', nombre);
    params.append('password', password);
    params.append('email', email);
    params.append('role', role);
    params.append('activo', activo);
    params.append('empresa', empresa);
    params.append('imgfirma', imgfirma);
    params.append('signimg', signimg);

    const url = `${ this.url }/usuario/`;
    const headers = new HttpHeaders({ 'Authorization': this.leerToken() });

    return this.http.post(url, params, { headers });
  }

   // Edita Usuario
  putUsuario(
    _id: any,
    nombre: any,
    email: any,
    role: any,
    estado: any,
    sendemail: any,
    enterweb: any,
    entermovil: any,
    editorder: any,
    signimg: File,
  ) {    
    const params = new FormData();
    params.append('nombre', nombre);
    params.append('email', email);
    params.append('role', role);
    params.append('estado', estado);
    params.append('sendemail', sendemail);
    params.append('enterweb', enterweb);
    params.append('entermovil', entermovil);
    params.append('editorder', editorder);
    
    console.log(email)

    if (signimg) {
      let imgfirma: any = Date.now() + signimg.name;
      params.append('imgfirma', imgfirma);
      params.append('signimg', signimg);
    }

    const url = `${ this.url }/usuario/editar/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this.leerToken() });

    return this.http.put(url, params, { headers });
  }

    // Edita la clave de Usuario
  putUsuarioClave(_id: any,
                  password: any) {

    const myObj = {
      "password": password
    };

    const params = JSON.stringify(myObj);
    const url = `${ this.url }/usuario/editarclave/${ _id }`;
    const headers = new HttpHeaders({
      'Authorization': this.leerToken(),
      'Content-Type': 'application/json'
    });

    return this.http.put(url, params, { headers });
  }

    // Cuando el usuario se autentica, se almacena información
  guardarLocalUsuario(
    _id: any,
    email: any,
    role: any,
    nombre: any,
    empresa: any,
    empresaNombre: any,
    token: any
  ) {

    return new Promise((resolve, reject) => {

      localStorage.setItem('_id', _id);
      localStorage.setItem('emailang', email);
      localStorage.setItem('role', role);
      localStorage.setItem('nombre', nombre);
      localStorage.setItem('empresa', empresa);
      localStorage.setItem('empresaNombre', empresaNombre);
      localStorage.setItem('token', token);
      localStorage.setItem('autenticado', 'true');

      resolve({success :true});
    });

  }

    // Cierra sesión
  cerrar_sesion() {
    return new Promise((resolve, reject)=>{
      localStorage.removeItem('_id');
      localStorage.removeItem('emailang');
      localStorage.removeItem('role');
      localStorage.removeItem('nombre');
      localStorage.removeItem('empresa');
      localStorage.removeItem('empresaNombre');
      localStorage.removeItem('token');
      localStorage.removeItem('autenticado');
      this.leerEmpresaUsuario()
      this.leerNombreUsuario();
      this.leerEmailUsuario();
      this.leerToken();

      resolve({success :true});
    });
  }

  //==============================================
  //  Leer datos desde el DataStorage
  //==============================================

  // Revisar si el usuario se encuentra autenticado
  public estaAutenticado(): boolean {
    if (localStorage.getItem('autenticado') == 'true') {
      return true;
    } else {
      return false;
    }
  }

  leerIDUsuario() {
    if (localStorage.getItem('_id') ) {
      return localStorage.getItem('_id');
    } else {
      return '';
    }
  }

  leerEmpresaUsuario() {
    if (localStorage.getItem('empresa') ) {
      return localStorage.getItem('empresa');
    } else {
      return '';
    }
  }

  leerNombreEmpresaUsuario() {
    if (localStorage.getItem('empresaNombre') ) {
      return localStorage.getItem('empresaNombre');
    } else {
      return '';
    }
  }

  leerNombreUsuario() {
    if (localStorage.getItem('nombre') ) {
      return localStorage.getItem('nombre');
    } else {
      return '';
    }
  }

  leerEmailUsuario() {
    if (localStorage.getItem('emailang') ) {
      return localStorage.getItem('emailang');
    } else {
      return '';
    }
  }

  leerRoleUsuario() {
    if (localStorage.getItem('role') ) {
      return localStorage.getItem('role');
    } else {
      return '';
    }
  }

  leerToken() {
    if (localStorage.getItem('token') ) {
      return localStorage.getItem('token');
    } else {
      return '';
    }
  }

}
