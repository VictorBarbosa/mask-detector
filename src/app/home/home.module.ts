import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MaskDetectComponent } from '../mask-detect/mask-detect.component';
import { CanvasVideoComponent } from '../components/canvas-video/canvas-video.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage,
    CanvasVideoComponent,
    MaskDetectComponent],

})
export class HomePageModule { }
