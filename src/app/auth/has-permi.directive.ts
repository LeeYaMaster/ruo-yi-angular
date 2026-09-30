import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * 等价于 Vue v-hasPermi
 * 用法：*hasPermi="['system:user:add']"
 */
@Directive({
  selector: '[hasPermi]',
  standalone: true,
})
export class HasPermiDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthService);
  private flags: string[] = [];
  private created = false;

  constructor() {
    effect(() => {
      // 依赖 permissions signal，登录后刷新可见性
      this.auth.permissions();
      this.render();
    });
  }

  @Input()
  set hasPermi(value: string | string[] | null | undefined) {
    this.flags = Array.isArray(value) ? value : value ? [value] : [];
    this.render();
  }

  private render(): void {
    const ok = this.auth.hasPermi(this.flags);
    if (ok && !this.created) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.created = true;
    } else if (!ok && this.created) {
      this.viewContainer.clear();
      this.created = false;
    } else if (!ok && !this.created) {
      this.viewContainer.clear();
    }
  }
}
