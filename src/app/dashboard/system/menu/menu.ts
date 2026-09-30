import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { MenuApiService } from '../../../api/system/menu.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { handleTree, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzIconModule,
    NzRadioModule,
    NzInputNumberModule,
    NzTreeSelectModule,
    HasPermiDirective,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.less',
})
export class Menu implements OnInit {
  private menuApi = inject(MenuApiService);
  private dictService = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal(false);
  menuList = signal<any[]>([]);
  statusOptions: DictOption[] = [];
  showHideOptions: DictOption[] = [];

  query = { menuName: '', status: undefined as string | undefined };
  expandAll = true;

  modalVisible = false;
  modalTitle = '新增菜单';
  submitting = false;
  form: any = this.emptyForm();
  parentNodes: any[] = [];

  parseTime = parseTime;

  ngOnInit(): void {
    this.dictService.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.dictService.getDict('sys_show_hide').subscribe((d) => (this.showHideOptions = d));
    this.getList();
  }

  emptyForm() {
    return {
      menuId: undefined as number | undefined,
      parentId: 0,
      menuType: 'M',
      menuName: '',
      icon: '',
      orderNum: 0,
      isFrame: '1',
      isCache: '0',
      path: '',
      component: '',
      perms: '',
      query: '',
      visible: '0',
      status: '0',
    };
  }

  getList(): void {
    this.loading.set(true);
    this.menuApi.list(this.query).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.menuList.set(handleTree(data, 'menuId'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void {
    this.getList();
  }

  onReset(): void {
    this.query = { menuName: '', status: undefined };
    this.getList();
  }

  loadParentOptions(excludeId?: number): void {
    this.menuApi.list().subscribe({
      next: (res) => {
        const data = handleTree(res?.data ?? [], 'menuId');
        const root = { title: '主类目', key: 0, value: 0, children: this.toTreeSelect(data, excludeId) };
        this.parentNodes = [root];
      },
    });
  }

  toTreeSelect(nodes: any[], excludeId?: number): any[] {
    return (nodes || [])
      .filter((n) => n.menuId !== excludeId)
      .map((n) => ({
        title: n.menuName,
        key: n.menuId,
        value: n.menuId,
        children: n.children ? this.toTreeSelect(n.children, excludeId) : undefined,
        isLeaf: !(n.children && n.children.length),
      }));
  }

  openAdd(row?: any): void {
    this.form = this.emptyForm();
    if (row?.menuId != null) this.form.parentId = row.menuId;
    this.modalTitle = '新增菜单';
    this.loadParentOptions();
    this.modalVisible = true;
  }

  openEdit(row: any): void {
    this.modalTitle = '修改菜单';
    this.menuApi.get(row.menuId).subscribe({
      next: (res) => {
        const m = res?.data ?? {};
        this.form = {
          menuId: m.menuId,
          parentId: m.parentId ?? 0,
          menuType: m.menuType ?? 'M',
          menuName: m.menuName,
          icon: m.icon ?? '',
          orderNum: m.orderNum ?? 0,
          isFrame: m.isFrame ?? '1',
          isCache: m.isCache ?? '0',
          path: m.path ?? '',
          component: m.component ?? '',
          perms: m.perms ?? '',
          query: m.query ?? '',
          visible: m.visible ?? '0',
          status: m.status ?? '0',
        };
        this.loadParentOptions(m.menuId);
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    if (!this.form.menuName) {
      this.message.warning('菜单名称不能为空');
      return;
    }
    if (this.form.parentId == null) {
      this.message.warning('请选择上级菜单');
      return;
    }
    this.submitting = true;
    const req$ = this.form.menuId ? this.menuApi.update(this.form) : this.menuApi.add(this.form);
    req$.subscribe({
      next: () => {
        this.message.success('操作成功');
        this.modalVisible = false;
        this.submitting = false;
        this.getList();
      },
      error: () => (this.submitting = false),
    });
  }

  remove(row: any): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除名称为"${row.menuName}"的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.menuApi.remove(row.menuId).subscribe({
            next: () => {
              this.message.success('删除成功');
              this.getList();
              resolve();
            },
            error: () => reject(),
          });
        }),
    });
  }

  statusLabel(val: string): string {
    return this.dictService.label(this.statusOptions, val);
  }
}
