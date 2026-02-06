import { Component, signal } from '@angular/core';
import { AddItem } from './add-item/add-item';
import { TodoList } from './todo-list/todo-list';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AddItem, TodoList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular_demo');

  todos: string[] = [];

  addTodo(newTodo: string) {
    if (newTodo) {
      this.todos.push(newTodo);
      //console.log(this.todos);
    }
  }
  handledeletedTodo(index: number){
    this.todos.splice(index,1);
  }
}
