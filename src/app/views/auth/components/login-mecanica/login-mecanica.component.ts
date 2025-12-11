import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { InputOtp } from 'primeng/inputotp';
import { Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-login-mecanica',
  imports: [
    FormsModule,
    InputOtp,
    CommonModule,
    ProgressSpinner,
    NgIf, 
  ],
  templateUrl: './login-mecanica.component.html',
  styleUrl: './login-mecanica.component.scss'
})
export class LoginMecanicaComponent {
  value: string = '';
  spinnerVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  onSubmit() {
    this.spinnerVisible = true;
    this.authService.loginMecanico(this.value).subscribe({
      next: (response) => {
        if (response.token) {
          this.router.navigate(['/mecanica']);
        }
      },
      error: (error) => {
        console.error('Error al autenticar:', error);
        this.value = '';
        this.spinnerVisible = false;
      }
    });
  }
}
