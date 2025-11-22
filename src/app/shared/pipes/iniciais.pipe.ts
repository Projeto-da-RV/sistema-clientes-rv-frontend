import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciais',
  standalone: true
})
export class IniciaisPipe implements PipeTransform {
  transform(nome: string): string {
    if (!nome || typeof nome !== 'string') {
      return '??';
    }

    // Remove espaços extras
    const nomeProcessado = nome.trim();

    if (!nomeProcessado) {
      return '??';
    }

    // Separa o nome em partes
    const partes = nomeProcessado.split(/\s+/);

    // Se tem apenas uma palavra, pega as duas primeiras letras
    if (partes.length === 1) {
      const palavra = partes[0];
      if (palavra.length >= 2) {
        return palavra.substring(0, 2).toUpperCase();
      }
      return (palavra + '?').substring(0, 2).toUpperCase();
    }

    // Se tem duas ou mais palavras, pega primeira letra da primeira e última palavra
    const primeiraLetra = partes[0][0];
    const ultimaLetra = partes[partes.length - 1][0];

    return (primeiraLetra + ultimaLetra).toUpperCase();
  }
}
