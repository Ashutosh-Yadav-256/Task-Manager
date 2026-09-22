import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, TaskModalComponent],
  template: `
    <div class="board-container">
      <div class="board-header">
        <div>
          <h1>Enterprise Kanban Board</h1>
          <p class="subtitle">Real-time task orchestration powered by Angular & Spring/Node services</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">+ Create Task</button>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Syncing board tasks...</p>
      </div>

      <div class="columns-grid" *ngIf="!loading">
        <!-- To-Do Column -->
        <div class="kanban-column">
          <div class="column-header todo-accent">
            <h3>To-Do</h3>
            <span class="count-pill">{{ getTasksByStatus('To-Do').length }}</span>
          </div>
          <div class="column-content">
            <div class="task-card" *ngFor="let task of getTasksByStatus('To-Do')">
              <div class="card-top">
                <span class="task-title">{{ task.title }}</span>
                <span class="priority-badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              </div>
              <p class="task-desc" *ngIf="task.description">{{ task.description }}</p>
              <div class="card-bottom">
                <span class="due-date" *ngIf="task.dueDate">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                <div class="actions">
                  <button class="action-btn next-btn" (click)="updateStatus(task, 'In Progress')">Start -&gt;</button>
                  <button class="action-btn" (click)="openEditModal(task)">Edit</button>
                  <button class="action-btn delete-btn" (click)="deleteTask(task._id!)">Delete</button>
                </div>
              </div>
            </div>
            <div class="empty-column" *ngIf="getTasksByStatus('To-Do').length === 0">
              No tasks in To-Do
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="kanban-column">
          <div class="column-header progress-accent">
            <h3>In Progress</h3>
            <span class="count-pill">{{ getTasksByStatus('In Progress').length }}</span>
          </div>
          <div class="column-content">
            <div class="task-card" *ngFor="let task of getTasksByStatus('In Progress')">
              <div class="card-top">
                <span class="task-title">{{ task.title }}</span>
                <span class="priority-badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              </div>
              <p class="task-desc" *ngIf="task.description">{{ task.description }}</p>
              <div class="card-bottom">
                <span class="due-date" *ngIf="task.dueDate">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                <div class="actions">
                  <button class="action-btn next-btn" (click)="updateStatus(task, 'Done')">Complete</button>
                  <button class="action-btn" (click)="openEditModal(task)">Edit</button>
                  <button class="action-btn delete-btn" (click)="deleteTask(task._id!)">Delete</button>
                </div>
              </div>
            </div>
            <div class="empty-column" *ngIf="getTasksByStatus('In Progress').length === 0">
              No tasks in progress
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="kanban-column">
          <div class="column-header done-accent">
            <h3>Done</h3>
            <span class="count-pill">{{ getTasksByStatus('Done').length }}</span>
          </div>
          <div class="column-content">
            <div class="task-card done-card" *ngFor="let task of getTasksByStatus('Done')">
              <div class="card-top">
                <span class="task-title">{{ task.title }}</span>
                <span class="priority-badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              </div>
              <p class="task-desc" *ngIf="task.description">{{ task.description }}</p>
              <div class="card-bottom">
                <span class="due-date" *ngIf="task.dueDate">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                <div class="actions">
                  <button class="action-btn" (click)="updateStatus(task, 'To-Do')">Reopen</button>
                  <button class="action-btn delete-btn" (click)="deleteTask(task._id!)">Delete</button>
                </div>
              </div>
            </div>
            <div class="empty-column" *ngIf="getTasksByStatus('Done').length === 0">
              No completed tasks
            </div>
          </div>
        </div>
      </div>

      <app-task-modal
        [isOpen]="isModalOpen"
        [task]="editingTask"
        (close)="closeModal()"
        (save)="onSaveTask($event)"
      ></app-task-modal>
    </div>
  `,
  styles: [`
    .board-container {
      padding: 28px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #f8fafc;
    }
    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .btn-create {
      padding: 12px 20px;
      background: #3b82f6;
      color: #ffffff;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn-create:hover {
      background: #2563eb;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      color: #94a3b8;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #334155;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .columns-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .columns-grid {
        grid-template-columns: 1fr;
      }
    }
    .kanban-column {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      min-height: 500px;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 2px solid transparent;
    }
    .todo-accent {
      border-bottom-color: #38bdf8;
    }
    .progress-accent {
      border-bottom-color: #f59e0b;
    }
    .done-accent {
      border-bottom-color: #10b981;
    }
    .column-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
    }
    .count-pill {
      background: #0f172a;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
    }
    .column-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .task-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 16px;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .task-card:hover {
      border-color: #475569;
      transform: translateY(-2px);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .task-title {
      font-weight: 700;
      font-size: 15px;
      color: #f8fafc;
      flex: 1;
    }
    .task-desc {
      color: #94a3b8;
      font-size: 13px;
      margin: 10px 0;
      line-height: 1.4;
    }
    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #1e293b;
    }
    .due-date {
      font-size: 11px;
      color: #64748b;
    }
    .actions {
      display: flex;
      gap: 6px;
      margin-left: auto;
    }
    .action-btn {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      background: #1e293b;
      color: #cbd5e1;
    }
    .action-btn:hover {
      background: #334155;
      color: #f8fafc;
    }
    .next-btn {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .next-btn:hover {
      background: #3b82f6;
      color: #ffffff;
    }
    .delete-btn {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
    .delete-btn:hover {
      background: #ef4444;
      color: #ffffff;
    }
    .priority-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .p-high {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    .p-med {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }
    .p-low {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .empty-column {
      text-align: center;
      padding: 40px 16px;
      color: #475569;
      font-size: 13px;
      font-style: italic;
    }
  `]
})
export class BoardComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  isModalOpen = false;
  editingTask: Task | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getTasksByStatus(status: 'To-Do' | 'In Progress' | 'Done'): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'p-high';
      case 'Medium': return 'p-med';
      case 'Low': return 'p-low';
      default: return 'p-med';
    }
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.isModalOpen = true;
  }

  openEditModal(task: Task): void {
    this.editingTask = task;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTask = null;
  }

  onSaveTask(taskData: Partial<Task>): void {
    if (this.editingTask && this.editingTask._id) {
      this.taskService.updateTask(this.editingTask._id, taskData).subscribe({
        next: (updated) => {
          this.tasks = this.tasks.map((t) => (t._id === updated._id ? updated : t));
          this.closeModal();
        }
      });
    } else {
      this.taskService.addTask(taskData).subscribe({
        next: (created) => {
          this.tasks.unshift(created);
          this.closeModal();
        }
      });
    }
  }

  updateStatus(task: Task, newStatus: 'To-Do' | 'In Progress' | 'Done'): void {
    if (!task._id) return;
    this.taskService.updateTask(task._id, { ...task, status: newStatus }).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) => (t._id === updated._id ? updated : t));
      }
    });
  }

  deleteTask(id: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((t) => t._id !== id);
        }
      });
    }
  }
}
