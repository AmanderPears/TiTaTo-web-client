import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'TiTaTo-client';

  @ViewChild(ChatComponent) chatChild;

  ngAfterViewInit(): void {

  }

  // tranfer id from friends list to chat box
  processEvent(event) {
    //event here is a client obj
    if (event.event === 'chat') {
      this.chatChild.chatWith(event);
    }

  }

}
