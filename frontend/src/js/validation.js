/**
 * Form Validation System - Forrajería
 *
 * Sistema de validación de formularios similar a React Hook Form.
 *轻量, extensible y reutilizable.
 */

class FormValidator {
	constructor(formSelector, options = {}) {
		this.form =
			typeof formSelector === "string"
				? document.querySelector(formSelector)
				: formSelector;

		this.options = {
			validateOnInput: options.validateOnInput !== false,
			validateOnBlur: options.validateOnBlur !== false,
			validateOnSubmit: options.validateOnSubmit !== false,
			clearErrorsOnInput: options.clearErrorsOnInput !== false,
			...options,
		};

		this.fields = {};
		this.errors = {};
		this.touched = {};

		this.init();
	}

	init() {
		if (!this.form) {
			console.error("FormValidator: Form not found");
			return;
		}

		this.parseFields();
		this.attachEvents();
	}

	/**
	 * Parsea los campos del formulario desde el atributo data-rules
	 */
	parseFields() {
		const inputs = this.form.querySelectorAll("[data-rules]");

		inputs.forEach((input) => {
			const name = input.name || input.id;
			if (!name) return;

			const rules = this.parseRules(input.dataset.rules);
			this.fields[name] = {
				element: input,
				rules: rules,
				container: input.closest(".form-group") || input.parentElement,
			};

			this.errors[name] = null;
			this.touched[name] = false;
		});
	}

	/**
	 * Parsea las reglas desde el string data-rules
	 * Ejemplo: data-rules="required|email|minLength:6"
	 */
	parseRules(rulesString) {
		if (!rulesString) return {};

		const rules = {};
		const parts = rulesString.split("|");

		parts.forEach((part) => {
			const [rule, param] = part.split(":");
			rules[rule.trim()] = param ? param.trim() : true;
		});

		return rules;
	}

	/**
	 * Adjunta eventos a los campos
	 */
	attachEvents() {
		Object.keys(this.fields).forEach((name) => {
			const field = this.fields[name];
			const input = field.element;

			// Validate on blur
			if (this.options.validateOnBlur) {
				input.addEventListener("blur", () => {
					this.touched[name] = true;
					this.validateField(name);
				});
			}

			// Clear error on input
			if (this.options.clearErrorsOnInput) {
				input.addEventListener("input", () => {
					if (this.touched[name]) {
						this.validateField(name);
					}
				});
			}
		});

		// Validate on submit
		if (this.options.validateOnSubmit) {
			this.form.addEventListener("submit", (e) => {
				if (!this.validate()) {
					e.preventDefault();
				}
			});
		}
	}

	/**
	 * Valida un campo específico
	 */
	validateField(name) {
		const field = this.fields[name];
		if (!field) return true;

		const value = field.element.value;
		const rules = field.rules;

		// Limpiar error anterior
		this.clearError(name);

		// Required
		if (rules.required && !value.trim()) {
			this.setError(name, "Este campo es requerido");
			return false;
		}

		// Si no tiene valor y no es required, no validar más
		if (!value.trim() && !rules.required) {
			return true;
		}

		// Email
		if (rules.email && !this.isValidEmail(value)) {
			this.setError(name, "Ingresá un email válido");
			return false;
		}

		// Min length
		if (rules.minLength && value.length < parseInt(rules.minLength)) {
			this.setError(name, `Mínimo ${rules.minLength} caracteres`);
			return false;
		}

		// Max length
		if (rules.maxLength && value.length > parseInt(rules.maxLength)) {
			this.setError(name, `Máximo ${rules.maxLength} caracteres`);
			return false;
		}

		// Custom rule
		if (rules.custom && typeof rules.custom === "function") {
			const result = rules.custom(value);
			if (result !== true) {
				this.setError(name, result);
				return false;
			}
		}

		return true;
	}

	/**
	 * Valida todos los campos
	 */
	validate() {
		let isValid = true;

		Object.keys(this.fields).forEach((name) => {
			this.touched[name] = true;
			if (!this.validateField(name)) {
				isValid = false;
			}
		});

		return isValid;
	}

