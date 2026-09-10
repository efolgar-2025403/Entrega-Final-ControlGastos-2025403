import { Routes } from '@angular/router';

import { Layout } from './layout/layout';

import { Dashboard } from './features/dashboard/dashboard';
import { IncomeComponent } from './features/income/income';
import { Expenses } from './features/expenses/expenses';
import { Categories } from './features/categories/categories';
import { Movements } from './features/movements/movements';
import { Reports } from './features/reports/reports';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'income',
        component: IncomeComponent
      },

      {
        path: 'expenses',
        component: Expenses
      },

      {
        path: 'categories',
        component: Categories
      },

      {
        path: 'movements',
        component: Movements
      },

      {
        path: 'reports',
        component: Reports
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];