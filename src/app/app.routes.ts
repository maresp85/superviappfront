import { Routes } from "@angular/router";
import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
//Componentes Administración
import { ListarUsuariosComponent } from './components/administracion/usuarios/listar-usuarios/listar-usuarios.component';
import { CrearUsuariosComponent } from './components/administracion/usuarios/crear-usuarios/crear-usuarios.component';
import { EditarUsuariosComponent } from './components/administracion/usuarios/editar-usuarios/editar-usuarios.component';
import { EditarUsuariosClaveComponent } from './components/administracion/usuarios/editar-usuarios-clave/editar-usuarios-clave.component';
import { ListarEmpresasComponent } from './components/administracion/empresas/listar-empresas/listar-empresas.component';
import { CrearEmpresasComponent } from './components/administracion/empresas/crear-empresas/crear-empresas.component';
//Componentes Configuracion
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
// Gestión de Ordenes
import { ListarOrdenesComponent } from './components/ordenes/listar-ordenes/listar-ordenes.component';
import { CrearOrdenesComponent } from './components/ordenes/crear-ordenes/crear-ordenes.component';
import { CargarOrdenesComponent } from './components/ordenes/cargar-ordenes/cargar-ordenes.component';
import { LegalizarOrdenesComponent } from './components/ordenes/legalizar-ordenes/legalizar-ordenes.component';
import { ListarActividadComponent } from './components/ordenes/listar-actividad/listar-actividad.component';
import { ReLegalizarOrdenesComponent } from './components/ordenes/relegalizar-ordenes/relegalizar-ordenes.component';
import { ListarHistActividadComponent } from './components/ordenes/listar-histactividad/listar-histactividad.component';
//Gestión de Reportes Semanal
import { ListarReportesComponent } from './components/reportes/listar-reportes/listar-reportes.component';
import { CargarImagenesComponent } from './components/reportes/cargar-imagenes/cargar.imagenes.component';
// Gestión de Reportes Hermeticidad
import { ListarHermeticidadComponent } from './components/hermeticidad/listar-hermeticidad/listar-hermeticidad.component';
import { CrearHermeticidadComponent } from './components/hermeticidad/crear-hermeticidad/crear-hermeticidad.component';
import { ListarLecturaComponent } from './components/hermeticidad/listar-lectura/listar-lectura.component';
import { CrearLecturaComponent } from './components/hermeticidad/crear-lectura/crear-lectura.component';
import { ActualizarLecturaComponent } from './components/hermeticidad/actualizar-lectura/actualizar-lectura.component';
// Componentes Reportes No Conformidad
import { ListarNoConformidadComponent } from './components/noconformidad/listar-noconformidad/listar-noconformidad.component';
import { CrearNoConformidadComponent } from './components/noconformidad/crear-noconformidad/crear-noconformidad.component';
import { EditarNoConformidadComponent } from './components/noconformidad/editar-noconformidad/editar-noconformidad.component';
// Bitácoras
import { ListarBitacorasComponent } from './components/bitacoras/listar-bitacoras/listar-bitacoras.component';
import { CrearBitacorasComponent } from './components/bitacoras/crear-bitacoras/crear-bitacoras.component';
import { CargarBitacorasComponent } from './components/bitacoras/cargar-bitacoras/cargar-bitacoras.component';
import { ListarNotaComponent } from './components/bitacoras/listar-nota/listar-nota.component';

