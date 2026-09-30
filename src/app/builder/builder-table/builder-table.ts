import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BuilderTableColumn } from './builder-table.model';

@Component({
  selector: 'app-builder-table',
  imports: [CommonModule, NzTableModule],
  templateUrl: './builder-table.html',
  styleUrl: './builder-table.less',
})
export class BuilderTable {
  @Input() columns: BuilderTableColumn[] = [];
  @Input() data: readonly any[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() pageIndex = 1;
  @Input() pageSize = 10;
  /** primary key field used for selection */
  @Input() rowKey = 'id';
  @Input() showCheckbox = true;
  @Input() bordered = true;
  @Input() size: 'small' | 'middle' | 'default' = 'middle';
  @Input() actionWidth = '140px';

  @Output() pageIndexChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<Set<any>>();

  /** projected action cell: <ng-template #actions let-row>…</ng-template> */
  @ContentChild('actions') actionsTpl?: TemplateRef<{ $implicit: any }>;

  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<any>();
  private currentPageData: readonly any[] = [];

  cellValue(row: any, col: BuilderTableColumn): any {
    const raw = row?.[col.key];
    return col.format ? col.format(row, raw) : raw;
  }

  trackRow = (_: number, row: any) => row?.[this.rowKey] ?? _;

  onCurrentPageDataChange(list: readonly any[]): void {
    this.currentPageData = list;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const list = this.currentPageData;
    if (!list.length) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }
    const keys = list.map((r) => r[this.rowKey]);
    this.checked = keys.every((id) => this.setOfCheckedId.has(id));
    this.indeterminate = keys.some((id) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: any, checked: boolean): void {
    if (checked) this.setOfCheckedId.add(id);
    else this.setOfCheckedId.delete(id);
    this.refreshCheckedStatus();
    this.selectionChange.emit(new Set(this.setOfCheckedId));
  }

  onAllChecked(checked: boolean): void {
    this.currentPageData.forEach((r) => {
      const id = r[this.rowKey];
      if (checked) this.setOfCheckedId.add(id);
      else this.setOfCheckedId.delete(id);
    });
    this.refreshCheckedStatus();
    this.selectionChange.emit(new Set(this.setOfCheckedId));
  }

  /** clear selection (e.g. after reload) */
  clearSelection(): void {
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus();
    this.selectionChange.emit(new Set());
  }

  /** sync external selection */
  setSelection(ids: Iterable<any>): void {
    this.setOfCheckedId = new Set(ids);
    this.refreshCheckedStatus();
  }
}
