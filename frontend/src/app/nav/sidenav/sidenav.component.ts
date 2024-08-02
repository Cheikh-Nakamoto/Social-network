import { routes } from './../../app.routes';
import {Component} from '@angular/core';
import {
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer
} from "@angular/material/sidenav";
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {MatListModule} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import {MatFabAnchor} from "@angular/material/button";
import { HomeComponent } from '../../home/components/home/home.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [
        MatDrawer,
        MatDrawerContainer,
        MatDrawerContent,
        MatListModule,
        MatIcon,
        NgForOf,
        MatFabAnchor,
        RouterLink,
        NgIf,
        MatSidenavContainer,
        MatSidenav,
        HomeComponent,
        ToolbarComponent
    ],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss',
    providers: [DataService]  // Add any additional services you need to this component.
})
export class SidenavComponent {
  constructor (private router : Router){}
    menuItems = [
        {name: 'Home', route: '/', icon: 'home'},
        {name: 'Profile', route: '/profile', icon: 'person'},
        {name: 'Friends', route: '/followers', icon: 'person_add'},
        {name: 'Groups', route: '/groups', icon: 'group'},
        { name: 'New Post', route: '/CreatePost', icon: 'create' },
    ]

    handleToolbarClick(event: Event) {
      console.log('Toolbar link clicked!', event);
    }

    handleMenuItemClick(item: any, event: Event) {
      console.log('Menu item clicked:', item.route);
      this.router.navigateByUrl(item.route);
    }
}
