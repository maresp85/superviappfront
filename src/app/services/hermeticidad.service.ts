import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class HermeticidadService {

  url: any;

  constructor(private http: HttpClient,
              private _usService: UsuarioService) {
    this.url = environment.url;
  }

  getQuery(query: string) {
    const url = `${ this.url }/${ query }/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.get(url, { headers });
  }

    // Obtener todas las ordenes de trabajo
  getHermeticidad(empresa: any) {
    return this.getQuery(`hermeticidad/listar/${ empresa }`);
  }

    // Obtener todas las ordenes de trabajo x usuario
  getHermeticidadUsuario(usuario: any) {
    return this.getQuery(`hermeticidad/listarusuario/${ usuario }`);
  }

  // Obtener todas las ordenes de trabajo x usuario
  getHermeticidadUna(_id: any) {
    return this.getQuery(`hermeticidad/listaruna/${ _id }`);
  }

    // Crear reporte hermeticidad
  crearHermeticidad(empresa: any, obra: any, fecha: any, usuario: any) {
    const myObj = {
      "empresa": empresa,
      "obra": obra,
      "fecha": fecha,
      "usuario": usuario,
    };

    const params = JSON.stringify(myObj);
    const url = `${ this.url }/hermeticidad/crear/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.post(url, params, { headers });
  }

    // Obtener lecturas x reporte de hermeticidad
  getLecturaHermeticidad(hermeticidad: any) {
    return this.getQuery(`hermeticidadlectura/listar/${ hermeticidad }`);
  }

    // Crear lectura x reporte de hermeticidad
  crearLectura(hermeticidad: any,
               ubicacion: any,
               lecturaInicial: any,
               fechaInicial: any,
               realizo: any,
               observaciones: any,
               file: File) {

    let imagenInicial: any = Date.now() + file.name;
    const params = new FormData();
    params.append('hermeticidad', hermeticidad);
    params.append('ubicacion', ubicacion);
    params.append('lecturainicial', lecturaInicial);
    params.append('fechainicial', fechaInicial);
    params.append('realizo', realizo);
    params.append('observaciones', observaciones);
    params.append('file', file, imagenInicial);
    params.append('imageninicial', imagenInicial);

    const url = `${ this.url }/hermeticidadlectura/crear/`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.post(url, params, { headers });
  }

    // Actualizar lectura x reporte de hermeticidad
  actualizarLectura(_id: any, lecturaFinal: any, fechaFinal: any, file: File) {
    let imagenFinal: any = Date.now() + file.name;
    const params = new FormData();
    params.append('lecturafinal', lecturaFinal);
    params.append('fechafinal', fechaFinal);
    params.append('finalizada', '1');
    params.append('file', file, imagenFinal);
    params.append('imagenfinal', imagenFinal);

    const url = `${ this.url }/hermeticidadlectura/actualizar/${ _id }`;
    const headers = new HttpHeaders({ 'Authorization': this._usService.leerToken() });

    return this.http.put(url, params, { headers });
  }

  // Elimina Orden de Trabajo
  eliminarHermeticidad(_id: any) {
    const url = `${ this.url }/hermeticidad/eliminar/${ _id }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._usService.leerToken()
    });

    return this.http.delete(url, { headers });
  }

}
