import { Component } from '@angular/core';
import { BuilderForm } from '../../builder/builder-form/builder-form';
import { FormConfig, GroupValidator } from '../../builder/builder-form/builder-form.model';
import { Validators } from '@angular/forms';
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject, of, delay, concatMap, mergeMap, switchMap } from 'rxjs';

@Component({
  selector: 'app-welcome',
  imports: [BuilderForm],
  templateUrl: './welcome.html',
  styleUrl: './welcome.less',
})
export class Welcome {
  formConfig: FormConfig = [
    // {
    //   name: 'name',
    //   component: 'input',
    //   label: 'Name',
    //   placeholder: 'Enter your name',
    //   rules: {
    //     // required: true,
    //     // minlength: 2,
    //     // maxlength: 5
    //     custom: ['phone']
    //   },
    //   errorMessage: {
    //     // required: 'Please input your name',
    //     // minlength: 'Name must be at least 2 characters',
    //     // maxlength: 'Name must be at most 5 characters',
    //     phone: 'Phone number is invalid',
    //   },
    //   defaultValue: ''
    // },{
    //   name: 'age',
    //   component: 'input',
    //   label: 'Age',
    //   placeholder: 'Enter your age',
    //   when: (form: any) => form.name === '1',
    //   rules: {
    //     required: true,
    //   },
    //   errorMessage: {
    //     required: 'Please input your age',
    //   },
    //     // { type: "range", value: [18, 30], error: "age must be between 18 and 30" },
    //     // { type: "custom", validator: "noFloat", error: "cannot input decimal" }
    // },{
    //   name: 'sex',
    //   component: 'input',
    //   label: 'Sex',
    //   placeholder: 'Enter your sex',
    //   when: (form: any) => form.name === '1' && form.age === '2'
    // },
    // todo   // 可选：触发时机、异步校验、条件校验
    // pattern
    // validateTrigger: 'blur',
    // asyncValidator: 'remoteUnique',   // 运行时注入
    // {
    //   name: 'password',
    //   component: 'input',
    //   label: 'Password',
    //   placeholder: 'Enter your password',
    //   rules: {
    //     required: true,
    //   },
    // },
    // {
    //   name: 'confirmPassword',
    //   component: 'input',
    //   label: 'Confirm Password',
    //   placeholder: 'Enter your confirm password',
    //   rules: {
    //     required: true,
    //     custom: ['confirmMismatch']
    //   },
    //   errorMessage: {
    //     mismatch: 'The two passwords do not match',
    //   }
    // },
  ];
  // ****** 整组交叉校验 ******
  // groupValidators: GroupValidator[] = [
  //   {
  //     name: 'confirmMismatch',          // 规则名
  //     validator: 'confirmPassword',     // 运行时注入的函数名
  //     fields: ['password', 'confirmPassword'], // 依赖字段
  //     errorKey: 'mismatch',
  //     message: 'The two passwords do not match' // 整组报错文案
  //   }
  // ]

  ngOnInit(): void {
    // const s$ = new Subject(); // 1
    // const b$ = new BehaviorSubject(0); // 2
    // const r$ = new ReplaySubject(5); // 3
    // const a$ = new AsyncSubject(); // 4

    // 先发射一些值
    // [s$, b$, r$, a$].forEach(($) => $.next(1));
    // [s$, b$, r$, a$].forEach(($) => $.next(2));
    
    // 晚订阅
    
    // [a$].forEach(($) => $.next(1));
    // [a$].forEach(($) => $.next(2));
    // r$.subscribe((v) => console.log('Replay', v));
    // [a$].forEach(($) => $.next(3));
    // [s$].forEach(($) => $.next(2));
    // [s$].forEach(($) => $.next(3));
    // b$.subscribe((v) => console.log('Behavior', v));
    // r$.subscribe((v) => console.log('Replay', v));
    // a$.subscribe((v) => console.log('Async', v));

    // 手动完成
    // [s$, b$, r$, a$].forEach(($) => $.complete());
    // [a$].forEach(($) => $.complete());

    // const outer$ = of('A', 'B', 'C');          // 每 0 ms
    // const inner = (letter: string) =>
    //   of(letter, letter, letter).pipe(delay(100)); // 每 100 ms
    // // 1. 排队（串行）
    // outer$.pipe(concatMap(inner)).subscribe(v => console.log('concat', v));
    // // 2. 全开（并发）
    // outer$.pipe(mergeMap(inner)).subscribe(v => console.log('merge', v));
    // // 3. 切换（最新保留）
    // outer$.pipe(switchMap(inner)).subscribe(v => console.log('switch', v));
  }
}
