import {  ComponentFixture, discardPeriodicTasks, fakeAsync, flush, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { TaskListComponent } from './task-list.component';
import { AgGridModule } from 'ag-grid-angular';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let compDebugElement: DebugElement

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskListComponent ],
      imports: [AgGridModule]
    });

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    compDebugElement = fixture.debugElement;
    fixture.detectChanges()
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter rows by quickfilter (sync version)', () => {
    const rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    const quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    expect(getTextValue(rowNumberDE)).toContain('3')

    fillQuickFilter(quickFilterDE, 'lorem')
    //This one passes, as the api setQuickFilter() gets called after the onQuickFilterChanged gets triggered by the detectChanges
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(2)
    //This one will not pass, as the onModelUpdated event is not yet called
    expect(getTextValue(rowNumberDE)).toContain('2')

    fillQuickFilter(quickFilterDE, '1')
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(1)
    expect(getTextValue(rowNumberDE)).toContain('1')
  })

  /*
    This one is actually unstable and occasionally(somewhat rare on my pc, about 10-15%) runs into an async timeout (no amount of waiting will help)
    I suspect it might be due to the last detectChange further triggering some ag grid async timer (setTimeout or setInterval)
  */
  it('should filter rows by quickfilter (waitForAsync version)', waitForAsync(() => {
    const rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    const quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    expect(getTextValue(rowNumberDE)).toContain('3')

    fillQuickFilter(quickFilterDE, 'lorem') //triggers redrawRows(), that rerenders the grid which needs to be settled first before the async event callback gets triggered
    fixture.whenStable().then(() => { //wait for the onModelUpdated event callback to be triggered, which updates the displayedRows variable
      fixture.detectChanges() // need change detection for the displayedRows variable to show up in the DOM
      expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(2)
      expect(getTextValue(rowNumberDE)).toContain('2')

      fillQuickFilter(quickFilterDE, '1')
      fixture.whenStable().then(() => {
        fixture.detectChanges()
        expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(1)
        expect(getTextValue(rowNumberDE)).toContain('1')
      })
    })
  }))

  /*
    this one clears all the expects consistently, but also reveals that there will always be 2 timer(s) still in the queue that no amount
    of flushing will get rid of
  */
  it('should filter rows by quickfilter (fakeAsync /w whenstable version)', fakeAsync(async () => {
    const rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    const quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    expect(getTextValue(rowNumberDE)).toContain('3')

    fillQuickFilter(quickFilterDE, 'lorem')
    await fixture.whenStable()
    fixture.detectChanges()
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(2)
    expect(getTextValue(rowNumberDE)).toContain('2')

    fillQuickFilter(quickFilterDE, '1')
    await fixture.whenStable()
    fixture.detectChanges()
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(1)
    expect(getTextValue(rowNumberDE)).toContain('1')

    flushMicrotasks()
    flush()
    discardPeriodicTasks()
  }))

  /*
    not exactly sure whats different on this basic project, but in our current big project this setup does works
    but it seems like here it doesn't want to trigger the event callbacks at all
  */
  it('should filter rows by quickfilter (fakeAsync version)', fakeAsync(() => {
    const rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    const quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    expect(getTextValue(rowNumberDE)).toContain('3')

    fillQuickFilter(quickFilterDE, 'lorem') //triggers redrawRows(), that rerenders the grid
    tick(1000) //wait for onModelUpdated event callback to be triggered, which is async to wait for the previous grid render to settle
    fixture.detectChanges() //update DOM with new displayed rows value
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(2)
    expect(getTextValue(rowNumberDE)).toContain('2')

    fillQuickFilter(quickFilterDE, '1')
    tick(1000)
    fixture.detectChanges()
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(1)
    expect(getTextValue(rowNumberDE)).toContain('1')

    flush()
  }))

  function getTextValue(element: DebugElement) {
    return element.nativeElement.innerHTML.trim()
  }

  function fillQuickFilter(element: DebugElement, value: string) {
    const input = element.nativeElement
    input.value = value
    input.dispatchEvent(new KeyboardEvent('keyup', new KeyboardEvent('keyup')))
    fixture.detectChanges()
  }
});
