import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.scss']
})
export class CustomerEditComponent implements OnInit {

  customerForm: FormGroup;
  customerId!: number;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    this.customerService.getCustomer(this.customerId).subscribe(customer => {
      this.customerForm.patchValue(customer);
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.customerService.updateCustomer(this.customerId, this.customerForm.value).subscribe(() => {
        this.router.navigate(['/customers']);
      });
    }
  }
}