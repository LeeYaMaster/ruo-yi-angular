import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeComponent, NzTreeModule, NzTreeNode } from 'ng-zorro-antd/tree';
import { ErrorMessage, FormConfig, FormConfigItem, GroupValidator, RulesKey } from './builder-form.model';
import { CommonModule } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { confirmPasswordValidator, phoneValidator } from './builder-form.validators';
import { RichEditor } from '../../shared/rich-editor/rich-editor';

type TreeUiState = { expandAll: boolean; nodeAll: boolean; linkage: boolean };

@Component({
  selector: 'app-builder-form',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzRadioModule,
    NzInputNumberModule,
    NzIconModule,
    NzGridModule,
    NzTreeSelectModule,
    NzTreeModule,
    CommonModule,
    RichEditor,
  ],
  templateUrl: './builder-form.html',
  styleUrl: './builder-form.less',
})
export class BuilderForm implements OnChanges {
  @Input() formConfig: FormConfig = [];
  @Input() groupValidators: GroupValidator[] = [];
  /** login | vertical — login keeps icon-prefix style without labels */
  @Input() layout: 'login' | 'vertical' | 'horizontal' = 'login';
  @Input() submitText = '提交';
  @Input() showSubmit = true;
  @Input() labelSpan = 6;
  @Input() controlSpan = 16;
  @Output() submitFormEvent = new EventEmitter<any>();

  @ViewChildren(NzTreeComponent) private treeComps?: QueryList<NzTreeComponent>;

  private fb = inject(NonNullableFormBuilder);
  private notification = inject(NzNotificationService);
  validateForm = this.fb.group({});
  private built = false;
  treeUi: Record<string, TreeUiState> = {};

  getControlErrorsMessage(control: AbstractControl, errorMessage: ErrorMessage = {}): string[] {
    return Object.keys(control.errors ?? {}).map((key) => errorMessage?.[key as RulesKey] ?? '');
  }

