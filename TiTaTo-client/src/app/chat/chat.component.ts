import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../socket.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeNameDialogComponent } from '../change-name-dialog/change-name-dialog.component';
import { AutofillMonitor } from '@angular/cdk/text-field';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

// export interface ChatChannel {
//   id: string;
//   name: string;
//   msgLog: [];
//   listener: any;
//   emiter: any;
// }

export class ChatComponent implements OnInit {

  value = '';
  socket;
  name;
  tabs = [];
  currentTabIndex = new FormControl(0);

  constructor(
    private io: SocketService,
    public dialog: MatDialog
  ) {
    this.socket = this.io.getSocket();
  }

  ngOnInit(): void {
    //setup global tab
    this.tabs.push({
      id: 'global',
      name: 'Global',
      msgLog: []
    });

    //listen to events and add to global tab
    let globalTabMsg = this.tabs[0];

    this.socket.on('global', msg => globalTabMsg.msgLog.push(msg));

    //listen to messages from server and also use this to create pm
    this.socket.on('server', data => {

      if (data.event === 'serverMsg') {
        globalTabMsg.msgLog.push(data);
      } else {
        //pm
        this.chatWith(data);
      }
    });



    //name
    this.socket.on('name', n => {
      this.name = n;
      this.io.setName(this.name);
    });

    //recover naem on reload
    if (this.io.didReload()) {
      this.socket.emit('name', this.io.getPreviousName());
    } else {
      this.socket.emit('name');
    }

  }

  send() {
    let event = this.tabs[this.currentTabIndex.value].id;

    if (this.currentTabIndex.value === 0) { //global
      this.socket.emit(event, this.value);
    } else {
      this.socket.emit('client2client', {
        id: this.tabs[this.currentTabIndex.value].id,
        msg: this.value
      });

      //also add to current msglog
      this.tabs[this.currentTabIndex.value].msgLog.push({ name: this.name, msg: this.value });
    }
    this.value = '';
  }

  changeName(): void {
    const dialogRef = this.dialog.open(ChangeNameDialogComponent, {
      data: {
        name: this.name,
        newName: null
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      this.socket.emit('name', res);
    });
  }

  chatWith(client: any): void {

    let found = this.tabs.findIndex(tab => {
      return tab.id === client.id;
    });

    //if window already exits
    if (found > -1) {
      //uses different obj
      //push if there is an actual msg
      if (client.msg) {
        this.tabs[found].msgLog.push({
          name: this.tabs[found].name,
          msg: client.msg,
        });
      }
    } else {
      //create new tab 
      this.tabs.push({
        id: client.id,
        name: client.name,
        msgLog: []
      });

      //focus the tab
      this.currentTabIndex.setValue(this.tabs.length - 1);

      //add initial msg if pm event
      if (client.msg) {
        this.tabs[this.tabs.length - 1].msgLog.push({ name: client.name, msg: client.msg });
      }
    }

  }

  tabChanged(event: any): void {

  }
}
