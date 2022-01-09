import { Directive, ElementRef, Host, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appHeightAsWidth]'
})
export class HeightAsWidthDirective {
  @HostBinding('style.height') height = this.element.nativeElement.clientWidth+ 'px';
  @HostBinding('style.line-height') lineHeight = this.element.nativeElement.clientWidth / 8 + 'px';
  @HostBinding('style.font-size') fontSize = this.element.nativeElement.clientWidth / 12 + 'px';
  @HostListener('window:resize', ['$event'])
  onResize() {
    const boardSize = this.element.nativeElement.clientWidth;
    const cellSize = boardSize / 8;
    this.height = boardSize + 'px';
    this.lineHeight = cellSize + 'px';
    this.fontSize = (cellSize / 3 * 2) + 'px';
  }
  constructor(private element: ElementRef) {

  }

}
