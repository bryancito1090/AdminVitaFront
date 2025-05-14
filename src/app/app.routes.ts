import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/components/login/login.component';
import { AppLayout } from './layout/component/app.layout';
import { HomeComponent } from './views/dashboard/home/home.component';
import { OrdenTrabajoComponent } from './views/dashboard/orden-trabajo/orden-trabajo.component';
import { VehiculoComponent } from './views/dashboard/vehiculo/vehiculo.component';
import { InventarioComponent } from './views/dashboard/inventario/inventario.component';
import { AdquisicionComponent } from './views/dashboard/adquisicion/adquisicion.component';
import { NotfoundComponent } from './views/notfound/notfound.component';
import { AgregarAdquisicionComponent } from './views/dashboard/adquisicion/agregar-adquisicion/agregar-adquisicion.component';
import { DashboardMecanicaComponent } from './views/dashboard-mecanica/dashboard-mecanica.component';
import { UsuarioComponent } from './views/dashboard/persona/usuario.component';
import { MecanicoComponent } from './views/dashboard/persona/mecanico.component';
import { ProveedorComponent } from './views/dashboard/persona/proveedor.component';
import { StartComponent } from './views/start/start.component';
import { AgregarOrdenTrabajoMecanicoComponent } from './views/dashboard-mecanica/OrdenTrabajoMecanico/agregar-orden-trabajo-mecanico/agregar-orden-trabajo-mecanico.component';
import { OrdenTrabajoMecanicaComponent } from './views/dashboard-mecanica/orden-trabajo-mecanica/orden-trabajo-mecanica.component';
import { AppSimpleLayout } from './layout/component/app.simple-layout';

export const appRoutes: Routes = [
    {   path: '', component: StartComponent },
    {   path: 'login', component: LoginComponent },
    {   path: 'panel', component: AppLayout,
        children: [
            { path: '', component: HomeComponent},
            { path: 'OrdenTrabajo', component: OrdenTrabajoComponent},
            { path: 'Vehiculos', component: VehiculoComponent},
            { path: 'Inventario', component: InventarioComponent},
            { path: 'Adquisiciones', children: [
                { path: '', component:AdquisicionComponent},
                { path: 'agregar', component: AgregarAdquisicionComponent},
                { path: 'editar/:factura', component: AgregarAdquisicionComponent},
            ]},
            {path: 'persons', redirectTo: 'persons/Usuario', pathMatch: 'full'},
            {path: 'persons/Usuario', component: UsuarioComponent},
            {path: 'persons/Mecanico', component: MecanicoComponent},
            {path: 'persons/Proveedor', component: ProveedorComponent},
        ]},
    {   path: 'mecanica', component: AppSimpleLayout,
        children: [
            { path: '', component: DashboardMecanicaComponent },
            { path: 'agregar-orden', component: AgregarOrdenTrabajoMecanicoComponent },
            { path: ':codigo', component: OrdenTrabajoMecanicaComponent }
    ]},
    {   path: 'notFound404', component: NotfoundComponent}, 
    {   path: '**', redirectTo: 'notFound404', pathMatch: 'full'},
];
