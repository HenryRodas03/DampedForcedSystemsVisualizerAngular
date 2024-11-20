import { Routes } from '@angular/router';
import { HomeComponent } from './home/pages/home.component';

export const routes: Routes = [
  {
    path: '', // Ruta vacía
    component: HomeComponent, // Componente asociado
  },
  {
    path: '**', // Ruta para manejar errores o páginas no encontradas
    redirectTo: '', // Redirige a la ruta principal
    pathMatch: 'full',
  },
];
