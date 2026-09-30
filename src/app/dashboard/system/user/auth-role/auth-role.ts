import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../../../api/system/user.api.service';
import { parseTime } from '../../../../util/ruoyi.util';

@Component({
  selector: 'app-auth-role',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzFormModule, NzInputModule],
  templateUrl: './auth-role.html',
  styleUrl: './auth-role.less',
})
export class AuthRole implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(UserApiService);
  private message = inject(NzMessageService);

  loading = signal(false);
  form = signal<any>({});
  roles = signal<any[]>([]);
  checkedIds = new Set<number>();
  parseTime = parseTime;
  pageNum = 1;
  pageSize = 10;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) return;
    this.loading.set(true);
    this.api.getAuthRole(userId).subscribe({
      next: (res) => {
        const data = res?.data ?? {};
        this.form.set(data.user ?? {});
        const list = data.roles ?? [];
        this.roles.set(list);
        this.checkedIds.clear();
        list.forEach((r: any) => {
          if (r.flag) this.checkedIds.add(r.roleId);
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  pagedRoles(): any[] {
    const start = (this.pageNum - 1) * this.pageSize;
    return this.roles().slice(start, start + this.pageSize);
  }

  onItemChecked(id: number, checked: boolean): void {
    if (checked) this.checkedIds.add(id);
    else this.checkedIds.delete(id);
  }

  submit(): void {
    const userId = this.form().userId;
    const roleIds = [...this.checkedIds].join(',');
    this.api.updateAuthRole({ userId, roleIds }).subscribe({
      next: () => {
        this.message.success('授权成功');
        this.close();
      },
    });
  }

  close(): void {
    this.router.navigate(['/system/user']);
  }
}
