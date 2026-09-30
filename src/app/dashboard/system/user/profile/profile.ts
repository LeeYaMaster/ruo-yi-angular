import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Observable, Observer } from 'rxjs';
import { UserApiService } from '../../../../api/system/user.api.service';
import { AuthService } from '../../../../auth/auth.service';
import { parseTime } from '../../../../util/ruoyi.util';
import { Config } from '../../../../http/config';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, NzCardModule, NzTabsModule, NzFormModule, NzInputModule, NzButtonModule, NzRadioModule, NzUploadModule, NzIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.less',
})
export class Profile implements OnInit {
  private api = inject(UserApiService);
  private auth = inject(AuthService);
  private message = inject(NzMessageService);
  private router = inject(Router);

  user = signal<any>({});
  info = { nickName: '', phonenumber: '', email: '', sex: '0' };
  pwd = { oldPassword: '', newPassword: '', confirmPassword: '' };
  parseTime = parseTime;
  avatarUrl = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getProfile().subscribe({
      next: (res) => {
        const u = res?.data ?? {};
        this.user.set(u);
        this.info = {
          nickName: u.nickName ?? '',
          phonenumber: u.phonenumber ?? '',
          email: u.email ?? '',
          sex: u.sex ?? '0',
        };
        this.avatarUrl = this.resolveAvatar(u.avatar);
      },
    });
  }

  resolveAvatar(avatar?: string): string {
    if (!avatar) {
      return 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
    }
    if (/^https?:\/\//i.test(avatar)) return avatar;
    return Config.API_URL.replace(/\/$/, '') + (avatar.startsWith('/') ? avatar : '/' + avatar);
  }

  saveInfo(): void {
    if (!this.info.nickName) {
      this.message.warning('用户昵称不能为空');
      return;
    }
    this.api.updateProfile({ ...this.user(), ...this.info }).subscribe({
      next: () => {
        this.message.success('修改成功');
        this.load();
      },
    });
  }

  savePwd(): void {
    if (!this.pwd.oldPassword || !this.pwd.newPassword) {
      this.message.warning('请填写完整密码');
      return;
    }
    if (this.pwd.newPassword.length < 6 || this.pwd.newPassword.length > 20) {
      this.message.warning('新密码长度在 6 到 20 个字符');
      return;
    }
    if (this.pwd.newPassword !== this.pwd.confirmPassword) {
      this.message.warning('两次输入的密码不一致');
      return;
    }
    this.api.updatePwd(this.pwd.oldPassword, this.pwd.newPassword).subscribe({
      next: () => {
        this.message.success('修改成功');
        this.pwd = { oldPassword: '', newPassword: '', confirmPassword: '' };
      },
    });
  }

  beforeUpload = (file: NzUploadFile): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      const raw = file as unknown as File;
      const isImg = raw.type?.startsWith('image/');
      if (!isImg) {
        this.message.error('只能上传图片文件');
        observer.complete();
        return;
      }
      this.api.uploadAvatar(raw).subscribe({
        next: (res: any) => {
          const url = res?.data?.imgUrl ?? res?.imgUrl;
          if (url) {
            this.avatarUrl = this.resolveAvatar(url);
            this.user.update((u) => ({ ...u, avatar: url }));
          }
          this.message.success('头像上传成功');
          observer.next(false);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        },
      });
    });

  close(): void {
    this.router.navigate(['/system/welcome']);
  }

  roleNames(): string {
    const roles = this.user()?.roles;
    if (!Array.isArray(roles)) return '';
    return roles.map((r: any) => r.roleName || r).join('、');
  }
}
