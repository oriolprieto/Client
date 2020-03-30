import { Component } from '@angular/core';
import { MessagesService} from './messages/messages.service';
import { FormsModule } from '@angular/forms';
// import {bigintToHex, hexToBigint, textToBigint} from "bigint-conversion";
import { rsa } from 'rsa_module';
import { hash } from 'hash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularFrontEnd';
  nameA: string;        // String that defines a source (for me).
  nameB: string;        // String that defines a destination (for me).
  body: object;         // Body of json.
  crypto;               // Crypto engine.
  hash;                 // Hash engine.
  inputText: string;
  outputText: string;
  inputTextHash: string;
  serverPublicKey;
  serverPublicKeyEhex;
  serverPublicKeyNhex;
  localPublicKeyEhex;
  localPublicKeyNhex;
  randomKeyKhex;
  randomKeyRhex;
  encryptedMessage;
  receivedMessage;


  constructor(
    private messagesService: MessagesService
  ) {
    this.crypto = new rsa(1024);
    this.hash = new hash();
    this.nameA = 'Alice';
    this.nameB = 'Bob';
    this.localPublicKeyEhex = this.crypto.keys().pub_e;
    this.localPublicKeyNhex = this.crypto.keys().pub_n;
  }

  // do nothing for refresh client!!!
  doNothing() {}

  async getKeysButton() {
    const response = (await this.messagesService.getKeysMessage().toPromise());
    const object = JSON.parse(JSON.stringify(response));
    this.serverPublicKeyEhex = object.pub_e;
    this.serverPublicKeyNhex = object.pub_n;
  }

  async sendEncryptMessageButton() {
    // Get server public keys and save.
    const response = await this.messagesService.getKeysMessage().toPromise();
    const object = JSON.parse(JSON.stringify(response));
    this.serverPublicKeyEhex = object.pub_e;
    this.serverPublicKeyNhex = object.pub_n;

    // Encrypt message with public keys and send to server.
    this.encryptedMessage = this.crypto.encrypt(this.inputText, this.serverPublicKeyEhex, this.serverPublicKeyNhex);
    await  this.messagesService.postEncryptedMessage(this.encryptedMessage).toPromise();
  }

  // Blind sign protocol.
  async sendBlindSignButton() {
    // Get server public keys and save.
    let response = await this.messagesService.getKeysMessage().toPromise();
    const serverPubKeys = JSON.parse(JSON.stringify(response));
    this.serverPublicKeyEhex = serverPubKeys.pub_e;
    this.serverPublicKeyNhex = serverPubKeys.pub_n;

    // generate R, blind message, and send for sign.
    this.randomKeyRhex = this.crypto.getR(serverPubKeys.pub_n);
    this.randomKeyKhex = this.randomKeyRhex.r_key;
    // tslint:disable-next-line:max-line-length
    response = await this.messagesService.postBlindMessageToSign(this.crypto.blind(this.inputText, this.serverPublicKeyEhex, this.serverPublicKeyNhex)).toPromise();
    const signedBlindedMessage = JSON.parse(JSON.stringify(response));
    this.receivedMessage = signedBlindedMessage.response;
    const signedMessage = this.crypto.unblind(signedBlindedMessage.response, serverPubKeys.pub_n);
    this.encryptedMessage = signedMessage;
    this.outputText = this.crypto.blindVerify(signedMessage, serverPubKeys.pub_e, serverPubKeys.pub_n);
  }

  // Non repudiation protocol.
  async sendNonRepudiationButton() {
    // Get public keys from B.
    let response = await this.messagesService.getKeysMessage().toPromise();
    const serverPubKeys = JSON.parse(JSON.stringify(response));
    this.serverPublicKeyEhex = serverPubKeys.pub_e;
    this.serverPublicKeyNhex = serverPubKeys.pub_n;
    // Encrypt message and create a hex string like C.
    // const message = this.inputText;
    // const codedMessage = this.crypto.encrypt(message, serverPubKeys.pub_e, serverPubKeys.pub_n);
    const key = this.crypto.getR(serverPubKeys.pub_n);
    this.randomKeyKhex = key.r_key;
    response = await this.messagesService.postKeyToTTP(this.nameB, key.r_key).toPromise();
  }

  async sendGetMessage() {
    this.outputText =  (await this.messagesService.getMessage(this.inputText).toPromise()).message;
  }

  async sendPostMessage() {
    this.outputText = (await this.messagesService.postMessage(this.inputText).toPromise()).message;
  }
}
