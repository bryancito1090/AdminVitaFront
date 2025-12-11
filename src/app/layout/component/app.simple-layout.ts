import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppFooter } from './app.footer';
import { AppTopbarMec } from './app.topbarMec';

@Component({
    selector: 'app-simple-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, AppFooter, AppTopbarMec],
    template: `
        <app-topbarMec></app-topbarMec>
        <div class="layout-main-container">
            <div class="layout-main">
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
        `,
    styles: []
})

export class AppSimpleLayout {
    
};