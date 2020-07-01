import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket;
  reload: boolean = false;

  constructor() {
    // this.socket = io('http://localhost:3000/');
    this.socket = io('http://192.168.0.191:14141/');
    

    //use seesion storadge to remember setting
    if (window.sessionStorage.getItem('id')) {
      this.reload = true;
    } else {
      this.reload = false;
      window.sessionStorage.setItem('id', Math.random().toString());
    }
  }

  getSocket() {
    return this.socket;
  }

  didReload(): boolean {
    return this.reload;
  }

  getPreviousName(): string {
    return window.sessionStorage.getItem('name');
  }

  setName(name: string): void {
    window.sessionStorage.setItem('name', name);
  }

  // sendGameInvite(id: string): void {
  //   this.socket.emit('gameInvite', this.socket.id);
  // }
}
