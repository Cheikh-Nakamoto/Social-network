import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmostPrivateComponent } from './almost-private.component';

describe('AlmostPrivateComponent', () => {
  let component: AlmostPrivateComponent;
  let fixture: ComponentFixture<AlmostPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlmostPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmostPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
