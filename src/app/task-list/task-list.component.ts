import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  displayedRows = 0;
  agGridOptions: GridOptions = {
    onModelUpdated: () => {
      this.displayedRows = this.agGridOptions.api.getDisplayedRowCount();
    },
  };
  agRowData: any[]
  agColumnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'title',
      headerName: 'Title',
      sort: 'asc',
    },
    {
      field: 'status',
      headerName: 'Status',
    },
  ];

  constructor() {}

  ngOnInit() {
    this.agRowData = [
      {
        id: 1,
        title: 'title1',
        status: 'Lorem ipsum dolor sit',
      },
      {
        id: 2,
        title: 'title2',
        status: 'adipiscing elit',
      },
      {
        id: 3,
        title: 'title3',
        status: 'Lorem ipsum',
      },
    ];
    this.displayedRows = this.agRowData.length
  }

  onQuickFilterChanged(value) {
    this.agGridOptions.api.setQuickFilter(value);
    this.agGridOptions.api.redrawRows();
  }
}
