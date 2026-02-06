import { Component, EventEmitter ,Output} from '@angular/core';
import { ReactiveFormsModule ,FormControl } from '@angular/forms';
@Component({
  selector: 'app-add-item',
  imports: [ReactiveFormsModule],
  templateUrl: './add-item.html',
  styleUrl: './add-item.css',
})
export class AddItem {
   newTask = new FormControl('');

   @Output() newTodo =new EventEmitter<string>();

   submitTodo(){
    const task = this.newTask.value?.trim();
    if(task){
      this.newTodo.emit(task);
     // console.log(task);
      this.newTask.setValue('');
    }
   }
}