export const ROUTES: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [ AuthGuard ] },
    { path: 'login', component: LoginComponent },
    // Administración
    { path: 'listarusuarios', component: ListarUsuariosComponent, canActivate: [ AuthGuard ] },
    { path: 'crearusuarios', component: CrearUsuariosComponent, canActivate: [ AuthGuard ] },
    { path: 'editarusuarios/:email', component: EditarUsuariosComponent, canActivate: [ AuthGuard ] },
    { path: 'editarusuariosclave/:email', component: EditarUsuariosClaveComponent, canActivate: [ AuthGuard ] },
    { path: 'listarempresas', component: ListarEmpresasComponent, canActivate: [ AuthGuard ] },
    { path: 'crearempresas', component: CrearEmpresasComponent, canActivate: [ AuthGuard ] },
    // Configuración
    { path: 'listartrabajos', component: ListarTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'creartrabajos', component: CrearTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'listarobras', component: ListarObrasComponent, canActivate: [ AuthGuard ] },
    { path: 'crearobras', component: CrearObrasComponent, canActivate: [ AuthGuard ] },
    { path: 'editartrabajos/:_trabajo', component: EditarTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'editarobras/:_obra', component: EditarObrasComponent, canActivate: [ AuthGuard ] },
    { path: 'asignarusuario/:_obra', component: AsignarUsuarioObraComponent, canActivate: [ AuthGuard ] },
    { path: 'listartipotrabajos', component: ListarTipoTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'creartipotrabajos', component: CrearTipoTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'editartipotrabajos/:_tipotrabajo', component: EditarTipoTrabajosComponent, canActivate: [ AuthGuard ] },
    { path: 'listaractividades', component: ListarActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'listaractividades/:_empresa', component: ListarActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'crearactividades', component: CrearActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'editaractividades/:_actividad', component: EditarActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'listaritemactividades/:actividad', component: ListarItemActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'crearitemactividades/:actividad', component: CrearItemActividadesComponent, canActivate: [ AuthGuard ] },
    { path: 'editaritemactividades/:actividad/:item', component: EditarItemActividadesComponent, canActivate: [ AuthGuard ] },
    // Gestión Ordenes
    { path: 'listarordenes', component: ListarOrdenesComponent, canActivate: [ AuthGuard ] },
    { path: 'crearordenes', component: CrearOrdenesComponent, canActivate: [ AuthGuard ] },
    { path: 'cargarordenes/:ordenes/:_ordenes', component: CargarOrdenesComponent, canActivate: [ AuthGuard ] },
    { path: 'legalizarordenes/:_actividad/:cumple', component: LegalizarOrdenesComponent, canActivate: [ AuthGuard ] },
    { path: 'listaractividad/:_actividad', component: ListarActividadComponent, canActivate: [ AuthGuard ] },
    { path: 'relegalizarordenes/:_actividad/:cumple', component: ReLegalizarOrdenesComponent, canActivate: [ AuthGuard ] },
    { path: 'listarhistactividad/:_actividad/:_ordentipotrabajo', component: ListarHistActividadComponent, canActivate: [ AuthGuard ] },
    // Gestión Reporte Semanal
    { path: 'listareportes', component: ListarReportesComponent, canActivate: [ AuthGuard ] },
    { path: 'cargarimagenes/:_reporte', component: CargarImagenesComponent, canActivate: [ AuthGuard ] },
    // Gestión Reporte Hermeticidad
    { path: 'listarhermeticidad', component: ListarHermeticidadComponent, canActivate: [ AuthGuard ] },
    { path: 'crearhermeticidad', component: CrearHermeticidadComponent, canActivate: [ AuthGuard ] },
    { path: 'listarlectura/:hermeticidad/:_hermeticidad', component: ListarLecturaComponent, canActivate: [ AuthGuard ] },
    { path: 'crearlectura/:hermeticidad/:_hermeticidad', component: CrearLecturaComponent, canActivate: [ AuthGuard ] },
    { path: 'actualizarlectura/:_id/:hermeticidad/:_hermeticidad', component: ActualizarLecturaComponent, canActivate: [ AuthGuard ] },
    // Gestión Reporte No Conformidad
    { path: 'listarnoconformidad', component: ListarNoConformidadComponent, canActivate: [ AuthGuard ] },
    { path: 'crearnoconformidad', component: CrearNoConformidadComponent, canActivate: [ AuthGuard ] },
    { path: 'editarnoconformidad/:_id/:id', component: EditarNoConformidadComponent, canActivate: [ AuthGuard ] },
    // Gestión Bitácoras
    { path: 'listarbitacoras', component: ListarBitacorasComponent, canActivate: [ AuthGuard ] },
    { path: 'crearbitacoras', component: CrearBitacorasComponent, canActivate: [ AuthGuard ] },
    { path: 'cargarbitacoras/:ordenes/:_ordenes', component: CargarBitacorasComponent, canActivate: [ AuthGuard ] },
    { path: 'listarnota/:_actividad', component: ListarNotaComponent, canActivate: [ AuthGuard ] },

    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: '**', pathMatch: 'full', redirectTo: 'home' },
]
