import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PlayChessComponent } from './play-chess/play-chess.component';
import { HeightAsWidthDirective } from './height-as-width.directive';

@NgModule({
  declarations: [
    AppComponent,
    PlayChessComponent,
    HeightAsWidthDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
