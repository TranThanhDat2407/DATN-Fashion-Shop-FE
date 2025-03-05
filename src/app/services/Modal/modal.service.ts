import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService{
  private modalLoginState = new BehaviorSubject<boolean>(false);
  modalLoginState$ = this.modalLoginState.asObservable();


  constructor() {
  }


  openLoginModal() {
    this.modalLoginState.next(true);
  }

  closeLoginModal() {
    this.modalLoginState.next(false);
  }




}
