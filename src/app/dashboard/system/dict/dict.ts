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
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { DictApiService } from '../../../api/system/dict.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';

@Component({
  selector: 'app-dict',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, NzRadioModule, NzInputNumberModule, NzDrawerModule, HasPermiDirective],
  templateUrl: './dict.html', styleUrl: './dict.less',
})
export class Dict implements OnInit {
  private api = inject(DictApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, dictName: '', dictType: '', status: undefined as string | undefined };
  checkedIds = new Set<number>(); allChecked = false; indeterminate = false;
  modalVisible = false; modalTitle = '新增字典类型'; submitting = false;
  form: any = this.emptyForm(); parseTime = parseTime;

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
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); this.checkedIds.clear(); this.refreshChecked(); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.query.pageNum = 1; this.getList(); }
  onReset() { this.query = { pageNum: 1, pageSize: 10, dictName: '', dictType: '', status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onItemChecked(id: number, c: boolean) { c ? this.checkedIds.add(id) : this.checkedIds.delete(id); this.refreshChecked(); }
  onAllChecked(c: boolean) { this.list().forEach(r => c ? this.checkedIds.add(r.dictId) : this.checkedIds.delete(r.dictId)); this.refreshChecked(); }
  refreshChecked() { const e = this.list(); this.allChecked = e.length > 0 && e.every(r => this.checkedIds.has(r.dictId)); this.indeterminate = e.some(r => this.checkedIds.has(r.dictId)) && !this.allChecked; }

  openAdd() { this.form = this.emptyForm(); this.modalTitle = '新增字典类型'; this.modalVisible = true; }
  openEdit(row?: any) {
    const id = row?.dictId ?? [...this.checkedIds][0]; if (!id) return;
    this.modalTitle = '修改字典类型';
    this.api.getType(id).subscribe({ next: (res) => { const d = res?.data ?? {}; this.form = { dictId: d.dictId, dictName: d.dictName, dictType: d.dictType, status: d.status ?? '0', remark: d.remark ?? '' }; this.modalVisible = true; } });
  }
  submit() {
    if (!this.form.dictName || !this.form.dictType) { this.message.warning('请填写完整'); return; }
    this.submitting = true;
    const req$ = this.form.dictId ? this.api.updateType(this.form) : this.api.addType(this.form);
    req$.subscribe({ next: () => { this.message.success('操作成功'); this.modalVisible = false; this.submitting = false; this.dict.clear(); this.getList(); }, error: () => this.submitting = false });
  }
  remove(row?: any) {
    const ids = row?.dictId ?? [...this.checkedIds].join(','); if (!ids) return;
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除字典编号为"${ids}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.removeType(ids).subscribe({ next: () => { this.message.success('删除成功'); this.dict.clear(); this.getList(); resolve(); }, error: () => reject() });
    })});
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
      next: (res) => { const p = parsePage(res); this.dataList = p.list; this.dataTotal = p.total; this.dataLoading = false; this.dataChecked.clear(); },
      error: () => this.dataLoading = false,
    });
  }
  openAddData() {
    this.dataForm = this.emptyDataForm();
    this.dataForm.dictType = this.currentType;
    this.dataModalTitle = '新增字典数据';
    this.dataModalVisible = true;
  }
  openEditData(row: any) {
    this.dataModalTitle = '修改字典数据';
    this.api.getData(row.dictCode).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.dataForm = { dictCode: d.dictCode, dictType: d.dictType, dictLabel: d.dictLabel, dictValue: d.dictValue, dictSort: d.dictSort ?? 0, status: d.status ?? '0', remark: d.remark ?? '', listClass: d.listClass ?? 'default', cssClass: d.cssClass ?? '' };
        this.dataModalVisible = true;
      },
    });
  }
  submitData() {
    if (!this.dataForm.dictLabel || this.dataForm.dictValue === '') { this.message.warning('请填写完整'); return; }
    this.dataSubmitting = true;
    const req$ = this.dataForm.dictCode ? this.api.updateData(this.dataForm) : this.api.addData(this.dataForm);
    req$.subscribe({ next: () => { this.message.success('操作成功'); this.dataModalVisible = false; this.dataSubmitting = false; this.dict.clear(this.currentType); this.getDataList(); }, error: () => this.dataSubmitting = false });
  }
  removeData(row: any) {
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除字典编码为"${row.dictCode}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.removeData(row.dictCode).subscribe({ next: () => { this.message.success('删除成功'); this.dict.clear(this.currentType); this.getDataList(); resolve(); }, error: () => reject() });
    })});
  }
}
