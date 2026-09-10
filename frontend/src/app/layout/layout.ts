import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout implements OnInit {

  notificationsOpen = false;
  notificationsRead = false;
  accountOpen = false;

  user: {
    id: number;
    name: string;
    email: string;
  } | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.user = this.authService.getUser();
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;

    // Al abrir las notificaciones por primera vez,
    // desaparece el número de notificaciones.
    if (this.notificationsOpen) {
      this.notificationsRead = true;
      this.accountOpen = false;
    }
  }

  toggleAccount(): void {
    this.accountOpen = !this.accountOpen;

    // Cierra las notificaciones si se abre la cuenta.
    if (this.accountOpen) {
      this.notificationsOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}