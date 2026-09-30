import { inject, Injectable } from '@angular/core';
import { Observable, of, tap, map, shareReplay } from 'rxjs';
import { DictApiService } from './system/dict.api.service';

export interface DictOption {
  label: string;
  value: string;
  elTagType?: string;
  elTagClass?: string;
  raw?: any;
}

@Injectable({ providedIn: 'root' })
export class DictService {
  private api = inject(DictApiService);
  private cache = new Map<string, Observable<DictOption[]>>();

  getDict(dictType: string): Observable<DictOption[]> {
    if (!this.cache.has(dictType)) {
      const req$ = this.api.getDicts(dictType).pipe(
        map((res: any) => {
          const list = res?.data ?? [];
          return (Array.isArray(list) ? list : []).map((item: any) => ({
            label: item.dictLabel,
            value: String(item.dictValue),
            elTagType: item.listClass,
            elTagClass: item.cssClass,
            raw: item
          }));
        }),
        shareReplay(1)
      );
      this.cache.set(dictType, req$);
    }
    return this.cache.get(dictType)!;
  }

  clear(dictType?: string): void {
    if (dictType) {
      this.cache.delete(dictType);
    } else {
      this.cache.clear();
    }
  }

  label(options: DictOption[], value: any): string {
    const hit = options.find((o) => o.value === String(value));
    return hit?.label ?? (value == null ? '' : String(value));
  }
}
