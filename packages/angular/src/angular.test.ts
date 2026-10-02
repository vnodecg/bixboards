import '@angular/compiler';
import { Component, signal, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getTestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { aTimeout, expect } from '@open-wc/testing';
import {
  BxButtonComponent,
  BxCheckboxComponent,
  BxDataTableComponent,
  BxDropdownComponent,
  BxDropdownItemComponent,
  BxInputComponent,
  BxSelectComponent,
} from './index.ts';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

@Component({
  standalone: true,
  imports: [
    BxSelectComponent,
    BxInputComponent,
    BxCheckboxComponent,
    BxButtonComponent,
    FormsModule,
  ],
  template: `
    <bx-select
      #sel
      [options]="options"
      [placeholder]="'Pick'"
      [multiple]="multiple()"
      (bxShow)="shows.push($event.type)"
      [(ngModel)]="model"
    ></bx-select>
    <bx-input label="Name" [(ngModel)]="name" name="n"></bx-input>
    <bx-checkbox [(ngModel)]="agreed">Agree</bx-checkbox>
    <bx-button class="b" (click)="clicks = clicks + 1">Go</bx-button>
  `,
})
class TemplateHost {
  @ViewChild('sel', { static: true }) select!: BxSelectComponent;
  options = options;
  multiple = signal(false);
  shows: string[] = [];
  model: unknown = 'b';
  name = 'initial';
  agreed = false;
  clicks = 0;
}

@Component({
  standalone: true,
  imports: [BxInputComponent, ReactiveFormsModule],
  template: `<bx-input [formControl]="control" label="Reactive"></bx-input>`,
})
class ReactiveHost {
  control = new FormControl('start');
}

@Component({
  standalone: true,
  imports: [
    BxDropdownComponent,
    BxDropdownItemComponent,
    BxButtonComponent,
    BxDataTableComponent,
  ],
  template: `
    <bx-dropdown #dd (bxSelect)="selected.set($event.detail.value)">
      <bx-button slot="trigger">Menu</bx-button>
      <bx-dropdown-item value="one">One</bx-dropdown-item>
    </bx-dropdown>
    <bx-data-table
      [columns]="columns"
      [data]="rows"
      [rowHeight]="30"
      style="display:block;block-size:200px;inline-size:400px"
    ></bx-data-table>
  `,
})
class DataHost {
  @ViewChild('dd', { static: true }) dropdown!: BxDropdownComponent;
  selected = signal('');
  columns = [{ field: 'n', header: 'N' }];
  rows = [{ n: 1 }, { n: 2 }, { n: 3 }];
}

const stable = async (fixture: {
  whenStable(): Promise<unknown>;
  detectChanges(): void;
}) => {
  fixture.detectChanges();
  await fixture.whenStable();
  await aTimeout(30);
};

describe('@bixant/angular', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('registers the elements and matches them as known components (no schema needed)', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    const root = fixture.nativeElement as HTMLElement;
    for (const tag of ['bx-select', 'bx-input', 'bx-checkbox', 'bx-button'])
      expect(root.querySelector(tag), tag).to.be.instanceOf(
        customElements.get(tag)!,
      );
  });

  it('forwards @Input() to element properties (objects by reference) and exposes the element', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    const select = fixture.componentInstance.select;
    expect(select.element.options).to.equal(options);
    expect(select.element.placeholder).to.equal('Pick');
    expect(select.options).to.equal(options); // getter mirrors the element

    fixture.componentInstance.multiple.set(true);
    await stable(fixture);
    expect(select.element.multiple).to.be.true;
  });

  it('emits @Output() for bx-* events, and native input/change stay plain DOM events', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    fixture.componentInstance.select.show();
    await stable(fixture);
    expect(fixture.componentInstance.shows).to.deep.equal(['bx-show']);

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'bx-button',
    )!;
    button.dispatchEvent(new MouseEvent('click'));
    await stable(fixture);
    expect(fixture.componentInstance.clicks).to.equal(1);
  });

  it('wraps public methods with the element signatures', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    const select = fixture.componentInstance.select;
    select.show();
    expect(select.element.open).to.be.true;
    select.hide();
    await stable(fixture);
    expect(select.element.open).to.be.false;
  });

  it('is a ControlValueAccessor for template-driven forms (ngModel)', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const select = fixture.componentInstance.select.element;
    expect(select.value).to.equal('b'); // model -> element

    select.value = 'a';
    select.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    await stable(fixture);
    expect(fixture.componentInstance.model).to.equal('a'); // element -> model

    const input = root.querySelector('bx-input') as HTMLElement & {
      value: string;
    };
    expect(input.value).to.equal('initial');
    const inner = input.shadowRoot!.querySelector('input')!;
    inner.value = 'typed';
    inner.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await stable(fixture);
    expect(fixture.componentInstance.name).to.equal('typed');

    const checkbox = root.querySelector('bx-checkbox') as HTMLElement & {
      checked: boolean;
    };
    checkbox.checked = true;
    checkbox.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    await stable(fixture);
    expect(fixture.componentInstance.agreed).to.be.true;
  });

  it('works with reactive forms: value, disabled state and touched on blur', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await stable(fixture);
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'bx-input',
    ) as HTMLElement & {
      value: string;
      disabled: boolean;
    };
    const { control } = fixture.componentInstance;
    expect(input.value).to.equal('start');
    control.setValue('changed');
    await stable(fixture);
    expect(input.value).to.equal('changed');

    control.disable();
    await stable(fixture);
    expect(input.disabled).to.be.true;
    control.enable();
    await stable(fixture);
    expect(input.disabled).to.be.false;

    expect(control.touched).to.be.false;
    input.dispatchEvent(new Event('blur'));
    expect(control.touched).to.be.true;
  });

  it('delivers bx-select detail to outputs and drives the data table', async () => {
    const fixture = TestBed.createComponent(DataHost);
    await stable(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const item = root.querySelector('bx-dropdown-item')!;
    item.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    await stable(fixture);
    expect(fixture.componentInstance.selected()).to.equal('one');

    await aTimeout(60);
    const table = root.querySelector('bx-data-table')!;
    expect(
      table.shadowRoot!.querySelectorAll('[role="row"][data-row]'),
    ).to.have.length(3);
  });

  it('removes element listeners when the component is destroyed', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await stable(fixture);
    const el = fixture.componentInstance.select.element;
    fixture.destroy();
    el.dispatchEvent(new CustomEvent('bx-show'));
    expect(fixture.componentInstance.shows).to.deep.equal([]);
  });
});
