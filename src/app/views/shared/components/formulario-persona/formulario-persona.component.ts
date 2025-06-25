import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ValidacionService } from '../../../services/validacion.service';
import { ToastrService } from 'ngx-toastr';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePicker } from 'primeng/datepicker';
import { Cliente, Persona, Propietario } from '../../../../../domain/request/Cliente.model';
import { PropietarioService } from '../../../services/propietario.service';
import { response } from 'express';
import { Router } from '@angular/router';
import { MecanicoService } from '../../../services/mecanico.service';
import { RegistrarMecanico } from '../../../../../domain/response/Mecanico.model';
import { UsuarioService } from '../../../services/usuario.service';
import { ProveedorService } from '../../../services/proveedor.service';
import { RegistrarProveedor } from '../../../../../domain/response/Proveedor.model';
import { PersonaService } from '../../../services/persona.service';

@Component({
  selector: 'app-formulario-persona',
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DividerModule,
    RadioButtonModule,
    DatePicker,
    InputIconModule,
  ],
  templateUrl: './formulario-persona.component.html',
})
export class FormularioPersonaComponent implements OnInit {
  @Input() initialData: any;
  @Input() personaVariante: 'persona' | 'mec' | 'prov' | 'cliente' | 'user' | 'propietario' = 'persona'; // O cualquier lógica que necesites
  @Output() formSubmitted = new EventEmitter<any>();
  @Input() modoEdicion: boolean = false; // Recibir desde el padre
  @Input() datosIniciales: any = null; // Recibir datos desde el padre

  form_persona!: FormGroup;
  
  tipoPersona: any[] = []
  generosPersona: any[] = []
  booleanRadio: any[] = []

  validarExistePersona: boolean = false;

  iconValidarDocumento: string = 'pi pi-search';
  iconValidarPin: string = 'pi pi-check';
  personaExiste: boolean = false;
  mecanicoExiste: boolean = false;
  constructor(
    private validacionService: ValidacionService,
    private propietarioService: PropietarioService,
    private toastr: ToastrService,
    private router: Router,
    private mecanicoService: MecanicoService,
    private usuarioService: UsuarioService,
    private proveedorService: ProveedorService,
    private personaService: PersonaService
  ) { }

