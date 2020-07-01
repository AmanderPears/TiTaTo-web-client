import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {

  socket;
  clientList = [];

  @Output() myEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private io: SocketService
  ) {
    this.socket = io.getSocket();
  }

  ngOnInit(): void {

    this.socket.on('clientList', cl => {
      this.clientList = cl.filter(c => {
        return c.id != this.socket.id;
      });
    });
  }


  chat(client: any): void {
    this.myEvent.emit({ event: 'chat', id: client.id, name: client.name });
  }

  play(client: any): void {
    this.socket.emit('gameInvite', client.id);
    this.myEvent.emit({ event: 'play', id: client.id, name: client.name });
  }

}
