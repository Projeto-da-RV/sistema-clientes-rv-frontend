import { Routes } from '@angular/router';
import { CustomerListComponent } from './features/customer/customer-list/customer-list.component';
import { CustomerCreateComponent } from './features/customer/customer-create/customer-create.component';
import { CustomerEditComponent } from './features/customer/customer-edit/customer-edit.component';

export const routes: Routes = [
    { path: '', redirectTo: 'customers', pathMatch: 'full' },
    { path: 'customers', component: CustomerListComponent },
    { path: 'customers/create', component: CustomerCreateComponent },
    { path: 'customers/:id/edit', component: CustomerEditComponent },
];