 ngOnInit(): void {
  this.inicializateFormGroups();
  this.radioButtonInitData();
  
  // Si está en modo edición y tiene datos, cargarlos inmediatamente
  if (this.modoEdicion && this.datosIniciales) {
    console.log('🔄 Cargando datos iniciales en modo edición:', this.datosIniciales);
    setTimeout(() => {
      this.cargarDatosDirectamente(this.datosIniciales);
      this.agregarListeners();
    }, 100);
  } else {
    // Solo agregar los listeners si NO está en modo edición
    this.agregarListeners();
  }
}

private agregarListeners() {
  this.form_persona.get('documento')?.valueChanges.subscribe(() => {
    if (this.validarExistePersona && !this.modoEdicion) { // No limpiar en modo edición
      const documentoActual = this.form_persona.get('documento')?.value;
      this.form_persona.patchValue({
        tipoPersona: null,
        nombre: null,
        apellidos: null,
        email: null,
        celular: null,
        telefono: null,
        direccion: null,
        fecha_nacimiento: null,
        genero: null,
        razonSocial: null,
        representanteLegal: null,
        obligadaContabilidad: null,
        pin: null,
        especialidad: null,
        esSupervisor: false,
        esPasante: false,
        contrasenia: null
      });
      this.validarExistePersona = false;
      this.iconValidarDocumento = 'pi pi-search';
      this.personaExiste = false; 
      this.mecanicoExiste = false; 
    }
  });

  this.form_persona.get('esSupervisor')?.valueChanges.subscribe(value => {
      const esPasante = !value;
      this.form_persona.get('esPasante')?.setValue(esPasante, { emitEvent: false });
  });

  this.form_persona.get('esPasante')?.valueChanges.subscribe(value => {
    if (value) {
      this.form_persona.get('esSupervisor')?.setValue(false);
    }
  });
  
  if (this.personaVariante === 'mec') {
    this.form_persona.get('pin')?.valueChanges.subscribe(value => {
      if (value && this.validarExistePersona) {
        // En modo edición, solo validar si el PIN cambió
        if (this.modoEdicion) {
          const pinOriginal = this.datosIniciales?.pin;
          if (value === pinOriginal) {
            // PIN no cambió, mantener como válido
            this.iconValidarPin = 'pi pi-check';
            this.form_persona.get('pin')?.setErrors(null);
            return;
          }
        }
        
        setTimeout(() => {
          if (value === this.form_persona.get('pin')?.value) {
            this.validarPinUnico();
          }
        }, 500);
      }
    });
  }
}
  inicializateFormGroups(){
    this.form_persona = new FormGroup({
      tipoPersona: new FormControl<string | null>(null, [Validators.required]),
      documento: new FormControl<string | null>(null, [Validators.required]),
      nombre: new FormControl<string | null>(null, [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]),
      apellidos: new FormControl<string | null>(null, [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]),
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
      celular: new FormControl<string | null>(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      telefono: new FormControl<string | null>(null),
      direccion: new FormControl<string | null>(null, [Validators.required]),
      fecha_nacimiento: new FormControl<Date | null>(null),
      genero: new FormControl<string | null>(null),
      razonSocial: new FormControl<string | null>(null),
      representanteLegal: new FormControl<string | null>(null),
      obligadaContabilidad: new FormControl<boolean | null>(null),
     // Agrega estos campos para mecánicos
      pin: new FormControl<string | null>(null, this.personaVariante === 'mec' ? [Validators.required] : []),
      especialidad: new FormControl<string | null>(null, this.personaVariante === 'mec' ? [Validators.required] : []),
      esSupervisor: new FormControl<boolean>(false),
      esPasante: new FormControl<boolean>(false),
      //Campo para usuario
      contrasenia: new FormControl<string | null>(null, this.personaVariante === 'user' ? [Validators.required, Validators.minLength(6)] : [])
    });
  }
  radioButtonInitData(){
    this.tipoPersona = [
      { name: 'Natural', key: 'N' },
      { name: 'Empresa', key: 'E' }
    ];
    this.generosPersona = [
      { name: 'Masculino', key: 'M' },
      { name: 'Femenino', key: 'F' },
      { name: 'Otro', key: 'O' },
    ];
    this.booleanRadio = [
      { name: 'Si', key: 1 },
      { name: 'No', key: 0 },
    ]
  }
  validarDocumento() {
    const documento = this.form_persona.get('documento')?.value;
    this.iconValidarDocumento = '';
    const tipoDocumento = identificarDocumento(documento);
    if (tipoDocumento === 'undefined') {
        this.form_persona.reset();
        this.iconValidarDocumento = 'pi pi-search';
        return;
    }
    
    switch (this.personaVariante) {
        case 'mec':
            this.validarMecanico();
            break;
        case 'user':
            this.validarUsuario();
            break;
        case 'prov':
            this.validarProveedor();
            break;
        default:
            this.validacionService.validarPersonaXDoc(documento).subscribe({
                next: (response) => {
                    if (response && 'idPersona' in response) {
                        this.personaExiste = true; 
                        this.mecanicoExiste = false;
                        this.disabledOptions();
                        
                        const tipoResponse = response.razonSocial == '' ? 'N' : 'E';
                        const tipoSeleccionado = this.tipoPersona.find((t) => t.key === tipoResponse);
                        const generoSeleccionado = this.generosPersona.find((g) => g.key === response.genero);
                        
                        this.form_persona.patchValue({
                            tipoPersona: tipoSeleccionado,
                            nombre: response.nombre,
                            apellidos: response.apellidos,
                            razonSocial: response.razonSocial,
                            email: response.email,
                            celular: response.celular,
                            telefono: response.telefono,
                            direccion: response.direccion,
                            genero: generoSeleccionado,
                            fecha_nacimiento: this.formatDate(response.fechaCumpleanios),
                            representanteLegal: response.representanteLegal,
                            obligadaContabilidad: response.obligadaContabilidad,
                        });
                        
                        this.iconValidarDocumento = 'pi pi-check';
                    } else {
                        this.personaExiste = false; 
                        this.mecanicoExiste = false; 
                        this.enabledOptions(); 
                        
                        const campos = this.form_persona.controls;
                        for (const campo in campos) {
                            if (campo !== 'documento') {
                                campos[campo].reset();
                            }
                        }
                        
                        this.iconValidarDocumento = 'pi pi-search';
                        this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
                    }
                    
                    this.validarExistePersona = true;
                },
                error: (error) => {
                    this.personaExiste = false; 
                    this.mecanicoExiste = false; 
                    this.iconValidarDocumento = 'pi pi-search';
                    this.toastr.error('Error al validar el documento', 'Error');
                }
            });
            break;
    }
}
  closeDialog(){
    this.form_persona.reset();
    this.formSubmitted.emit(true);
  }
  
  crearPersonaHandler(){
    const documento = this.form_persona.get('documento')?.value;
    const tipoDOC = identificarDocumento(documento);
    const esActualizacion = this.modoEdicion && this.personaExiste && this.validarExistePersona;

    if (esActualizacion) {
        this.procesarActualizacion();
        return;
    }
    const raw = this.form_persona.value;
    const fechaNacimiento = raw.FechaNacimiento instanceof Date
  ? raw.FechaNacimiento.toISOString().split('T')[0]
  : raw.FechaNacimiento;

    const nuevaPersona: Persona = {
      nombre: this.form_persona.get('nombre')?.value,
      tipoPersona: this.form_persona.get('tipoPersona')?.value.key,
      tipoDocumento: tipoDOC == 'undefined' ? undefined:tipoDOC,
      documento: this.form_persona.get('documento')?.value,
      email: this.form_persona.get('email')?.value,
      celular: this.form_persona.get('celular')?.value,
      telefono: this.form_persona.get('telefono')?.value,
      direccion: this.form_persona.get('direccion')?.value,
      apellidos: this.form_persona.get('apellidos')?.value,
      fechaNacimiento: fechaNacimiento,
      razonSocial: this.form_persona.get('razonSocial')?.value,
      representanteLegalNombre: this.form_persona.get('representanteLegal')?.value,
      obligadaContabilidad: this.form_persona.get('obligadaContabilidad')?.value,
      esLocal: false,
    };
    switch(this.personaVariante){
      case 'persona':
        console.log('Persona');
        break;
        case 'mec':
        if (!this.validarExistePersona) {
                this.toastr.warning('Debe validar el documento primero', 'Validación requerida');
                return;
            }
            
            // Si es mecánico existente, no permitir crear otro
            if (this.mecanicoExiste) {
                this.toastr.warning('Este mecánico ya existe en el sistema', 'Mecánico Existente');
                return;
            }
            
            if (!this.form_persona.valid) {
                this.toastr.error('Por favor complete todos los campos requeridos', 'Formulario incompleto');
                this.markFormGroupTouched();
                return;
            }
            
            if (tipoDOC === 'undefined') {
                this.toastr.error('Documento inválido', 'Error de validación');
                return;
            }
        
        const tipoPersonaValue = this.form_persona.get('tipoPersona')?.value;
        const generoValue = this.form_persona.get('genero')?.value;
        const obligadaContabilidadValue = this.form_persona.get('obligadaContabilidad')?.value;
        
        let fechaNacimientoValue = null;
        const fechaControl = this.form_persona.get('fecha_nacimiento')?.value;
        if (fechaControl) {
            if (fechaControl instanceof Date) {
                fechaNacimientoValue = fechaControl.toISOString().split('T')[0]; // Just the date part
            } else if (typeof fechaControl === 'string') {
                // If it's already in ISO format, use it directly
                if (fechaControl.includes('T')) {
                    fechaNacimientoValue = fechaControl.split('T')[0];
                } else {
                    // Try to parse other formats
                    try {
                        fechaNacimientoValue = new Date(fechaControl).toISOString().split('T')[0];
                    } catch (error) {
                        console.warn('Error al convertir fecha:', fechaControl);
                        fechaNacimientoValue = null;
                    }
                }
            }
        }
        
        const nuevoMecanico: RegistrarMecanico = {
            nombre: this.form_persona.get('nombre')?.value?.trim() || '',
            tipoPersona: tipoPersonaValue?.key || '',
            tipoDocumento: tipoDOC,
            documento: this.form_persona.get('documento')?.value?.trim() || '',
            email: this.form_persona.get('email')?.value?.trim() || '',
            celular: this.form_persona.get('celular')?.value?.trim() || '',
            telefono: this.form_persona.get('telefono')?.value?.trim() || '',
            direccion: this.form_persona.get('direccion')?.value?.trim() || '',
            apellidos: tipoPersonaValue?.key === 'N' ? (this.form_persona.get('apellidos')?.value?.trim() || '') : '',
            fechaNacimiento: tipoPersonaValue?.key === 'N'
                ? (fechaNacimientoValue ? new Date(fechaNacimientoValue) : undefined)
                : undefined,
            genero: tipoPersonaValue?.key === 'N' ? (generoValue?.key || '') : '',
            razonSocial: tipoPersonaValue?.key === 'E' ? (this.form_persona.get('razonSocial')?.value?.trim() || '') : '',
            idRepresentanteLegal: tipoPersonaValue?.key === 'E' ? (this.form_persona.get('idRepresentanteLegal')?.value || null) : null,
            representanteLegalNombre: tipoPersonaValue?.key === 'E' ? (this.form_persona.get('representanteLegal')?.value?.trim() || '') : '',
            obligadaContabilidad: tipoPersonaValue?.key === 'E' ? (obligadaContabilidadValue?.key === 1 ? true : false) : false,
            pin: this.form_persona.get('pin')?.value?.trim() || '',
            especialidad: this.form_persona.get('especialidad')?.value?.trim() || '',
            esSupervisor: Boolean(this.form_persona.get('esSupervisor')?.value),
            esPasante: Boolean(this.form_persona.get('esPasante')?.value)
        };
        if (!nuevoMecanico.nombre || !nuevoMecanico.documento || !nuevoMecanico.pin || !nuevoMecanico.especialidad) {
            this.toastr.error('Faltan campos obligatorios: nombre, documento, PIN y especialidad', 'Datos incompletos');
            return;
        }
        
        this.mecanicoService.registrarMecanico(nuevoMecanico).subscribe({
            next: (response) => {
                if (response && response.includes('inactivo')) {
                    this.toastr.warning(response, 'Mecánico Inactivo');
                    return;
                }
                
                if (response && response.includes('ya está registrado')) {
                    this.toastr.error(response, 'Mecánico Duplicado');
                    return;
                }
                
                this.toastr.success(response || 'Mecánico registrado exitosamente', 'Registro Exitoso');
                this.resetForm();
                this.formSubmitted.emit(true);
            },
            error: (error) => {
                console.error('❌ Error completo:', error);
                
                if (error.status === 200 && error.error?.text) {
                    const serverMessage = error.error.text;
                    
                    if (serverMessage.includes('inactivo')) {
                        this.toastr.warning(serverMessage, 'Mecánico Inactivo');
                        return;
                    }
                    
                    if (serverMessage.includes('ya está registrado')) {
                        this.toastr.error(serverMessage, 'Mecánico Duplicado');
                        return;
                    }
                    
                    if (serverMessage.includes('registrado correctamente')) {
                        this.toastr.success(serverMessage, 'Registro Exitoso');
                        this.resetForm();
                        this.formSubmitted.emit(true);
                        return;
                    }
                    
                    this.toastr.info(serverMessage, 'Información del Servidor');
                } else {
                    let errorMessage = 'No se pudo registrar el mecánico';
                    if (error.error && typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else if (error.message) {
                        errorMessage = error.message;
                    } else if (error.status === 0) {
                        errorMessage = 'Error de conexión con el servidor';
                    } else if (error.status >= 500) {
                        errorMessage = 'Error interno del servidor';
                    } else if (error.status === 400) {
                        errorMessage = 'Datos inválidos enviados al servidor';
                    }
                    
                    this.toastr.error(errorMessage, 'Error de Registro');
                }
            }
        });
        break;
      case 'prov':
    if (!this.validarExistePersona) {
        this.toastr.warning('Debe validar el documento primero', 'Validación requerida');
        return;
    }
    
    if (!this.form_persona.valid) {
        this.toastr.error('Por favor complete todos los campos requeridos', 'Formulario incompleto');
        this.markFormGroupTouched();
        return;
    }
    
    if (tipoDOC === 'undefined') {
        this.toastr.error('Documento inválido', 'Error de validación');
        return;
    }
    
    const tipoPersonaValueProv = this.form_persona.get('tipoPersona')?.value;
    const generoValueProv = this.form_persona.get('genero')?.value;
    const obligadaContabilidadValueProv = this.form_persona.get('obligadaContabilidad')?.value;
    
    let fechaNacimientoValueProv = null;
    const fechaControlProv = this.form_persona.get('fecha_nacimiento')?.value;
    if (fechaControlProv) {
        if (fechaControlProv instanceof Date) {
            fechaNacimientoValueProv = fechaControlProv.toISOString();
        } else if (typeof fechaControlProv === 'string') {
            fechaNacimientoValueProv = fechaControlProv;
        }
    }
    
    const nuevoProveedor: RegistrarProveedor = {
        nombre: this.form_persona.get('nombre')?.value?.trim() || '',
        tipoPersona: tipoPersonaValueProv?.key || '',
        tipoDocumento: tipoDOC,
        documento: this.form_persona.get('documento')?.value?.trim() || '',
        email: this.form_persona.get('email')?.value?.trim() || '',
        celular: this.form_persona.get('celular')?.value?.trim() || '',
        telefono: this.form_persona.get('telefono')?.value?.trim() || '',
        direccion: this.form_persona.get('direccion')?.value?.trim() || '',
        apellidos: tipoPersonaValueProv?.key === 'N' ? (this.form_persona.get('apellidos')?.value?.trim() || '') : '',
        fechaNacimiento: tipoPersonaValueProv?.key === 'N'
            ? (fechaNacimientoValueProv ? new Date(fechaNacimientoValueProv) : null)
            : null,
        genero: tipoPersonaValueProv?.key === 'N' ? (generoValueProv?.key || '') : '',
        razonSocial: tipoPersonaValueProv?.key === 'E' ? (this.form_persona.get('razonSocial')?.value?.trim() || '') : '',
        idRepresentanteLegal: tipoPersonaValueProv?.key === 'E' ? (this.form_persona.get('idRepresentanteLegal')?.value || null) : null,
        representanteLegalNombre: tipoPersonaValueProv?.key === 'E' ? (this.form_persona.get('representanteLegal')?.value?.trim() || '') : '',
        obligadaContabilidad: tipoPersonaValueProv?.key === 'E' ? (obligadaContabilidadValueProv?.key === 1 ? true : false) : false
    };
    
    if (!nuevoProveedor.nombre || !nuevoProveedor.documento) {
        this.toastr.error('Faltan campos obligatorios: nombre y documento', 'Datos incompletos');
        return;
    }
    
    this.proveedorService.registrarProveedor(nuevoProveedor).subscribe({
        next: (response) => {
            if (response && response.includes('inactivo')) {
                this.toastr.warning(response, 'Proveedor Inactivo');
                return;
            }
            
            if (response && response.includes('ya está registrado')) {
                this.toastr.error(response, 'Proveedor Duplicado');
                return;
            }
            
            this.toastr.success(response || 'Proveedor registrado exitosamente', 'Registro Exitoso');
            this.resetForm();
            this.formSubmitted.emit(true);
        },
        error: (error) => {
            console.error('❌ Error completo:', error);
            
            if (error.status === 200 && error.error?.text) {
                const serverMessage = error.error.text;
                
                if (serverMessage.includes('inactivo')) {
                    this.toastr.warning(serverMessage, 'Proveedor Inactivo');
                    return;
                }
                
                if (serverMessage.includes('ya está registrado')) {
                    this.toastr.error(serverMessage, 'Proveedor Duplicado');
                    return;
                }
                
                if (serverMessage.includes('registrado correctamente')) {
                    this.toastr.success(serverMessage, 'Registro Exitoso');
                    this.resetForm();
                    this.formSubmitted.emit(true);
                    return;
                }
                
                this.toastr.info(serverMessage, 'Información del Servidor');
            } else {
                let errorMessage = 'No se pudo registrar el proveedor';
                if (error.error && typeof error.error === 'string') {
                    errorMessage = error.error;
                } else if (error.message) {
                    errorMessage = error.message;
                } else if (error.status === 0) {
                    errorMessage = 'Error de conexión con el servidor';
                } else if (error.status >= 500) {
                    errorMessage = 'Error interno del servidor';
                } else if (error.status === 400) {
                    errorMessage = 'Datos inválidos enviados al servidor';
                }
                this.toastr.error(errorMessage, 'Error de Registro');
            }
        }
    });
    break;
      case 'propietario':
        nuevaPersona.idVehiculo = this.initialData;
        nuevaPersona.esLocal = false;
        this.propietarioService.registrarPropietario(nuevaPersona).subscribe({
          next: (response) => {
            console.log(response);
            this.formSubmitted.emit(response);
            this.toastr.success('Se ha cambiado el propietario exitosamente!', 'Tarea Exitosa')
            this.router.navigate(['/panel/Vehiculos']);
          },
          error: (err) =>{
            console.log(err);
            this.toastr.error('No se ha podido cambiar el propietario, intente mas tarde!', "Upss! Error!")
          }
        })
        break;
          case 'user':
          if (!this.validarExistePersona) {
              this.toastr.warning('Debe validar el documento primero', 'Validación requerida');
              return;
          }
          const nuevoUsuario = {
              nombre: this.form_persona.get('nombre')?.value,
              tipoPersona: this.form_persona.get('tipoPersona')?.value?.key,
              tipoDocumento: tipoDOC,
              documento: this.form_persona.get('documento')?.value,
              email: this.form_persona.get('email')?.value,
              celular: this.form_persona.get('celular')?.value,
              telefono: this.form_persona.get('telefono')?.value,
              direccion: this.form_persona.get('direccion')?.value,
              apellidos: this.form_persona.get('apellidos')?.value,
              fechaNacimiento: this.form_persona.get('fecha_nacimiento')?.value 
                  ? (this.form_persona.get('fecha_nacimiento')?.value instanceof Date 
                      ? this.form_persona.get('fecha_nacimiento')?.value.toISOString() 
                      : this.form_persona.get('fecha_nacimiento')?.value)
                  : null,
              genero: this.form_persona.get('genero')?.value?.key,
              razonSocial: this.form_persona.get('razonSocial')?.value,
              idRepresentanteLegal: null, // Como no tienes este campo en el form
              representanteLegalNombre: this.form_persona.get('representanteLegal')?.value,
              obligadaContabilidad: this.form_persona.get('obligadaContabilidad')?.value,
              contrasenia: this.form_persona.get('contrasenia')?.value || this.form_persona.get('documento')?.value
          };
          this.usuarioService.registrarUsuario(nuevoUsuario).subscribe({
              next: (response) => {
              if (response && response.includes('inactivo')) {
                  this.toastr.warning(response, 'Usuario Inactivo');
                  return;
              }
              
              if (response && response.includes('ya está registrado')) {
                  this.toastr.error(response, 'Usuario Duplicado');
                  return;
              }
              this.toastr.success(response || 'Usuario registrado exitosamente', 'Registro Exitoso');
              this.form_persona.reset();
              this.formSubmitted.emit(true);
          },
          error: (error) => {
              console.error('❌ Error completo:', error);
              
              if (error.status === 200 && error.error?.text) {
                  const serverMessage = error.error.text;
                  
                  if (serverMessage.includes('inactivo')) {
                      this.toastr.warning(serverMessage, 'Usuario Inactivo');
                      return;
                  }
                  
                  if (serverMessage.includes('ya está registrado')) {
                      this.toastr.error(serverMessage, 'Usuario Duplicado');
                      return;
                  }
                  
                  this.toastr.info(serverMessage, 'Información del Servidor');
                  
                  if (!serverMessage.includes('inactivo') && !serverMessage.includes('registrado')) {
                      this.form_persona.reset();
                      this.formSubmitted.emit(true);
                  }
              } else {
                  let errorMessage = 'No se pudo registrar el usuario';
                  if (error.error && typeof error.error === 'string') {
                      errorMessage = error.error;
                  } else if (error.message) {
                      errorMessage = error.message;
                  }
                  this.toastr.error(errorMessage, 'Error de Registro');
              }
          }
          });
          break;
    }
  };
disabledOptions(){
    this.form_persona.get('tipoPersona')?.disable();
    this.form_persona.get('nombre')?.disable();
    this.form_persona.get('apellidos')?.disable();
    this.form_persona.get('email')?.disable();
    this.form_persona.get('celular')?.disable();
    this.form_persona.get('telefono')?.disable();
    this.form_persona.get('direccion')?.disable();
    this.form_persona.get('fecha_nacimiento')?.disable();
    this.form_persona.get('genero')?.disable();
    this.form_persona.get('razonSocial')?.disable();
    this.form_persona.get('representanteLegal')?.disable();
    this.form_persona.get('obligadaContabilidad')?.disable();
    // Campos específicos de mecánico
    this.form_persona.get('pin')?.disable();
    this.form_persona.get('especialidad')?.disable();
    this.form_persona.get('esSupervisor')?.disable();
    this.form_persona.get('esPasante')?.disable();
    // Campos específicos de usuario
    this.form_persona.get('contrasenia')?.disable();
}

enabledOptions(){
    this.form_persona.get('tipoPersona')?.enable();
    this.form_persona.get('nombre')?.enable();
    this.form_persona.get('apellidos')?.enable();
    this.form_persona.get('email')?.enable();
    this.form_persona.get('celular')?.enable();
    this.form_persona.get('telefono')?.enable();
    this.form_persona.get('direccion')?.enable();
    this.form_persona.get('fecha_nacimiento')?.enable();
    this.form_persona.get('genero')?.enable();
    this.form_persona.get('razonSocial')?.enable();
    this.form_persona.get('representanteLegal')?.enable();
    this.form_persona.get('obligadaContabilidad')?.enable();
    // Campos específicos de mecánico
    this.form_persona.get('pin')?.enable();
    this.form_persona.get('especialidad')?.enable();
    this.form_persona.get('esSupervisor')?.enable();
    this.form_persona.get('esPasante')?.enable();
    // Campo específico de usuario
    this.form_persona.get('contrasenia')?.enable();

}
  formatDate(dateString: string): string {
    if(dateString === 'Vacío') return 'Vacío';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
validarPinUnico() {
  const pinValue = this.form_persona.get('pin')?.value;
  if (pinValue) {
    this.iconValidarPin = ''; // Mostrar spinner
    
    this.validacionService.ValidarPinUnico(pinValue).subscribe({
      next: (esUnico: boolean) => {
        if (esUnico) {
          this.iconValidarPin = 'pi pi-check'; 
          this.form_persona.get('pin')?.setErrors(null);
        } else {
          this.iconValidarPin = 'pi pi-times';
          this.form_persona.get('pin')?.setErrors({ notUnique: true });
          
          // ✅ MEJORAR: Mostrar mensaje específico según el contexto
          if (this.modoEdicion) {
            this.toastr.warning('Este PIN ya está en uso por otro mecánico', 'PIN Duplicado');
          }
        }
      },
      error: () => {
        this.iconValidarPin = 'pi pi-exclamation-triangle';
        this.toastr.error('Error al validar el PIN', 'Error de Validación');
      }
    });
  }
}
resetForm() {
  this.form_persona.reset();
  this.validarExistePersona = false;
  this.iconValidarDocumento = 'pi pi-search';
  this.personaExiste = false;
  this.mecanicoExiste = false;
  
  // Resetear modo edición
  this.modoEdicion = false;
  
  // Habilitar todos los campos
  this.enabledOptions();
  
  this.form_persona.patchValue({
    esSupervisor: false,
    esPasante: false
  });
}
validarMecanico() {
    const documentoValue = this.form_persona.get('documento')?.value;
    if (documentoValue) {
      this.iconValidarDocumento = ''; 
      this.validacionService.validarMecanico(documentoValue).subscribe({
        next: (response: any) => {
          this.iconValidarDocumento = 'pi pi-check';
          this.validarExistePersona = true;
          
          if (response && 'idPersona' in response) {
            this.personaExiste = true; 
            this.mecanicoExiste = response.esMecanico; 
          
            if (response.esMecanico) {
              this.disabledOptions();
              this.toastr.warning('Este mecánico ya existe en el sistema', 'Mecánico Existente');
            } else {
              this.disablePersonaFieldsOnly();
              this.toastr.info('Persona encontrada. Puede agregar información de mecánico', 'Persona Existente');
            }
            
            const tipoPersona = response.apellidos ? 
              this.tipoPersona.find(t => t.key === 'N') : 
              this.tipoPersona.find(t => t.key === 'E');  
            
            const generoSeleccionado = this.generosPersona.find((g) => g.key === response.genero);
            this.form_persona.patchValue({
              tipoPersona: tipoPersona,
              nombre: response.nombre,
              apellidos: response.apellidos,
              razonSocial: response.razonSocial,
              email: response.email,
              celular: response.celular,
              telefono: response.telefono,
              direccion: response.direccion,
              genero: generoSeleccionado,
              fecha_nacimiento: response.fechaCumpleanios ? new Date(response.fechaCumpleanios) : null,
              representanteLegal: response.representanteLegal,
              obligadaContabilidad: response.obligadaContabilidad
            });
            
            if (response.esMecanico) {
              const supervisorOption = this.booleanRadio.find(b => 
                b.key === (response.esSupervisor ? 1 : 0)
              );
              
              this.form_persona.patchValue({
                pin: response.pin,
                especialidad: response.especialidad,
                esSupervisor: supervisorOption
              });
            } else {
              this.form_persona.patchValue({
                pin: null,
                especialidad: null,
                esSupervisor: false,
                esPasante: false
              });
            }
          } else {
            this.personaExiste = false;
            this.mecanicoExiste = false;
            this.enabledOptions();
            
            const campos = this.form_persona.controls;
            for (const campo in campos) {
              if (campo !== 'documento') {
                campos[campo].reset();
              }
            }
            
            this.form_persona.patchValue({
              esSupervisor: false,
              esPasante: false
            });
            
            this.iconValidarDocumento = 'pi pi-search';
            this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
          }
        },
        error: (error) => {
          this.iconValidarDocumento = 'pi pi-search';
          this.validarExistePersona = true;
          this.personaExiste = false;
          this.mecanicoExiste = false;
          this.enabledOptions();
          
          const campos = this.form_persona.controls;
          for (const campo in campos) {
            if (campo !== 'documento') {
              campos[campo].reset();
            }
          }
          
          this.form_persona.patchValue({
            esSupervisor: false,
            esPasante: false
          });
          
          this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
        }
      });
    }
}
disablePersonaFieldsOnly(){
    this.form_persona.get('tipoPersona')?.disable();
    this.form_persona.get('nombre')?.disable();
    this.form_persona.get('apellidos')?.disable();
    this.form_persona.get('email')?.disable();
    this.form_persona.get('celular')?.disable();
    this.form_persona.get('telefono')?.disable();
    this.form_persona.get('direccion')?.disable();
    this.form_persona.get('fecha_nacimiento')?.disable();
    this.form_persona.get('genero')?.disable();
    this.form_persona.get('razonSocial')?.disable();
    this.form_persona.get('representanteLegal')?.disable();
    this.form_persona.get('obligadaContabilidad')?.disable();
    if (this.personaVariante === 'mec') {
      this.form_persona.get('pin')?.enable();
      this.form_persona.get('especialidad')?.enable();
      this.form_persona.get('esSupervisor')?.enable();
      this.form_persona.get('esPasante')?.enable();
    }
    
    if (this.personaVariante === 'user') {
      this.form_persona.get('contrasenia')?.enable();
    }
}
onDocumentoChange() {
    this.personaExiste = false;
    this.mecanicoExiste = false;
    this.validarExistePersona = false;
    this.iconValidarDocumento = 'pi pi-search';
    this.iconValidarPin = 'pi pi-check'; 
}
get shouldDisablePersonaFields(): boolean {
  return this.personaExiste; 
}

get shouldDisableMecanicoFields(): boolean {
  return this.personaExiste && this.mecanicoExiste; 
}

get shouldEnableMecanicoFields(): boolean {
  return this.personaExiste && !this.mecanicoExiste; 
}

get shouldDisableUserFields(): boolean {
  return this.personaExiste && this.form_persona.get('documento')?.value; 
}
// Agregar este getter para controlar cuándo el botón debe estar habilitado
get esFormularioValido(): boolean {
  if (this.modoEdicion) {
    // En modo edición, validar solo los campos que están habilitados
    const camposRequeridos = ['nombre', 'email', 'celular', 'direccion'];
    
    // Si es mecánico, incluir campos específicos
    if (this.personaVariante === 'mec') {
      camposRequeridos.push('pin', 'especialidad');
    }
    
    // Verificar que todos los campos requeridos tengan valor
    return camposRequeridos.every(campo => {
      const control = this.form_persona.get(campo);
      return control && control.value && control.value.toString().trim().length > 0;
    });
  } else {
    // En modo creación, usar la validación normal
    return this.form_persona.valid;
  }
}
validarUsuario() {
    const documentoValue = this.form_persona.get('documento')?.value;
    if (documentoValue) {
      this.iconValidarDocumento = ''; // Mostrar spinner
      
      this.validacionService.ValidarUsuario(documentoValue).subscribe({
        next: (response: any) => {
          this.iconValidarDocumento = 'pi pi-check';
          this.validarExistePersona = true;
          
          if (response && 'idPersona' in response) {
            this.personaExiste = true;
            if (response.esUsuario) {
              this.disabledOptions();
              this.toastr.warning('Este usuario ya existe en el sistema', 'Usuario Existente');
            } else {
              this.disablePersonaFieldsOnly();
              this.toastr.info('Persona encontrada. Puede agregar como usuario', 'Persona Existente');
            }
            
            const tipoPersona = response.apellidos ? 
              this.tipoPersona.find(t => t.key === 'N') : 
              this.tipoPersona.find(t => t.key === 'E');
            
            const generoSeleccionado = this.generosPersona.find((g) => g.key === response.genero);
            
            this.form_persona.patchValue({
              tipoPersona: tipoPersona,
              nombre: response.nombre,
              apellidos: response.apellidos,
              razonSocial: response.razonSocial,
              email: response.email,
              celular: response.celular,
              telefono: response.telefono,
              direccion: response.direccion,
              genero: generoSeleccionado,
              fecha_nacimiento: response.fechaCumpleanios ? new Date(response.fechaCumpleanios) : null,
              representanteLegal: response.representanteLegal,
              obligadaContabilidad: response.obligadaContabilidad
            });
            
            if (!response.esUsuario) {
              this.form_persona.patchValue({
                contrasenia: null
              });
            }
            
          } else {
            this.personaExiste = false;
            this.enabledOptions();
            
            const campos = this.form_persona.controls;
            for (const campo in campos) {
              if (campo !== 'documento') {
                campos[campo].reset();
              }
            }
            
            this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
          }
        },
        error: (error) => {
          this.iconValidarDocumento = 'pi pi-search';
          this.validarExistePersona = true;
          this.personaExiste = false;
          this.enabledOptions();
          
          const campos = this.form_persona.controls;
          for (const campo in campos) {
            if (campo !== 'documento') {
              campos[campo].reset();
            }
          }
          
          this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
        }
      });
    }
}
validarProveedor() {
    const documentoValue = this.form_persona.get('documento')?.value;
    if (documentoValue) {
      this.iconValidarDocumento = ''; // Mostrar spinner
      
      this.validacionService.ValidarProveedor(documentoValue).subscribe({
        next: (response: any) => {
          this.iconValidarDocumento = 'pi pi-check';
          this.validarExistePersona = true;
          
          if (response && 'idPersona' in response) {
            // Persona encontrada
            this.personaExiste = true;
            
            if (response.esProveedor) {
              this.disabledOptions();
              this.toastr.warning('Este proveedor ya existe en el sistema', 'Proveedor Existente');
            } else {
              this.disablePersonaFieldsOnly();
              this.toastr.info('Persona encontrada. Puede agregar como proveedor', 'Persona Existente');
            }
            const tipoPersona = response.apellidos ? 
              this.tipoPersona.find(t => t.key === 'N') : 
              this.tipoPersona.find(t => t.key === 'E');
            const generoSeleccionado = this.generosPersona.find((g) => g.key === response.genero);
            this.form_persona.patchValue({
              tipoPersona: tipoPersona,
              nombre: response.nombre,
              apellidos: response.apellidos,
              razonSocial: response.razonSocial,
              email: response.email,
              celular: response.celular,
              telefono: response.telefono,
              direccion: response.direccion,
              genero: generoSeleccionado,
              fecha_nacimiento: response.fechaCumpleanios ? new Date(response.fechaCumpleanios) : null,
              representanteLegal: response.representanteLegal,
              obligadaContabilidad: response.obligadaContabilidad
            });
            
          } else {
            this.personaExiste = false;
            this.enabledOptions();
            
            const campos = this.form_persona.controls;
            for (const campo in campos) {
              if (campo !== 'documento') {
                campos[campo].reset();
              }
            }
            
            this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
          }
        },
        error: (error) => {
          this.iconValidarDocumento = 'pi pi-search';
          this.validarExistePersona = true;
          this.personaExiste = false;
          this.enabledOptions();
          
          const campos = this.form_persona.controls;
          for (const campo in campos) {
            if (campo !== 'documento') {
              campos[campo].reset();
            }
          }
          
          this.toastr.info('No se encontró una persona con este documento', 'Ingrese la persona');
        }
      });
    }
}
private markFormGroupTouched() {
    Object.keys(this.form_persona.controls).forEach(key => {
        const control = this.form_persona.get(key);
        if (control) {
            control.markAsTouched();
        }
    });
}

cargarDatosParaEdicion(persona: any, esEdicion: boolean) {
    console.log('🔄 cargarDatosParaEdicion llamado con:', { persona, esEdicion });
    this.modoEdicion = esEdicion;
    this.cargarDatosDirectamente(persona);
}
private procesarActualizacion() {
    if (!this.form_persona.valid) {
        this.toastr.error('Por favor complete todos los campos requeridos', 'Formulario incompleto');
        this.markFormGroupTouched();
        return;
    }

    // ✅ NUEVA VALIDACIÓN: Si es mecánico, validar PIN único antes de actualizar
    if (this.personaVariante === 'mec') {
        const pinActual = this.form_persona.get('pin')?.value?.trim();
        const pinOriginal = this.datosIniciales?.pin; // PIN original antes de editar
        
        // Solo validar si el PIN cambió
        if (pinActual && pinActual !== pinOriginal) {
            console.log('🔍 Validando PIN único:', { pinActual, pinOriginal });
            
            // Mostrar indicador de validación
            this.iconValidarPin = '';
            
            this.validacionService.ValidarPinUnico(pinActual).subscribe({
                next: (esUnico: boolean) => {
                    if (esUnico) {
                        this.iconValidarPin = 'pi pi-check';
                        this.form_persona.get('pin')?.setErrors(null);
                        // PIN es único, proceder con la actualización
                        this.ejecutarActualizacion();
                    } else {
                        this.iconValidarPin = 'pi pi-times';
                        this.form_persona.get('pin')?.setErrors({ notUnique: true });
                        this.toastr.error('Este PIN ya está en uso por otro mecánico', 'PIN Duplicado');
                    }
                },
                error: () => {
                    this.iconValidarPin = 'pi pi-exclamation-triangle';
                    this.toastr.error('Error al validar el PIN', 'Error de Validación');
                }
            });
            return; // Salir aquí hasta que se complete la validación
        }
    }

    // Si no es mecánico o el PIN no cambió, proceder directamente
    this.ejecutarActualizacion();
}
private ejecutarActualizacion() {
    const tipoPersonaValue = this.form_persona.get('tipoPersona')?.value;
    const generoValue = this.form_persona.get('genero')?.value;
    const obligadaContabilidadValue = this.form_persona.get('obligadaContabilidad')?.value;
    
    let fechaNacimientoValue = null;
    const fechaControl = this.form_persona.get('fecha_nacimiento')?.value;
    if (fechaControl) {
        if (fechaControl instanceof Date) {
            fechaNacimientoValue = fechaControl.toISOString().split('T')[0];
        } else if (typeof fechaControl === 'string') {
            if (fechaControl.includes('T')) {
                fechaNacimientoValue = fechaControl.split('T')[0];
            } else {
                try {
                    fechaNacimientoValue = new Date(fechaControl).toISOString().split('T')[0];
                } catch (error) {
                    console.warn('Error al convertir fecha:', fechaControl);
                    fechaNacimientoValue = null;
                }
            }
        }
    }

    const personaActualizada = {
        documento: this.form_persona.get('documento')?.value?.trim() || '',
        tipoPersona: tipoPersonaValue?.key || '',
        nombre: this.form_persona.get('nombre')?.value?.trim() || '',
        email: this.form_persona.get('email')?.value?.trim() || '',
        celular: this.form_persona.get('celular')?.value?.trim() || '',
        telefono: this.form_persona.get('telefono')?.value?.trim() || '',
        direccion: this.form_persona.get('direccion')?.value?.trim() || '',
        apellidos: tipoPersonaValue?.key === 'N' ? (this.form_persona.get('apellidos')?.value?.trim() || '') : '',
        fechaNacimiento: tipoPersonaValue?.key === 'N' ? fechaNacimientoValue : null,
        genero: tipoPersonaValue?.key === 'N' ? (generoValue?.key || '') : '',
        razonSocial: tipoPersonaValue?.key === 'E' ? (this.form_persona.get('razonSocial')?.value?.trim() || '') : '',
        representanteLegal: tipoPersonaValue?.key === 'E' ? (this.form_persona.get('representanteLegal')?.value?.trim() || '') : '',
        obligadaContabilidad: tipoPersonaValue?.key === 'E' ? (obligadaContabilidadValue?.key === 1) : false,
        pin: this.form_persona.get('pin')?.value?.trim() || null,
        esSupervisor: this.form_persona.get('esSupervisor')?.value === true || 
                      this.form_persona.get('esSupervisor')?.value?.key === 1,
        especialidad: this.form_persona.get('especialidad')?.value?.trim() || null
    };

    console.log('📤 Datos enviados para actualización:', personaActualizada);
    console.log('📅 Fecha procesada:', {
        original: fechaControl,
        convertida: fechaNacimientoValue,
        tipo: typeof fechaNacimientoValue
    });

    this.personaService.actualizarPersonaCompleta(personaActualizada).subscribe({
        next: (response) => {
            this.toastr.success('Persona actualizada exitosamente', 'Éxito');
            this.resetForm();
            this.formSubmitted.emit(true);
        },
        error: (error) => {
            console.error('❌ Error completo en actualización:', error);
            
            if (error.status === 500) {
                if (error.error && typeof error.error === 'string' && error.error.includes('Persona no encontrada')) {
                    this.toastr.error('La persona no existe en el sistema', 'Error de Datos');
                } else {
                    this.toastr.error('Error interno del servidor. Verifique los datos enviados.', 'Error del Servidor');
                }
            } else {
                this.toastr.error('Error al actualizar la persona', 'Error');
            }
        }
    });
}
private cargarDatosDirectamente(persona: any) {
  if (!persona) return;
  
  // Establecer que está validado para mostrar el formulario
  this.validarExistePersona = true;
  this.personaExiste = true;
  this.iconValidarDocumento = 'pi pi-check';
  
  // Buscar los objetos correspondientes en los arrays
  const tipoPersonaObj = this.tipoPersona.find(t => t.key === persona.tipoPersona);
  const generoObj = persona.genero ? this.generosPersona.find(g => g.key === persona.genero) : null;
  const obligadaContabilidadObj = persona.obligadaContabilidad !== undefined ? 
    this.booleanRadio.find(b => b.key === (persona.obligadaContabilidad ? 1 : 0)) : null;
  
  // Procesar la fecha de nacimiento - puede venir como fechaCumpleanios o fechaNacimiento
  let fechaNacimiento = null;
  const fechaData = persona.fechaCumpleanios || persona.fechaNacimiento;
  if (fechaData) {
    try {
      fechaNacimiento = new Date(fechaData);
      // Verificar si la fecha es válida
      if (isNaN(fechaNacimiento.getTime())) {
        console.warn('Fecha inválida:', fechaData);
        fechaNacimiento = null;
      }
    } catch (error) {
      console.warn('Error al procesar fecha:', fechaData, error);
      fechaNacimiento = null;
    }
  }
  // Cargar los datos en el formulario
  this.form_persona.patchValue({
    tipoPersona: tipoPersonaObj,
    documento: persona.documento,
    nombre: persona.nombre,
    email: persona.email,
    celular: persona.celular,
    telefono: persona.telefono,
    direccion: persona.direccion,
    apellidos: persona.apellidos,
    fecha_nacimiento: fechaNacimiento,
    genero: generoObj,
    razonSocial: persona.razonSocial,
    representanteLegal: persona.representanteLegal,
    obligadaContabilidad: obligadaContabilidadObj,
    pin: persona.pin || null,
    especialidad: persona.especialidad || null,
    esSupervisor: persona.esSupervisor ? this.booleanRadio.find(b => b.key === 1) : this.booleanRadio.find(b => b.key === 0),
    esPasante: Boolean(persona.esPasante)
  });

  if (this.modoEdicion) {
    this.aplicarReglasEdicion();
  }
}
private aplicarReglasEdicion() {
  // Deshabilitar campos que NO se pueden editar
  this.form_persona.get('tipoPersona')?.disable();
  this.form_persona.get('documento')?.disable();
  this.form_persona.get('contrasenia')?.disable();

  // Habilitar SOLO los campos editables según tu servicio
  this.form_persona.get('nombre')?.enable();
  this.form_persona.get('email')?.enable();
  this.form_persona.get('celular')?.enable();
  this.form_persona.get('telefono')?.enable();
  this.form_persona.get('direccion')?.enable();

  // ✅ PERMITIR editar campos de mecánico en modo edición
  this.form_persona.get('pin')?.enable();
  this.form_persona.get('especialidad')?.enable();
  this.form_persona.get('esSupervisor')?.enable();
  this.form_persona.get('esPasante')?.enable();

  // Campos condicionales según el tipo de persona
  const tipoPersona = this.form_persona.get('tipoPersona')?.value?.key;
  
  if (tipoPersona === 'N') {
    // Para personas naturales
    this.form_persona.get('apellidos')?.enable();
    this.form_persona.get('fecha_nacimiento')?.enable();
    this.form_persona.get('genero')?.enable();
    this.form_persona.get('razonSocial')?.disable();
    this.form_persona.get('representanteLegal')?.disable();
    this.form_persona.get('obligadaContabilidad')?.disable();
  } else if (tipoPersona === 'E') {
    // Para empresas
    this.form_persona.get('apellidos')?.disable();
    this.form_persona.get('fecha_nacimiento')?.disable();
    this.form_persona.get('genero')?.disable();
    this.form_persona.get('razonSocial')?.enable();
    this.form_persona.get('representanteLegal')?.enable();
    this.form_persona.get('obligadaContabilidad')?.enable();
  }
}
}
function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito > 5) return false;

  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitos = cedula.split('').map(Number);

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let mult = digitos[i] * coef[i];
    if (mult >= 10) mult -= 9;
    suma += mult;
  }

