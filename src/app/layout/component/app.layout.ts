import { Component, Renderer2, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { AppFooter } from './app.footer';
import { LayoutService } from '../service/layout.service';
import { signal } from '@angular/core';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppSidebar, RouterModule, AppFooter],
    template: `<div class="layout-wrapper" [ngClass]="containerClass">
        <app-topbar [isMecanicaSection]="isMecanicaSection"></app-topbar>
        <app-sidebar *ngIf="!isMecanicaSection"></app-sidebar>
        <div class="layout-main-container" [ngClass]="{'mecanica-layout': isMecanicaSection}">
            <div class="layout-main">
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>`,
    styles: [`
        .mecanica-layout {
            margin-left: 0 !important;
            width: 100% !important;
            transition: margin-left 0.3s;
        }
    `]
})
export class AppLayout implements OnInit {
    overlayMenuOpenSubscription: Subscription;
    menuOutsideClickListener: any;
    isMecanicaSection: boolean = false;
    
    @ViewChild(AppSidebar) appSidebar!: AppSidebar;
    @ViewChild(AppTopbar) appTopBar!: AppTopbar;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            // Solo crear listener si no estamos en sección mecánica
            if (!this.isMecanicaSection && !this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

            if (!this.isMecanicaSection && this.layoutService.layoutState().staticMenuMobileActive) {
                // this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
            // Verificar si estamos en la sección de mecánica
            this.isMecanicaSection = event.url.includes('/mecanica');
            
            // Solo ocultar menú si no estamos en mecánica
            if (!this.isMecanicaSection) {
                this.hideMenu();
            }
        });
    }
    
    ngOnInit() {
        // Verificar la URL inicial
        this.isMecanicaSection = this.router.url.includes('/mecanica');
    }

    isOutsideClicked(event: MouseEvent) {
        // Si estamos en sección mecánica, ignorar
        if (this.isMecanicaSection) return false;
        
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || 
                topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }

    hideMenu() {
        // Si estamos en sección mecánica, no hacer nada
        if (this.isMecanicaSection) return;
        
        this.layoutService.layoutState.update((prev) => ({ 
            ...prev, 
            overlayMenuActive: false, 
            staticMenuMobileActive: false, 
            menuHoverActive: false 
        }));
        
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
    }

    get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && 
                                      this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive,
            'layout-mecanica': this.isMecanicaSection // Clase especial para sección mecánica
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
    }
}