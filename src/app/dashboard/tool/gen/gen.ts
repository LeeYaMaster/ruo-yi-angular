import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { GenApiService } from '../../../api/tool/gen.api.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { parsePage, parseTime } from '../../../util/ruoyi.util';

@Component({
  selector: 'app-gen',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzIconModule,
    NzTabsModule,
    HasPermiDirective,
  ],
  templateUrl: './gen.html',
  styleUrl: './gen.less',
})
export class Gen implements OnInit {
  private api = inject(GenApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  query = { pageNum: 1, pageSize: 10, tableName: '', tableComment: '' };
  checkedIds = new Set<number>();
  checkedNames = new Set<string>();
  allChecked = false;
  indeterminate = false;
  parseTime = parseTime;

  // import db modal
  importVisible = false;
  dbLoading = false;
  dbList: any[] = [];
  dbTotal = 0;
  dbQuery = { pageNum: 1, pageSize: 10, tableName: '', tableComment: '' };
  dbChecked = new Set<string>();

  // preview
  previewVisible = false;
  previewTabs: { key: string; label: string; content: string }[] = [];
  previewActive = 0;

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.list.set(p.list);
        this.total.set(p.total);
        this.loading.set(false);
        this.refreshChecked();
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void {
    this.query.pageNum = 1;
    this.getList();
  }
  onReset(): void {
    this.query = { pageNum: 1, pageSize: 10, tableName: '', tableComment: '' };
    this.getList();
  }
  onPageIndexChange(p: number): void {
    this.query.pageNum = p;
    this.getList();
  }
  onPageSizeChange(s: number): void {
    this.query.pageSize = s;
    this.query.pageNum = 1;
    this.getList();
  }

  onItemChecked(row: any, c: boolean): void {
    if (c) {
      this.checkedIds.add(row.tableId);
      this.checkedNames.add(row.tableName);
    } else {
      this.checkedIds.delete(row.tableId);
      this.checkedNames.delete(row.tableName);
    }
    this.refreshChecked();
  }
  onAllChecked(c: boolean): void {
    this.list().forEach((r) => {
      if (c) {
        this.checkedIds.add(r.tableId);
        this.checkedNames.add(r.tableName);
      } else {
        this.checkedIds.delete(r.tableId);
        this.checkedNames.delete(r.tableName);
      }
    });
    this.refreshChecked();
  }
  refreshChecked(): void {
    const n = this.list().length;
    const c = this.list().filter((r) => this.checkedIds.has(r.tableId)).length;
    this.allChecked = n > 0 && c === n;
    this.indeterminate = c > 0 && c < n;
  }

  openEdit(row?: any): void {
    const id = row?.tableId ?? [...this.checkedIds][0];
    if (!id) {
      this.message.warning('请选择要修改的数据');
      return;
    }
    this.router.navigate(['/tool/gen-edit', id]);
  }

  openImport(): void {
    this.importVisible = true;
    this.dbChecked.clear();
    this.loadDb();
  }
  loadDb(): void {
    this.dbLoading = true;
    this.api.dbList(this.dbQuery).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.dbList = p.list;
        this.dbTotal = p.total;
        this.dbLoading = false;
      },
      error: () => (this.dbLoading = false),
    });
  }
  onDbItem(name: string, c: boolean): void {
    c ? this.dbChecked.add(name) : this.dbChecked.delete(name);
  }
  submitImport(): void {
    if (!this.dbChecked.size) {
      this.message.warning('请选择要导入的表');
      return;
    }
    this.api.importTable([...this.dbChecked].join(',')).subscribe({
      next: () => {
        this.message.success('导入成功');
        this.importVisible = false;
        this.getList();
      },
    });
  }

  remove(row?: any): void {
    const ids = row ? String(row.tableId) : [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: '是否确认删除选中的表数据？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          // Nest delete takes single id; delete sequentially / first id or comma if supported
          const idList = ids.split(',');
          let done = 0;
          let failed = false;
          idList.forEach((id) => {
            this.api.remove(id).subscribe({
              next: () => {
                done++;
                if (done === idList.length && !failed) {
                  this.message.success('删除成功');
                  this.checkedIds.clear();
                  this.checkedNames.clear();
                  this.getList();
                  resolve();
                }
              },
              error: () => {
                failed = true;
                reject();
              },
            });
          });
        }),
    });
  }

  preview(row: any): void {
    this.api.preview(row.tableId).subscribe({
      next: (res) => {
        const data = res?.data || {};
        this.previewTabs = Object.keys(data).map((k) => ({
          key: k,
          label: k.split('/').pop() || k,
          content: data[k] || '',
        }));
        this.previewActive = 0;
        this.previewVisible = true;
      },
    });
  }

  synch(row: any): void {
    this.modal.confirm({
      nzTitle: '确认同步',
      nzContent: `确认要强制同步"${row.tableName}"表结构吗？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.synchDb(row.tableName).subscribe({
            next: () => {
              this.message.success('同步成功');
              resolve();
            },
            error: () => reject(),
          });
        }),
    });
  }

  generate(row?: any): void {
    if (row) {
      if (row.genType === '1') {
        this.api.genCode(row.tableName).subscribe({
          next: (res) => this.message.success(res?.msg || '成功生成到自定义路径'),
        });
      } else {
        this.downloadZip(row.tableName);
      }
      return;
    }
    const names = [...this.checkedNames];
    if (!names.length) {
      this.message.warning('请选择要生成的数据');
      return;
    }
    // 多选统一 zip；单选且路径模式走 genCode
    if (names.length === 1) {
      const one = this.list().find((r) => r.tableName === names[0]);
      if (one?.genType === '1') {
        this.api.genCode(one.tableName).subscribe({
          next: (res) => this.message.success(res?.msg || '成功生成到自定义路径'),
        });
        return;
      }
    }
    this.downloadZip(names.join(','));
  }

  private downloadZip(tableNames: string): void {
    this.api.downloadZip(tableNames).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ruoyi.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.message.error('下载失败'),
    });
  }
}
