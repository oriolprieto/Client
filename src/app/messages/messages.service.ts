import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';
// import {bigintToHex} from "bigint-conversion";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  url = environment.uri;
  ttp = environment.ttp;
  send = {message: ' '};
  constructor(private http: HttpClient) { }

  // Get public keys from server.
  getKeysMessage(): Observable<any> {
    return this.http.get(this.url + '/keys');
  }

  // Put an encrypted message to server
  postEncryptedMessage(message: string): Observable<any> {
    return this.http.post<any>(this.url + '/message', {message: message});
  }

  // Put a blind message to server for sign
  postBlindMessageToSign(message: string): Observable<any> {
    return this.http.post<any>(this.url + '/bsign', {message: message});
  }

  // Put a key to TTP.
  postKeyToTTP(userName: string, userKey: string): Observable<any> {
    return this.http.post<any>(this.ttp + '/postkey', {user: userName, key: userKey});
  }

  getMessage(text: string): Observable<any> {
    return this.http.get<any>(this.url + '/message?message=' + text);
  }

  postMessage(text: string): Observable<any> {
    this.send = {message: text};
    return this.http.post<any>(this.url + '/message', this.send);
  }
}
