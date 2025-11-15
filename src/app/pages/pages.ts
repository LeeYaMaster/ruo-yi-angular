import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-pages',
  imports: [RouterLink, RouterOutlet, NzLayoutModule, NzIconModule, NzMenuModule],
  templateUrl: './pages.html',
  styleUrl: './pages.less',
})
export class Pages {
  isCollapsed = false;
}
