import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

/**
 * Componente responsável pela tela de login do sistema RV Digital.
 * Implementa formulário reativo com validações e integração com AuthService.
 * Redireciona para URL de retorno após login bem-sucedido.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  // Formulário reativo para capturar dados de login
  loginForm!: FormGroup;
  
  // Controle de estado da tela
  carregando = false;
  mostrarSenha = false;
  
  // URL para retornar após login (usado pelo AuthGuard)
  private returnUrl = '/dashboard';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  /**
   * Inicialização do componente.
   * Configura o formulário e verifica se já está logado.
   */
  ngOnInit(): void {
    this.criarFormulario();
    this.verificarSeJaEstaLogado();
    this.obterUrlRetorno();
  }
  
  /**
   * Cria o formulário reativo com validações.
   * Campos obrigatórios conforme especificação do projeto.
   */
  private criarFormulario(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      senha: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      lembrarMe: [false]
    });
    
    // Pré-popular para facilitar testes (remover em produção)
    this.loginForm.patchValue({
      email: 'admin@rvdigital.com.br',
      senha: '123456'
    });
  }
  
  /**
   * Verifica se usuário já está logado para evitar login duplo.
   * Se estiver, redireciona direto para o sistema.
   */
  private verificarSeJaEstaLogado(): void {
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        console.log('LoginComponent: Usuário já autenticado, redirecionando...');
        this.router.navigate([this.returnUrl]);
      }
    });
  }
  
  /**
   * Obtém URL de retorno dos query parameters.
   * Usado quando AuthGuard redireciona para login.
   */
  private obterUrlRetorno(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log('LoginComponent: URL de retorno definida como:', this.returnUrl);
  }
  
  /**
   * Realiza o login do usuário.
   * Integra com AuthService para gerenciar autenticação.
   */
  fazerLogin(): void {
    if (this.loginForm.valid) {
      this.carregando = true;
      
      const { email, senha } = this.loginForm.value;
      
      console.log('LoginComponent: Iniciando processo de login para:', email);
      
      this.authService.login(email, senha).subscribe({
        next: (sucesso) => {
          if (sucesso) {
            console.log('LoginComponent: Login realizado com sucesso');
            
            // Mostrar mensagem de boas-vindas
            Swal.fire({
              icon: 'success',
              title: 'Bem-vindo ao RV Digital!',
              text: 'Login realizado com sucesso.',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              // Redirecionar para URL de retorno ou dashboard
              this.router.navigate([this.returnUrl]);
            });
          }
          this.carregando = false;
        },
        error: (erro) => {
          console.error('LoginComponent: Erro no login:', erro);
          this.carregando = false;
          
          // Exibir erro de login
          Swal.fire({
            icon: 'error',
            title: 'Erro no Login',
            text: erro || 'Email ou senha inválidos',
            confirmButtonColor: '#0066cc'
          });
        }
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }
  
  /**
   * Alterna visibilidade da senha.
   * Melhora UX permitindo que usuário veja o que está digitando.
   */
  alternarVisibilidadeSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }
  
  /**
   * Verifica se um campo específico é inválido.
   * Usado no template para exibir mensagens de erro.
   */
  campoInvalido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Obtém mensagem de erro para um campo específico.
   * Retorna mensagem personalizada baseada no tipo de erro.
   */
  obterMensagemErro(campo: string): string {
    const control = this.loginForm.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return `${this.obterLabelCampo(campo)} é obrigatório`;
      }
      if (control.errors['email']) {
        return 'Email deve ter um formato válido';
      }
      if (control.errors['minlength']) {
        return `${this.obterLabelCampo(campo)} deve ter pelo menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `${this.obterLabelCampo(campo)} deve ter no máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    
    return '';
  }
  
  /**
   * Retorna label amigável para o campo.
   */
  private obterLabelCampo(campo: string): string {
    const labels: { [key: string]: string } = {
      'email': 'Email',
      'senha': 'Senha'
    };
    return labels[campo] || campo;
  }
  
  /**
   * Marca todos os campos como tocados para exibir erros.
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}