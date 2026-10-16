import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

/** Lightweight Quill wrapper aligned with Vue RuoYi Editor (HTML content). */
@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, QuillEditorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditor),
      multi: true,
    },
  ],
  templateUrl: './rich-editor.html',
  styleUrl: './rich-editor.less',
})
export class RichEditor implements ControlValueAccessor {
  @Input() placeholder = '请输入内容';
  @Input() minHeight = 192;
  @Input() readOnly = false;

  value = '';
  disabled = false;

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video'],
    ],
  };

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string | null): void {
    this.value = v ?? '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(v: string): void {
    this.value = v ?? '';
    this.onChange(this.value);
  }
  onBlur(): void {
    this.onTouched();
  }
}
