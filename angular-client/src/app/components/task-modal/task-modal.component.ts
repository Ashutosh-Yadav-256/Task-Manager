import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>{{ task ? 'Edit Task' : 'New Task' }}</h3>
          <button class="close-btn" (click)="closeModal()">X</button>
        </div>

        <div class="modal-body">
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <div class="form-group">
            <label>Title *</label>
            <input type="text" [(ngModel)]="title" placeholder="e.g. Implement PACT Contract Test" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="description" rows="3" placeholder="Task requirements and scope"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Status</label>
              <select [(ngModel)]="status">
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div class="form-group half">
              <label>Priority</label>
              <select [(ngModel)]="priority">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input type="date" [(ngModel)]="dueDate" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          <button class="btn-save" (click)="saveTask()">{{ task ? 'Save Changes' : 'Create Task' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-dialog {
      width: 100%;
      max-width: 500px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid #334155;
    }
    .modal-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
    }
    .close-btn {
      background: transparent;
      color: #94a3b8;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .close-btn:hover {
      color: #f8fafc;
      background: #334155;
    }
    .modal-body {
      padding: 24px;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half {
      flex: 1;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    input, textarea, select {
      width: 100%;
      padding: 10px 12px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f8fafc;
      font-size: 14px;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #0f172a;
      border-top: 1px solid #334155;
    }
    .btn-cancel {
      padding: 10px 18px;
      background: #334155;
      color: #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    .btn-cancel:hover {
      background: #475569;
    }
    .btn-save {
      padding: 10px 20px;
      background: #3b82f6;
      color: #ffffff;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .btn-save:hover {
      background: #2563eb;
    }
  `]
})
export class TaskModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Task>>();

  title = '';
  description = '';
  status: 'To-Do' | 'In Progress' | 'Done' = 'To-Do';
  priority: 'Low' | 'Medium' | 'High' = 'Medium';
  dueDate = '';
  errorMsg = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.task) {
      this.title = this.task.title;
      this.description = this.task.description || '';
      this.status = this.task.status;
      this.priority = this.task.priority;
      this.dueDate = this.task.dueDate ? this.task.dueDate.split('T')[0] : '';
    } else {
      this.title = '';
      this.description = '';
      this.status = 'To-Do';
      this.priority = 'Medium';
      this.dueDate = '';
    }
    this.errorMsg = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  saveTask(): void {
    if (!this.title.trim()) {
      this.errorMsg = 'Title is required.';
      return;
    }

    this.save.emit({
      title: this.title.trim(),
      description: this.description.trim(),
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate ? this.dueDate : undefined
    });
  }
}
