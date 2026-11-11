import { Component, Input, inject, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuillEditorComponent } from 'ngx-quill';
import { Config } from '../../http/config';

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
  private http = inject(HttpClient);

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

  onEditorCreated(quill: any): void {
    const toolbar = quill?.getModule?.('toolbar');
    if (!toolbar) return;
    toolbar.addHandler('image', () => this.pickAndUpload(quill, 'image'));
    toolbar.addHandler('video', () => this.pickAndUpload(quill, 'video'));
  }

  private pickAndUpload(quill: any, type: 'image' | 'video'): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append('file', file);
      this.http.post<any>(Config.API_URL + 'common/upload', form).subscribe({
        next: (res) => {
          const raw = res?.data?.url || res?.data?.fileName || res?.url || res?.fileName;
          if (!raw) return;
          const url = this.resolveUrl(raw);
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, type, url, 'user');
          quill.setSelection(range.index + 1);
        },
      });
    };
    input.click();
  }

  private resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const base = Config.API_URL.replace(/\/$/, '');
    return path.startsWith('/') ? base.replace(/\/dev-api$|\/api$/, '') + path : base + '/' + path;
  }
}
