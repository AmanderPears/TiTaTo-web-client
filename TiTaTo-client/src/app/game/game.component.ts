import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from '../socket.service';


export interface InactiveData {
  inactive: boolean;
  inviteSent: boolean;
  inviteReceived: boolean;
  inviteResponse: boolean;
  recipientId: string;
  recipientName: string;
  senderId: string;
  senderName: string;
  gameActive: boolean;
  gameFirstPlayer: boolean;
  gameTurn: boolean;
  gameData: any;
  gameWinner: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  socket;
  status: InactiveData = {
    inactive: true,
    inviteSent: false,
    inviteReceived: false,
    inviteResponse: false,
    recipientId: '',
    recipientName: '',
    senderId: '',
    senderName: '',
    gameActive: false,
    gameFirstPlayer: false,
    gameTurn: false,
    gameData: [
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' },
      { used: false, value: '' }
    ],
    gameWinner: null
  };

  // state = new BehaviorSubject<InactiveData>(this.status);

  constructor(
    // public inactiveModal: MatDialog,
    public io: SocketService
  ) {
    this.socket = this.io.getSocket();
  }

  ngOnInit(): void {

    // this.state.subscribe(s => {
    //   if (s.loading) this.openInactiveModal();
    // });

    // this.state.next(this.status);

    this.socket.on('inviteReceived', client => {
      // console.log(client);

      this.status.inactive = false;
      this.status.inviteReceived = true;
      this.status.senderName = client.name;
      this.status.senderId = client.id;
    });

    this.socket.on('gameInviteResponse', res => {
      this.status.gameActive = res;
      if (res) {
        this.status.inactive = false;
        this.status.gameActive = true;
        this.status.inviteSent = false;

        this.status.gameFirstPlayer = true;
        this.status.gameTurn = true;
      } else {
        this.status.inactive = true;
        this.status.gameActive = false;
        this.status.inviteSent = false;
      }
    });

    this.socket.on('gameData', res => {
      this.status.gameTurn = true;
      res.data.forEach((element, index) => {
        this.status.gameData[index].value = element;
        if (element) {
          this.status.gameData[index].used = true;
        }
      });

      //winner
      if ('winner' in res) {
        this.status.gameActive = false;
        this.status.gameWinner = res.winner;
      }
    });
  }

  playWith(client: any): void {
    this.status.inactive = false;
    this.status.inviteSent = true;
    this.status.recipientId = client.id;
    this.status.recipientName = client.name
  }

  inviteResponse(res: boolean): void {
    this.socket.emit('gameInviteResponse', { id: this.status.senderId, res: res });
    // this.status.inviteResponse = res;
    this.status.inviteReceived = false;
    if (res) {
      this.status.inactive = false;
      this.status.gameActive = true;
      this.status.inviteSent = false;

      this.status.gameFirstPlayer = false;
      this.status.gameTurn = false;
    } else {
      this.status.inactive = true;
      // inviteSent: boolean;
      // recipientId: string;
      // recipientName: string;
      this.status.senderId = "";
      this.status.senderName = "";
      // gameActive: boolean;
    }
  }

  gameButtonClick(index: number): void {

    if (this.status.gameTurn) {
      this.status.gameData[index].used = true;
      this.status.gameData[index].value = this.status.gameFirstPlayer ? 'x' : 'o';

      let data = this.status.gameData.map(i => { return i.value; });
      let id = this.status.recipientId ? this.status.recipientId : this.status.senderId;
      this.socket.emit('gameData', { id: id, data: data });

      this.status.gameTurn = false;
    }
  }

  gameEnd() {
    this.status = {
      inactive: true,
      inviteSent: false,
      inviteReceived: false,
      inviteResponse: false,
      recipientId: '',
      recipientName: '',
      senderId: '',
      senderName: '',
      gameActive: false,
      gameFirstPlayer: false,
      gameTurn: false,
      gameData: [
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' },
        { used: false, value: '' }
      ],
      gameWinner: null
    };
  }


  // openInactiveModal(): void {
  //   const dialogRef = this.inactiveModal.open(InactiveModal, {
  //     width: '100%',
  //     data: { status }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //     console.log(result);
  //   });
  // }

}


// @Component({
//   selector: 'inactive-modal',
//   template: `
//   <h1>Loading...</h1>
//   {{data.loading}}
//   `
// })
// export class InactiveModal {
//   constructor(
//     public dialogRef: MatDialogRef<InactiveModal>,
//     @Inject(MAT_DIALOG_DATA) public data: InactiveData) {

//   }
// }