  getFormErrorsMessage(): string {
    const errorsKeys = Object.keys(this.validateForm.errors ?? {});
    const arr = errorsKeys.map(
      (key) => this.groupValidators.find((item) => item.errorKey === key)?.message ?? ''
    );
    return arr.join('\n');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && this.formConfig?.length) {
      this.buildForm();
    }
  }

  ngOnInit(): void {
    if (!this.built && this.formConfig?.length) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const next = this.fb.group({});
    this.treeUi = {};
    this.formConfig.forEach((item) => {
      const validators =
        Object.entries(item.rules ?? {}).map(([key, value]) => this.getRuleValidator(key, value)) ||
        [];
      const ctrl = this.fb.control(
        { value: item.defaultValue ?? this.defaultFor(item.component), disabled: !!item.disabled },
        validators.flat()
      );
      next.addControl(item.name, ctrl);
      if (item.component === 'tree-check') {
        this.treeUi[item.name] = {
          expandAll: item.treeExpandAll !== false,
          nodeAll: false,
          linkage: item.treeLinkage !== false,
        };
      }
    });
    this.groupValidators?.forEach((g) => {
      if (g.validator === 'confirmPassword') {
        next.setValidators(confirmPasswordValidator(g.fields[0], g.fields[1]));
      }
    });
    this.validateForm = next;
    this.built = true;
    this.clearAllHideControls(this.validateForm.value);
    this.validateForm.valueChanges.subscribe((formValue) => {
      this.clearAllHideControls(formValue);
    });
  }

  clearAllHideControls(formValue: any): void {
    this.formConfig.forEach((item) => {
      const control = this.validateForm.get(item.name);
      if (!control) return;
      const show = !item.when || item.when(formValue);
      if (show) {
        const validators =
          Object.entries(item.rules ?? {}).map(([key, value]) => this.getRuleValidator(key, value)) ||
          [];
        control.setValidators(validators.flat());
      } else {
        control.clearValidators();
        control.setErrors(null);
        if (item.component === 'tree-check') {
          const current = control.value;
          if (Array.isArray(current) && current.length) {
            control.setValue([], { emitEvent: false });
          }
        }
      }
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  getRuleValidator(key: string, value: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    const validatorMap: { [k: string]: (value: any) => ValidatorFn | ValidatorFn[] } = {
      required: (v) => (v ? Validators.required : Validators.nullValidator),
      minlength: (v) => (v ? Validators.minLength(v) : Validators.nullValidator),
      maxlength: (v) => (v ? Validators.maxLength(v) : Validators.nullValidator),
      custom: (v) => {
        const arr: ValidatorFn[] = [];
        if (Array.isArray(v) && v.includes('phone')) {
          arr.push(phoneValidator());
        }
        return arr.length ? arr : Validators.nullValidator;
      },
    };

    if (validatorMap[key]) {
      const result = validatorMap[key](value);
      if (Array.isArray(result)) {
        validators.push(...result);
      } else {
        validators.push(result);
      }
    } else {
      return [Validators.nullValidator];
    }
    return validators.length ? validators : [Validators.nullValidator];
  }


  private defaultFor(component: string): any {
    if (component === 'number') return 0;
    if (component === 'checkbox-group' || component === 'tree-check') return [];
    if (component === 'select') return '';
    return '';
  }

  isGroupChecked(name: string, value: any): boolean {
    const v = this.validateForm.get(name)?.value;
    return Array.isArray(v) && v.some((x) => String(x) === String(value));
  }

  toggleGroupValue(name: string, value: any, checked: boolean): void {
    const ctrl = this.validateForm.get(name);
    if (!ctrl) return;
    const arr = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
    const idx = arr.findIndex((x) => String(x) === String(value));
    if (checked && idx < 0) arr.push(value);
    if (!checked && idx >= 0) arr.splice(idx, 1);
    ctrl.setValue(arr);
    ctrl.markAsDirty();
  }

  treeUiOf(name: string): TreeUiState {
    if (!this.treeUi[name]) {
      this.treeUi[name] = { expandAll: true, nodeAll: false, linkage: true };
    }
    return this.treeUi[name];
  }

  private treeByName(name: string): NzTreeComponent | undefined {
    const names = this.formConfig.filter((i) => i.component === 'tree-check').map((i) => i.name);
    const idx = names.indexOf(name);
    return idx >= 0 ? this.treeComps?.get(idx) : undefined;
  }

  asTreeKeys(value: any): (string | number)[] {
    return Array.isArray(value) ? value : [];
  }

  onTreeCheckedKeys(name: string, keys: (string | number)[]): void {
    const ctrl = this.validateForm.get(name);
    if (!ctrl) return;
    ctrl.setValue(keys ?? []);
    ctrl.markAsDirty();
    const all = this.flattenTreeKeys(this.formConfig.find((i) => i.name === name)?.treeData || []);
    this.treeUiOf(name).nodeAll = all.length > 0 && all.every((k) =>
      (keys || []).some((ck) => String(ck) === String(k))
    );
  }

  setTreeExpandAll(name: string, expand: boolean): void {
    this.treeUiOf(name).expandAll = expand;
    const walk = (nodes: NzTreeNode[]) => {
      (nodes || []).forEach((n) => {
        n.isExpanded = expand;
        if (n.children?.length) walk(n.children);
      });
    };
    const tree = this.treeByName(name);
    if (tree) walk(tree.getTreeNodes());
  }

  setTreeNodeAll(name: string, checked: boolean): void {
    this.treeUiOf(name).nodeAll = checked;
    const item = this.formConfig.find((i) => i.name === name);
    const keys = checked ? this.flattenTreeKeys(item?.treeData || []) : [];
    this.onTreeCheckedKeys(name, keys);
  }

  setTreeLinkage(name: string, linkage: boolean): void {
    this.treeUiOf(name).linkage = linkage;
  }

  private flattenTreeKeys(nodes: any[]): (string | number)[] {
    const out: (string | number)[] = [];
    (nodes || []).forEach((n) => {
      if (n?.key !== undefined && n?.key !== null) out.push(n.key);
      if (n?.children?.length) out.push(...this.flattenTreeKeys(n.children));
    });
    return out;
  }

  /** checked + half-checked keys, matching RuoYi getMenuAllCheckedKeys / getDeptAllCheckedKeys */
  collectTreeKeys(name: string): number[] {
    const tree = this.treeByName(name);
    const fromTree = (list: NzTreeNode[] | undefined) =>
      (list || []).map((n) => n.key).filter((k) => k !== undefined && k !== null);
    const checked = tree
      ? fromTree(tree.getCheckedNodeList())
      : this.asTreeKeys(this.validateForm.get(name)?.value);
    const half = tree ? fromTree(tree.getHalfCheckedNodeList()) : [];
    const merged = [...half, ...checked];
    const nums = merged.map((k) => Number(k)).filter((n) => !Number.isNaN(n));
    return [...new Set(nums)];
  }

  /** Patch values after open edit modal */
  patchValue(value: Record<string, any>): void {
    this.validateForm.patchValue(value ?? {});
  }

  reset(value?: Record<string, any>): void {
    this.validateForm.reset(value ?? {});
  }

  getRawValue(): any {
    return this.validateForm.getRawValue();
  }

  /** Raw values plus tree-check keys (含半选) and linkage fields */
  getSubmitValue(): any {
    const raw = this.validateForm.getRawValue() as Record<string, any>;
    const result: Record<string, any> = {};
    this.formConfig.forEach((item: FormConfigItem) => {
      const show = !item.when || item.when(this.validateForm.value);
      if (item.component === 'tree-check') {
        result[item.name] = show ? this.collectTreeKeys(item.name) : [];
        if (item.treeLinkageName) {
          result[item.treeLinkageName] = this.treeUiOf(item.name).linkage;
        }
        return;
      }
      if (!show) return;
      result[item.name] = raw[item.name];
    });
    return result;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.submitFormEvent.emit(this.getSubmitValue());
    } else {
      Object.entries(this.validateForm.controls).forEach(([key, control]: [string, any]) => {
        if (control.invalid) {
          const currentFormConfig = this.formConfig.find((item) => item.name === key);
          this.getControlErrorsMessage(control, currentFormConfig?.errorMessage).forEach(
            (errorMessage) => {
              if (errorMessage) {
                this.notification.create('error', '表单校验失败', errorMessage);
              }
            }
          );
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
