import { Component , EventEmitter,Input,Output} from '@angular/core';

@Component({
  selector: 'app-todo-list',
  imports: [],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
 @Input() todolist: string[] =[];

 @Output() tododeleted = new EventEmitter<number>();

 delete(index: number){
  this.tododeleted.emit(index);
 }
}