  const verificador = (10 - (suma % 10)) % 10;
  return verificador === digitos[9];
}
function identificarDocumento(documento: string): 'C' | 'R' | 'P' | 'undefined' {
  const limpio = documento.trim();

  if (/^\d{10}$/.test(limpio) && validarCedula(limpio)) {
    return 'C';
  }

  if (/^\d{13}$/.test(limpio)) {
    const baseCedula = limpio.substring(0, 10);
    const ultimosTres = limpio.substring(10);
    // Verificamos si es un RUC de persona natural (cédula válida + 001)
    if (validarCedula(baseCedula) && ultimosTres === '001') {
      return 'R';
    }
    // Otras reglas para RUC de sociedades privadas y públicas:
    const tercerDigito = parseInt(limpio[2], 10);
    if (tercerDigito === 6 || tercerDigito === 9) {
      return 'R'; // Instituciones públicas (6) o jurídicas privadas (9)
    }
  }

  if (/^[a-zA-Z0-9]{5,15}$/.test(limpio)) {
    return 'P';
  }

  return 'undefined';
}
function parseFecha(fechaStr: string): string {
  const [dia, mes, anioCorto] = fechaStr.split("/").map(Number);
  const anio = anioCorto < 100 ? 2000 + anioCorto : anioCorto;
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toISOString(); 
}