	/**
	 * Establece un error en un campo
	 */
	setError(name, message) {
		this.errors[name] = message;
		const field = this.fields[name];
		if (!field) return;

		const input = field.element;
		const container = field.container;

		// Agregar clase de error al input
		input.classList.add("is-invalid");
		input.classList.remove("is-valid");

		// Crear o actualizar mensaje de error
		let errorEl = container.querySelector(".error-message");

		if (!errorEl) {
			errorEl = document.createElement("div");
			errorEl.className = "error-message";
			container.appendChild(errorEl);
		}

		errorEl.textContent = message;
		errorEl.style.display = "block";
	}

	/**
	 * Limpia el error de un campo
	 */
	clearError(name) {
		this.errors[name] = null;
		const field = this.fields[name];
		if (!field) return;

		const input = field.element;
		const container = field.container;

		input.classList.remove("is-invalid");

		const errorEl = container.querySelector(".error-message");
		if (errorEl) {
			errorEl.style.display = "none";
		}
	}

	/**
	 * Marca un campo como válido
	 */
	setValid(name) {
		const field = this.fields[name];
		if (!field) return;

		const input = field.element;
		const container = field.container;

		this.errors[name] = null;
		input.classList.remove("is-invalid");
		input.classList.add("is-valid");

		const errorEl = container.querySelector(".error-message");
		if (errorEl) {
			errorEl.style.display = "none";
		}
	}

	/**
	 * Limpia todos los errores
	 */
	clearAllErrors() {
		Object.keys(this.fields).forEach((name) => {
			this.clearError(name);
			this.errors[name] = null;
			this.touched[name] = false;

			const field = this.fields[name];
			if (field) {
				field.element.classList.remove("is-valid", "is-invalid");
			}
		});
	}

	/**
	 * Obtiene los valores del formulario
	 */
	getValues() {
		const values = {};

		Object.keys(this.fields).forEach((name) => {
			const field = this.fields[name];
			const input = field.element;

			if (input.type === "checkbox") {
				values[name] = input.checked;
			} else if (input.type === "radio") {
				const checked = this.form.querySelector(
					`input[name="${name}"]:checked`,
				);
				values[name] = checked ? checked.value : null;
			} else {
				values[name] = input.value;
			}
		});

		return values;
	}

	/**
	 * Obtiene todos los errores
	 */
	getErrors() {
		return { ...this.errors };
	}

	/**
	 * Validador de email
	 */
	isValidEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	/**
	 * Validador de URL
	 */
	isValidUrl(url) {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Añade una regla custom a un campo
	 */
	addRule(name, rule, validator) {
		if (this.fields[name]) {
			this.fields[name].rules[rule] = validator;
		}
	}

	/**
	 * Callback cuando la validación falla
	 */
	onError(callback) {
		this.options.onError = callback;
	}

	/**
	 * Callback cuando la validación es exitosa
	 */
	onSuccess(callback) {
		this.options.onSuccess = callback;
	}
}

// ========================================
// VALIDATORS COMUNES
// ========================================

const Validators = {
	required: (value) => {
		if (!value || !value.trim()) {
			return "Este campo es requerido";
		}
		return true;
	},

	email: (value) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!re.test(value)) {
			return "Ingresá un email válido";
		}
		return true;
	},

	minLength: (value, min) => {
		if (value.length < min) {
			return `Mínimo ${min} caracteres`;
		}
		return true;
	},

	maxLength: (value, max) => {
		if (value.length > max) {
			return `Máximo ${max} caracteres`;
		}
		return true;
	},

	password: (value) => {
		if (value.length < 6) {
			return "La contraseña debe tener al menos 6 caracteres";
		}
		return true;
	},

	match: (value, matchValue, fieldName) => {
		if (value !== matchValue) {
			return `Los valores no coinciden`;
		}
		return true;
	},
};

// Exportar
window.FormValidator = FormValidator;
window.Validators = Validators;
