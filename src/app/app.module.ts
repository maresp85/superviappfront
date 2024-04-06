import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { NgApexchartsModule } from 'ng-apexcharts';

//Fechas
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
import localeEsCo from '@angular/common/locales/es-CO';
registerLocaleData(localePy, 'es');
registerLocaleData(localeEsCo, 'es-Co');

// Rutas
import { ROUTES } from "./app.routes";
// Servicios
import { OrdenesService } from './services/ordenes.service';
import { UsuarioService } from './services/usuario.service';
import { ConfiguracionService } from './services/configuracion.service';
import { ReportesService } from './services/reportes.service';
import { HermeticidadService } from './services/hermeticidad.service';
// Componentes shared
import { LoadingComponent } from './shared/loading/loading.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { TitleComponent } from './shared/title/title.component';
// Componentes
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
//Componentes Administración
import { ListarUsuariosComponent } from './components/administracion/usuarios/listar-usuarios/listar-usuarios.component';
import { CrearUsuariosComponent } from './components/administracion/usuarios/crear-usuarios/crear-usuarios.component';
import { EditarUsuariosComponent } from './components/administracion/usuarios/editar-usuarios/editar-usuarios.component';
import { EditarUsuariosClaveComponent } from './components/administracion/usuarios/editar-usuarios-clave/editar-usuarios-clave.component';
import { ListarEmpresasComponent } from './components/administracion/empresas/listar-empresas/listar-empresas.component';
import { CrearEmpresasComponent } from './components/administracion/empresas/crear-empresas/crear-empresas.component';
// Componentes Configuración
import { ListarTrabajosComponent } from './components/configuracion/trabajos/listar-trabajos/listar-trabajos.component';
import { CrearTrabajosComponent } from './components/configuracion/trabajos/crear-trabajos/crear-trabajos.component';
import { EditarTrabajosComponent } from './components/configuracion/trabajos/editar-trabajos/editar-trabajos.component';
import { ListarObrasComponent } from './components/configuracion/obras/listar-obras/listar-obras.component';
import { CrearObrasComponent } from './components/configuracion/obras/crear-obras/crear-obras.component';
import { EditarObrasComponent } from './components/configuracion/obras/editar-obras/editar-obras.component';
import { AsignarUsuarioObraComponent } from './components/configuracion/obras/asignar-usuario-obra/asignar-usuario-obra.component';
import { ListarTipoTrabajosComponent } from './components/configuracion/tipotrabajos/listar-tipo-trabajos/listar-tipo-trabajos.component';
import { CrearTipoTrabajosComponent } from './components/configuracion/tipotrabajos/crear-tipo-trabajos/crear-tipo-trabajos.component';
import { EditarTipoTrabajosComponent } from './components/configuracion/tipotrabajos/editar-tipo-trabajos/editar-tipo-trabajos.component';
import { ListarActividadesComponent } from './components/configuracion/actividades/listar-actividades/listar-actividades.component';
import { CrearActividadesComponent } from './components/configuracion/actividades/crear-actividades/crear-actividades.component';
import { EditarActividadesComponent } from './components/configuracion/actividades/editar-actividades/editar-actividades.component';
import { ListarItemActividadesComponent } from './components/configuracion/actividades/listar-itemactividades/listar-itemactividades.component';
import { CrearItemActividadesComponent } from './components/configuracion/actividades/crear-itemactividades/crear-itemactividades.component';
import { EditarItemActividadesComponent } from './components/configuracion/actividades/editar-itemactividades/editar-itemactividades.component';
// Componentes Ordenes
import { ListarOrdenesComponent } from './components/ordenes/listar-ordenes/listar-ordenes.component';
import { CrearOrdenesComponent } from './components/ordenes/crear-ordenes/crear-ordenes.component';
import { CargarOrdenesComponent } from './components/ordenes/cargar-ordenes/cargar-ordenes.component';
import { LegalizarOrdenesComponent } from './components/ordenes/legalizar-ordenes/legalizar-ordenes.component';
import { ListarActividadComponent } from './components/ordenes/listar-actividad/listar-actividad.component';
import { ReLegalizarOrdenesComponent } from './components/ordenes/relegalizar-ordenes/relegalizar-ordenes.component';
import { ListarHistActividadComponent } from './components/ordenes/listar-histactividad/listar-histactividad.component';
// Componentes Reportes Semanal
import { ListarReportesComponent } from './components/reportes/listar-reportes/listar-reportes.component';
import { CargarImagenesComponent } from './components/reportes/cargar-imagenes/cargar.imagenes.component';
// Componentes Reporte de Hermeticidad
import { ListarHermeticidadComponent } from './components/hermeticidad/listar-hermeticidad/listar-hermeticidad.component';
import { CrearHermeticidadComponent } from './components/hermeticidad/crear-hermeticidad/crear-hermeticidad.component';
import { ListarLecturaComponent } from './components/hermeticidad/listar-lectura/listar-lectura.component';
import { CrearLecturaComponent } from './components/hermeticidad/crear-lectura/crear-lectura.component';
import { ActualizarLecturaComponent } from './components/hermeticidad/actualizar-lectura/actualizar-lectura.component';
// Componentes Reportes No Conformidad
import { ListarNoConformidadComponent } from './components/noconformidad/listar-noconformidad/listar-noconformidad.component';
import { CrearNoConformidadComponent } from './components/noconformidad/crear-noconformidad/crear-noconformidad.component';
import { EditarNoConformidadComponent } from './components/noconformidad/editar-noconformidad/editar-noconformidad.component';
// Componentes Bitácora
import { ListarBitacorasComponent } from './components/bitacoras/listar-bitacoras/listar-bitacoras.component';
import { CrearBitacorasComponent } from './components/bitacoras/crear-bitacoras/crear-bitacoras.component';
import { CargarBitacorasComponent } from './components/bitacoras/cargar-bitacoras/cargar-bitacoras.component';
import { ListarNotaComponent } from './components/bitacoras/listar-nota/listar-nota.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    NavbarComponent,
    SidebarComponent,
    TitleComponent,
    HomeComponent,
    LoginComponent,
    ListarEmpresasComponent,
    CrearEmpresasComponent,
    ListarTrabajosComponent,
    CrearTrabajosComponent,
    EditarTrabajosComponent,
    ListarTipoTrabajosComponent,
    CrearTipoTrabajosComponent,
    EditarTipoTrabajosComponent,
    ListarObrasComponent,
    CrearObrasComponent,
    EditarObrasComponent,
    AsignarUsuarioObraComponent,
    ListarOrdenesComponent,
    CrearOrdenesComponent,
    CargarOrdenesComponent,
    LegalizarOrdenesComponent,
    ListarActividadComponent,
    ListarHistActividadComponent,
    ReLegalizarOrdenesComponent,
    CrearUsuariosComponent,
    ListarUsuariosComponent,
    EditarUsuariosComponent,
    EditarUsuariosClaveComponent,
    ListarActividadesComponent,
    CrearActividadesComponent,
    EditarActividadesComponent,
    ListarItemActividadesComponent,
    CrearItemActividadesComponent,
    EditarItemActividadesComponent,
    ListarReportesComponent,
    CargarImagenesComponent,
    ListarHermeticidadComponent,
    CrearHermeticidadComponent,
    ListarLecturaComponent,
    CrearLecturaComponent,
    ActualizarLecturaComponent,
    ListarNoConformidadComponent,
    CrearNoConformidadComponent,
    EditarNoConformidadComponent,
    ListarBitacorasComponent,
    CrearBitacorasComponent,
    CargarBitacorasComponent,
    ListarNotaComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxPaginationModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot( ROUTES, { useHash: true } )
  ],
  providers: [OrdenesService,
              UsuarioService,
              ConfiguracionService,
              ReportesService,
              HermeticidadService,
              { provide: LOCALE_ID, useValue: "es" },
            ],
  bootstrap: [AppComponent]
})
export class AppModule { }
