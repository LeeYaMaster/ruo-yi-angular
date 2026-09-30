import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, NzCardModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.less',
})
export class Welcome implements OnInit {
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  nickName = signal('用户');
  permCount = signal(0);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const u = this.auth.user();
    this.nickName.set(u?.nickName || u?.userName || '用户');
    this.permCount.set(this.auth.permissions().length);
  }
}
