import { NgFor, NgIf,JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, Validators, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AreaQr } from '../../interface/interface-menu';

@Component({
  selector: 'app-reading-qr',
  standalone: true,
  imports: [NgFor, MatSelectModule, FormsModule, ReactiveFormsModule, JsonPipe,NgIf],
  templateUrl: './reading-qr.component.html',
  styleUrl: './reading-qr.component.scss'
})
export class ReadingQrComponent implements OnInit {
  formularioContacto: FormGroup;
  datos: any;
  
  areas: AreaQr[] = [
    {id: '1', nombreArea: 'Producto terminado'},
    {id: '2', nombreArea: 'Almacenamiento Cava'},
    {id: '3', nombreArea: 'Entrega Cedi Medellin'},
    {id: '4', nombreArea: 'Recibo Cedi Medellin'}
  ];

  vehiculos = [
    { id: '1', placa: 'ABC123' },
    { id: '2', placa: 'DEF456' },
    { id: '3', placa: 'GHI789' }
  ];

  constructor(private fb: FormBuilder) {
    this.formularioContacto = this.fb.group({
      area: ['', Validators.required],
      vehiculo: [''],
      comentario: ['', Validators.required]
    });

    this.formularioContacto.get('area')?.valueChanges.subscribe(areaId => {
      if (areaId === '3' || areaId === '4') {
        this.formularioContacto.get('vehiculo')?.setValidators(Validators.required);
      } else {
        this.formularioContacto.get('vehiculo')?.clearValidators();
        this.formularioContacto.get('vehiculo')?.setValue('');
      }
      this.formularioContacto.get('vehiculo')?.updateValueAndValidity();
    });
  }

  ngOnInit() {}

  submit() {
    if (this.formularioContacto.valid) {
      this.datos = this.formularioContacto.value;
      console.log(this.datos);
    }
  }

  mostrarVehiculo(): boolean {
    const areaId = this.formularioContacto.get('area')?.value;
    return areaId === '3' || areaId === '4';
  }
}