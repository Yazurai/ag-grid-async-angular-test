import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import { TaskListComponent } from './task-list.component';


describe('TaskListComponent - updated', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let compDebugElement: DebugElement

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      imports: [AgGridModule],
    });

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    compDebugElement = fixture.debugElement;

    // DO NOT RUN HERE!
    // when using fakeAsync we need this to run within fakeAsync
    // if you run this here the grid will be created outside of fakeAsync
    // which is why there are issues with many of those tests.
    // fixture.detectChanges()
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
    not exactly sure whats different on this basic project, but in our current big project this setup does works
    but it seems like here it doesn't want to trigger the event callbacks at all
  */
  it('should filter rows by quickfilter (fakeAsync version)', fakeAsync(() => {

    // When working with fakeAsync you do not want to have this fixture.detectChanges in the beforeEach
    // Setup bindings and init so the first values are present. This causes the grid to be created
    fixture.detectChanges()
    // Makes sure all the grid startup logic runs, of which there are setTimeouts for layouts and setting up rowData.
    // The flush makes sure that these all run.
    flush();

    // We now run detectChanges so that any updates from the grid callbacks are reflected in the template
    fixture.detectChanges()

    const rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    const quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    expect(getTextValue(rowNumberDE)).toContain('3')

    fillQuickFilter(quickFilterDE, 'lorem') //triggers redrawRows(), that rerenders the grid
    flush() //wait for onModelUpdated event callback to be triggered, which is async to wait for the previous grid render to settle

    fixture.detectChanges() //update DOM with new displayed rows value
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(2)
    expect(getTextValue(rowNumberDE)).toContain('2')

    fillQuickFilter(quickFilterDE, '1')
    // After the grid api has been called we call flush so that all the grid events and updates complete
    flush()
    // Now detect changes to update the template based on the above grid updates.
    fixture.detectChanges()
    expect(component.agGridOptions.api.getDisplayedRowCount()).toBe(1)
    expect(getTextValue(rowNumberDE)).toContain('1')
  }))

  function getTextValue(element: DebugElement) {
    return element.nativeElement.innerHTML.trim()
  }

  function fillQuickFilter(element: DebugElement, value: string) {
    const input = element.nativeElement
    input.value = value
    input.dispatchEvent(new KeyboardEvent('keyup', new KeyboardEvent('keyup')))
  }
});
