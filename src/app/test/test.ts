import { Component, computed, effect, signal, Signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.less',
})
export class Test {
  count: WritableSignal<number> = signal(0);
  doubleCount: Signal<number> = computed(() => this.count() * 2);
  constructor() {
    effect(() => {
      console.log(`The current count is: ${this.count()}`);
    });
  }
}
