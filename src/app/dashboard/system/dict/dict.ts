import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { DictApiService } from '../../../api/system/dict.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { DownloadService } from '../../../http/download.service';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-dict',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, NzRadioModule, NzInputNumberModule, NzDrawerModule, HasPermiDirective, BuilderTable, BuilderForm],
  templateUrl: './dict.html', styleUrl: './dict.less',
})
export class Dict implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;
  @ViewChild('dbt') dbt?: BuilderTable;
  @ViewChild('dbf') dbf?: BuilderForm;
  private api = inject(DictApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);

  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, dictName: '', dictType: '', status: undefined as string | undefined };
  checkedIds = new Set<number>();
  modalVisible = false; modalTitle = '新增字典类型'; submitting = false;
  formConfig: FormConfig = [];
  dataFormConfig: FormConfig = [];
  editingId?: number;
  editingDataId?: number;
  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'dictId', title: '字典编号', width: '90px' },
    { key: 'dictName', title: '字典名称' },
    { key: 'dictType', title: '字典类型' },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'remark', title: '备注' },
    { key: 'createTime', title: '创建时间', format: (_r, v) => this.parseTime(v) || '' },
  ];
  dataColumns: BuilderTableColumn[] = [
    { key: 'dictLabel', title: '字典标签' },
    { key: 'dictValue', title: '字典键值' },
    { key: 'dictSort', title: '排序', width: '80px' },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
  ];

  // data drawer
  dataOpen = false; currentType = ''; dataLoading = false; dataList: any[] = []; dataTotal = 0;
  dataQuery = { pageNum: 1, pageSize: 10, dictType: '', dictLabel: '', status: undefined as string | undefined };
  dataModalVisible = false; dataModalTitle = '新增字典数据'; dataSubmitting = false;
  dataForm: any = this.emptyDataForm();
  dataChecked = new Set<number>();

  ngOnInit() {
    this.dict.getDict('sys_normal_disable').subscribe(d => this.statusOptions = d);
    this.getList();
  }
  emptyForm() { return { dictId: undefined as number | undefined, dictName: '', dictType: '', status: '0', remark: '' }; }
  emptyDataForm() { return { dictCode: undefined as number | undefined, dictType: '', dictLabel: '', dictValue: '', dictSort: 0, status: '0', remark: '', listClass: 'default', cssClass: '' }; }

  getList() {
    this.loading.set(true);
    this.api.listType(this.query).subscribe({
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); this.checkedIds.clear(); this.bt?.clearSelection(); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.query.pageNum = 1; this.getList(); }
  onReset() { this.query = { pageNum: 1, pageSize: 10, dictName: '', dictType: '', status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }
  private buildTypeForm(data: any): FormConfig {
    return [
      { name: 'dictName', component: 'input', label: '字典名称', rules: { required: true }, errorMessage: { required: '字典名称不能为空' }, defaultValue: data.dictName ?? '' },
      { name: 'dictType', component: 'input', label: '字典类型', rules: { required: true }, errorMessage: { required: '字典类型不能为空' }, defaultValue: data.dictType ?? '' },
      { name: 'status', component: 'radio', label: '状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'remark', component: 'textarea', label: '备注', defaultValue: data.remark ?? '', rows: 3 },
    ];
  }
  private buildDataForm(data: any): FormConfig {
    return [
      { name: 'dictType', component: 'input', label: '字典类型', defaultValue: data.dictType ?? this.currentType, disabled: true },
      { name: 'dictLabel', component: 'input', label: '数据标签', rules: { required: true }, errorMessage: { required: '数据标签不能为空' }, defaultValue: data.dictLabel ?? '' },
      { name: 'dictValue', component: 'input', label: '数据键值', rules: { required: true }, errorMessage: { required: '数据键值不能为空' }, defaultValue: data.dictValue ?? '' },
      { name: 'dictSort', component: 'number', label: '显示排序', rules: { required: true }, defaultValue: data.dictSort ?? 0, min: 0 },
      { name: 'status', component: 'radio', label: '状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'remark', component: 'textarea', label: '备注', defaultValue: data.remark ?? '', rows: 2 },
    ];
  }
  openAdd() { this.editingId = undefined; this.modalTitle = '新增字典类型'; this.formConfig = this.buildTypeForm({}); this.modalVisible = true; }
  openEdit(row?: any) {
    const id = row?.dictId ?? [...this.checkedIds][0]; if (!id) return;
    this.modalTitle = '修改字典类型';
    this.api.getType(id).subscribe({ next: (res) => { const d = res?.data ?? {}; this.editingId = d.dictId; this.formConfig = this.buildTypeForm(d); this.modalVisible = true; } });
  }
  submit() {
    const bf = this.bf; if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const value = bf.getRawValue();
    this.submitting = true;
    const payload = { ...value, dictId: this.editingId };
    const req$ = this.editingId ? this.api.updateType(payload) : this.api.addType(payload);
    req$.subscribe({ next: () => { this.message.success('操作成功'); this.modalVisible = false; this.submitting = false; this.dict.clear(); this.getList(); }, error: () => this.submitting = false });
  }
  remove(row?: any) {
    const ids = row?.dictId ?? [...this.checkedIds].join(','); if (!ids) return;
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除字典编号为"${ids}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.removeType(ids).subscribe({ next: () => { this.message.success('删除成功'); this.dict.clear(); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  export(): void {
    this.download.download('system/dict/type/export', { ...this.query }, `dict_${Date.now()}.xlsx`);
  }

  refreshCache() { this.api.refreshCache().subscribe({ next: () => { this.dict.clear(); this.message.success('刷新成功'); } }); }
  statusLabel(v: string) { return this.dict.label(this.statusOptions, v); }

  openData(row: any) {
    this.currentType = row.dictType;
    this.dataQuery = { pageNum: 1, pageSize: 10, dictType: row.dictType, dictLabel: '', status: undefined };
    this.dataOpen = true;
    this.getDataList();
  }
  getDataList() {
    this.dataLoading = true;
    this.api.listData(this.dataQuery).subscribe({
      next: (res) => { const p = parsePage(res); this.dataList = p.list; this.dataTotal = p.total; this.dataLoading = false; this.dataChecked.clear(); this.dbt?.clearSelection(); },
      error: () => this.dataLoading = false,
    });
  }
  openAddData() {
    this.editingDataId = undefined;
    this.dataModalTitle = '新增字典数据';
    this.dataFormConfig = this.buildDataForm({ dictType: this.currentType });
    this.dataModalVisible = true;
  }
  openEditData(row: any) {
    this.dataModalTitle = '修改字典数据';
    this.api.getData(row.dictCode).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.editingDataId = d.dictCode;
        this.dataFormConfig = this.buildDataForm(d);
        this.dataModalVisible = true;
      },
    });
  }
  submitData() {
    const bf = this.dbf; if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const value = bf.getRawValue();
    this.dataSubmitting = true;
    const payload = { ...value, dictCode: this.editingDataId, dictType: this.currentType };
    const req$ = this.editingDataId ? this.api.updateData(payload) : this.api.addData(payload);
    req$.subscribe({ next: () => { this.message.success('操作成功'); this.dataModalVisible = false; this.dataSubmitting = false; this.dict.clear(this.currentType); this.getDataList(); }, error: () => this.dataSubmitting = false });
  }
  removeData(row: any) {
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除字典编码为"${row.dictCode}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.removeData(row.dictCode).subscribe({ next: () => { this.message.success('删除成功'); this.dict.clear(this.currentType); this.getDataList(); resolve(); }, error: () => reject() });
    })});
  }
}
