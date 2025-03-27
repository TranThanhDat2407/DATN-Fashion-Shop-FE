import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChatbotService} from '../../../services/chatbot/chatbot.service';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    HttpClientModule,
    NgIf,
    NgClass
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  userMessage: string = '';
  messages: { sender: string, text: string }[] = [];
  isChatOpen: boolean = true;

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    console.log("ok chua")
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ sender: 'user', text: this.userMessage });

    this.chatbotService.sendMessage(this.userMessage, 1).subscribe(response => {
      this.messages.push({ sender: 'bot', text: response.response });
    });

    this.userMessage = '';  // Reset input
  }

  formatMessage(message: string): string {
    // Tìm tất cả đường dẫn và thay bằng thẻ `<a>` có thể click
    return message.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" style="color: blue; text-decoration: underline;">$1</a>'
    );
  }
}
