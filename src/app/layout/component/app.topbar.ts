import { Component, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../views/auth/service/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
             <button *ngIf="!isMecanicaSection" 
                    class="layout-menu-button layout-topbar-action" 
                    (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="isMecanicaSection ? '/mecanica' : '/panel'">
            <svg fill="#C4A857" width="800px" height="auto" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path style="fill-rule:evenodd" d="m 2.2,9.396449 0,1.79793 C 2.2,11.533988 2.4683489,11.8 2.799374,11.8 l 0.601252,0 C 3.7344038,11.8 4,11.528854 4,11.194379 L 4,10.6 l 6,0 0,0.594379 C 10,11.533988 10.268349,11.8 10.599374,11.8 l 0.601252,0 C 11.534404,11.8 11.8,11.528854 11.8,11.194379 L 11.8,9.4 c -2e-6,-0.0012 0,-1.8 0,-1.8 l 0.604918,0 C 12.726816,7.6 13,7.331371 13,7 13,6.666319 12.733573,6.4 12.404918,6.4 L 11.8,6.4 9.4,2.2 4.6,2.2 2.2,6.4 1.5950819,6.4 C 1.2731833,6.4 1,6.668629 1,7 1,7.333681 1.2664272,7.6 1.5950819,7.6 L 2.2,7.6 2.2,9.396449 Z M 10.514286,6.4 8.8,3.4 l -3.6,0 -1.7142857,3 7.0285717,0 0,0 z M 4.3,9.4 C 4.7970563,9.4 5.2,8.997056 5.2,8.5 5.2,8.002944 4.7970563,7.6 4.3,7.6 3.8029437,7.6 3.4,8.002944 3.4,8.5 c 0,0.497056 0.4029437,0.9 0.9,0.9 l 0,0 z m 5.4,0 c 0.497056,0 0.9,-0.402944 0.9,-0.9 0,-0.497056 -0.402944,-0.9 -0.9,-0.9 -0.4970562,0 -0.9,0.402944 -0.9,0.9 0,0.497056 0.4029438,0.9 0.9,0.9 l 0,0 z"/></svg>
                <span>VITA</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu user-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleUserMenu()">
                    <i class="pi pi-user"></i>
                    <span>{{ userName || 'Usuario' }}</span>
                </button>
                <div class="user-menu__panel" *ngIf="showUserMenu">
                    <div class="user-menu__header">
                        <div class="user-menu__avatar">{{ avatarLetter }}</div>
                        <div class="user-menu__info">
                            <div class="user-menu__name">{{ userName || 'Usuario' }}</div>
                            <div class="user-menu__email">{{ userEmail || 'Correo no disponible' }}</div>
                        </div>
                    </div>
                    <button type="button" class="user-menu__action" (click)="goToStart()">
                        <i class="pi pi-sign-out"></i>
                        <span>Ir a inicio</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    styles: [`
        .user-menu { position: relative; }
        .user-menu__panel {
            position: absolute;
            right: 0;
            top: calc(100% + 8px);
            min-width: 220px;
            background: var(--surface-card, #fff);
            border: 1px solid var(--surface-border, #e5e7eb);
            border-radius: 8px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            padding: 12px;
            z-index: 1000;
        }
        .user-menu__header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .user-menu__avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #c4a857, #8c7430);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .user-menu__info { display: flex; flex-direction: column; gap: 2px; }
        .user-menu__name { font-weight: 600; }
        .user-menu__email { font-size: 0.85rem; color: var(--text-color-secondary, #6b7280); }
        .user-menu__action {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: var(--surface-ground, #f9fafb);
            border: 1px solid var(--surface-border, #e5e7eb);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .user-menu__action:hover { background: var(--surface-hover, #f3f4f6); }
    `]
})
export class AppTopbar {
    @Input() isMecanicaSection: boolean = false;
    showUserMenu = false;
    userName = '';
    userEmail = '';
    avatarLetter = '';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) {
        this.loadUserData();
    }

    toggleUserMenu(): void {
        this.loadUserData();
        this.showUserMenu = !this.showUserMenu;
    }

    private loadUserData(): void {
        // Preferir token de usuario (panel). Si no, usar token de mecánico como respaldo.
        const usuario = this.authService.getUsuarioData();
        if (usuario) {
            this.userName = usuario.nombre || '';
            this.userEmail = usuario.email || '';
            this.avatarLetter = this.getInitial(this.userName);
            return;
        }

        const mecanico = this.authService.getMecanicoProfile();
        if (mecanico) {
            this.userName = mecanico.nombre || '';
            this.userEmail = mecanico.email || '';
            this.avatarLetter = this.getInitial(this.userName);
            return;
        }

        this.avatarLetter = this.getInitial(this.userName);
    }

    goToStart(): void {
        this.showUserMenu = false;
        this.authService.logoutMecanico();
        this.authService.deleteToken();
        this.router.navigate(['/']);
    }

    private getInitial(name: string): string {
        if (!name) return 'U';
        return name.trim().charAt(0).toUpperCase() || 'U';
    }
}
