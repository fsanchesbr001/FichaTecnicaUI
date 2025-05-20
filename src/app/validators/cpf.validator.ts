import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validateCPF(control: AbstractControl): ValidationErrors | null {
  const cpf = control.value;
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { invalidCPF: true };

  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return { invalidCPF: true };

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[10])) return { invalidCPF: true };

  return null;
}
