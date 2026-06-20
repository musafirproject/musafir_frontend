import {
  Directive, Input, TemplateRef, ViewContainerRef, OnChanges
} from '@angular/core';

@Directive({
  selector: '[appHasAnyRole]',
  standalone: true
})
export class HasAnyRoleDirective implements OnChanges {
  @Input('appHasAnyRole') allowedRoles: string[] | string | null | undefined = [];
  @Input('appHasAnyRoleCurrentRole') currentRole: string | null | undefined = null;

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {}

  ngOnChanges(): void { this.render(); }

  private render() {
    const allowedArray = Array.isArray(this.allowedRoles)
      ? this.allowedRoles
      : (this.allowedRoles ? [this.allowedRoles] : []);

    const role = this.currentRole ?? '';

    const show = role !== '' && (allowedArray.length === 0 || allowedArray.includes(role));

    this.vcr.clear();
    if (show) this.vcr.createEmbeddedView(this.tpl);
  }
}
