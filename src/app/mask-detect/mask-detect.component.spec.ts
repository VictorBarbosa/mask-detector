import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaskDetectComponent } from './mask-detect.component';

describe('MaskDetectComponent', () => {
  let component: MaskDetectComponent;
  let fixture: ComponentFixture<MaskDetectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaskDetectComponent]
    });
    fixture = TestBed.createComponent(MaskDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
