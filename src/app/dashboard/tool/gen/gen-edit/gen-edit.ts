import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { GenApiService } from '../../../../api/tool/gen.api.service';
import { DictApiService } from '../../../../api/system/dict.api.service';
import { MenuApiService } from '../../../../api/system/menu.api.service';
import { handleTree, parsePage } from '../../../../util/ruoyi.util';

@Component({
  selector: 'app-gen-edit',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzCheckboxModule,
    NzRadioModule,
    NzGridModule,
    NzTreeSelectModule,
    NzToolTipModule,
    NzIconModule,
    NzSpinModule,
  ],
  templateUrl: './gen-edit.html',
  styleUrl: './gen-edit.less',
})
export class GenEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(GenApiService);
  private dictApi = inject(DictApiService);
  private menuApi = inject(MenuApiService);
  private message = inject(NzMessageService);

  loading = signal(true);
  submitting = false;
  activeTab = 1; // 字段信息 default like Vue
  info: any = {};
  columns: any[] = [];
  tables: any[] = [];
  dictOptions: { dictType: string; dictName: string }[] = [];
  menuNodes: any[] = [];
  subColumns: any[] = [];

  javaTypes = ['Number', 'String', 'BigInt', 'Date', 'Boolean'];
  queryTypes = [
    { label: '=', value: 'EQ' },
    { label: '!=', value: 'NE' },
    { label: '>', value: 'GT' },
    { label: '>=', value: 'GTE' },
    { label: '<', value: 'LT' },
    { label: '<=', value: 'LTE' },
    { label: 'LIKE', value: 'LIKE' },
    { label: 'BETWEEN', value: 'BETWEEN' },
  ];
  htmlTypes = [
    { label: '文本框', value: 'input' },
    { label: '文本域', value: 'textarea' },
    { label: '下拉框', value: 'select' },
    { label: '单选框', value: 'radio' },
    { label: '复选框', value: 'checkbox' },
    { label: '日期控件', value: 'datetime' },
    { label: '图片上传', value: 'imageUpload' },
    { label: '文件上传', value: 'fileUpload' },
    { label: '富文本控件', value: 'editor' },
  ];

  ngOnInit(): void {
    const tableId = this.route.snapshot.paramMap.get('tableId');
    if (!tableId) {
      this.message.error('缺少表 ID');
      this.goBack();
      return;
    }
    this.dictApi.optionselect().subscribe({
      next: (res) => (this.dictOptions = res?.data ?? []),
    });
    this.menuApi.list().subscribe({
      next: (res) => {
        const data = handleTree(res?.data ?? [], 'menuId');
        this.menuNodes = [
          {
            title: '主类目',
            key: 0,
            value: 0,
            children: this.toTreeSelect(data),
          },
        ];
      },
    });
    this.api.get(tableId).subscribe({
      next: (res) => {
        const payload = res?.data ?? {};
        this.info = { ...(payload.info ?? {}) };
        this.columns = [...(this.info.columns ?? [])];
        // Nest may not return tables; fall back to list
        if (Array.isArray(payload.tables) && payload.tables.length) {
          this.tables = payload.tables;
          this.applySubColumns(this.info.subTableName);
          this.loading.set(false);
        } else {
          this.api.list({ pageNum: 1, pageSize: 200 }).subscribe({
            next: (listRes) => {
              const p = parsePage(listRes);
              this.tables = p.list || [];
              this.applySubColumns(this.info.subTableName);
              this.loading.set(false);
            },
            error: () => {
              this.tables = [];
              this.loading.set(false);
            },
          });
        }
        // parse options JSON (tree / parentMenuId)
        this.parseOptions();
      },
      error: () => {
        this.loading.set(false);
        this.message.error('加载表配置失败');
      },
    });
  }

  private toTreeSelect(nodes: any[]): any[] {
    return (nodes || []).map((n) => ({
      title: n.menuName,
      key: n.menuId,
      value: n.menuId,
      children: n.children?.length ? this.toTreeSelect(n.children) : undefined,
      isLeaf: !n.children?.length,
    }));
  }

  private parseOptions(): void {
    try {
      const opt = this.info.options ? JSON.parse(this.info.options) : {};
      if (opt.parentMenuId != null) this.info.parentMenuId = opt.parentMenuId;
      if (opt.treeCode) this.info.treeCode = opt.treeCode;
      if (opt.treeParentCode) this.info.treeParentCode = opt.treeParentCode;
      if (opt.treeName) this.info.treeName = opt.treeName;
    } catch {
      /* ignore */
    }
  }

  private buildOptions(): string {
    const opt: any = {};
    if (this.info.parentMenuId != null && this.info.parentMenuId !== '') {
      opt.parentMenuId = this.info.parentMenuId;
    }
    if (this.info.tplCategory === 'tree') {
      if (this.info.treeCode) opt.treeCode = this.info.treeCode;
      if (this.info.treeParentCode) opt.treeParentCode = this.info.treeParentCode;
      if (this.info.treeName) opt.treeName = this.info.treeName;
    }
    return JSON.stringify(opt);
  }

  flagChecked(row: any, key: string): boolean {
    return row[key] === '1' || row[key] === 1 || row[key] === true;
  }
  setFlag(row: any, key: string, checked: boolean): void {
    row[key] = checked ? '1' : '0';
  }

  onTplCategoryChange(v: string): void {
    if (v !== 'sub') {
      this.info.subTableName = '';
      this.info.subTableFkName = '';
      this.subColumns = [];
    }
  }

  onSubTableChange(name: string): void {
    this.info.subTableFkName = '';
    this.applySubColumns(name);
  }

  private applySubColumns(name?: string): void {
    if (!name) {
      this.subColumns = [];
      return;
    }
    const t = this.tables.find((x) => x.tableName === name);
    if (t?.columns?.length) {
      this.subColumns = t.columns;
      return;
    }
    if (t?.tableId) {
      this.api.get(t.tableId).subscribe({
        next: (res) => {
          this.subColumns = res?.data?.info?.columns ?? [];
        },
      });
    } else {
      this.subColumns = [];
    }
  }

  validateBasic(): string | null {
    if (!this.info.tableName) return '请输入表名称';
    if (!this.info.tableComment) return '请输入表描述';
    if (!this.info.className) return '请输入实体类名称';
    if (!this.info.functionAuthor) return '请输入作者';
    return null;
  }

  validateGen(): string | null {
    if (!this.info.tplCategory) return '请选择生成模板';
    if (!this.info.packageName) return '请输入生成包路径';
    if (!this.info.moduleName) return '请输入生成模块名';
    if (!this.info.businessName) return '请输入生成业务名';
    if (!this.info.functionName) return '请输入生成功能名';
    return null;
  }

  submit(): void {
    const err = this.validateBasic() || this.validateGen();
    if (err) {
      this.message.error(err);
      return;
    }
    this.submitting = true;
    const payload = {
      ...this.info,
      columns: this.columns,
      options: this.buildOptions(),
    };
    // strip UI-only fields that are stored in options
    delete payload.treeCode;
    delete payload.treeParentCode;
    delete payload.treeName;
    delete payload.parentMenuId;
    this.api.update(payload).subscribe({
      next: (res) => {
        this.message.success(res?.msg || '操作成功');
        this.submitting = false;
        this.goBack();
      },
      error: () => (this.submitting = false),
    });
  }

  goBack(): void {
    this.router.navigate(['/tool/gen']);
  }
}
