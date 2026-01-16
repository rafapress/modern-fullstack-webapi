(function () {

	'use strict';

  const { API_URL, AUTH_URL } = window.APP_CONFIG;
	// const API_URL		= 'http://localhost:5000/api/users';
	// const AUTH_URL	= 'http://localhost:5000/api/auth/login';

	const state			= new Proxy({
		token: localStorage.getItem('press_token') || '',
		users: [],
		selectedUserId: null
	}, {
		set(target, prop, val) {
			if (target[prop] === val) return true; 
			target[prop] = val;
			if (prop === 'token') {
				val ? localStorage.setItem('press_token', val) : localStorage.removeItem('press_token');
				UI.sync();
			}
			return true;
		}
	});

	const UI = {

		el: id => document.getElementById(id),

		toggleDrawer(id, show = true) {

			const drawer	= this.el(id);
			const overlay = this.el('overlay');

			if (!drawer || !overlay) return;
			show ? drawer.classList.add('active') : drawer.classList.remove('active');
			show ? overlay.classList.add('active') : overlay.classList.remove('active');

		},

		sync() {

			const isAuth        = !!state.token;
		  const authStatus    = this.el('authStatus');
		  const changePass    = this.el('changePassCard');
		  const loginElements = [this.el('colEmail'), this.el('colSenha'), this.el('colBtnLogin')];
		  const authElements  = [this.el('userInfo'), this.el('colBtnLogout'), this.el('changePassCard')];

		  if (isAuth) {

		    loginElements.forEach(el => el?.classList.add('d-none'));
		    authElements.forEach(el => el?.classList.remove('d-none'));

		    if (changePass) changePass.style.display = 'block';

		    if (authStatus) {
		      authStatus.innerHTML = '<i class="bi bi-circle-fill text-success me-2 small"></i>Online';
		      authStatus.classList.replace('text-muted', 'text-dark');
		    }

		    const storedEmail = localStorage.getItem('press_user_email') || 'Usuário';

		    if (this.el('userNameDisplay')) this.el('userNameDisplay').innerText = storedEmail.split('@')[0].toUpperCase();
		    if (this.el('userEmailDisplay')) this.el('userEmailDisplay').innerText = `(${storedEmail})`;

		  } else {

		    loginElements.forEach(el => el?.classList.remove('d-none'));
		    authElements.forEach(el => el?.classList.add('d-none'));

		    if (changePass) changePass.style.display = 'none';

		    if (authStatus) {
		      authStatus.innerHTML = 'Aguardando Login...';
		      authStatus.classList.remove('text-dark');
		      authStatus.classList.add('text-muted');
		    }

		    if (this.el('mainOutput')) {
		      	this.el('mainOutput').innerHTML = `
			        <div class="text-center py-5 opacity-50">
			          <i class="bi bi-shield-lock fs-1"></i>
			          <p>Realize o login para listar os usuários e liberar os recursos.</p>
			        </div>`;
		    }
		  }

			document.querySelectorAll('.crud-btn').forEach(btn => btn.disabled = !isAuth);

		},

		renderTable(data) {

			state.users						= Array.isArray(data) ? data : [data];
			state.selectedUserId	= null;

			const output = this.el('mainOutput');
			if (!output) return;

			if (state.users.length === 0) {
				output.innerHTML = `<div class="text-center py-5 opacity-50"><i class="bi bi-search fs-1 d-block mb-3"></i><p>Nenhum registro encontrado.</p></div>`;
				return;
			}

			const rows = state.users.map(u => `
							<tr class="selectable-row" data-id="${u.id}">
								<td class="ps-4 text-muted small">#${u.id}</td>
								<td><strong>${u.name}</strong></td>
								<td>${u.email}</td>
								<td class="pe-4">${u.city || '-'}/${u.fu || '-'}</td>
							</tr>`).join('');

						output.innerHTML = `
							<table class="table table-hover align-middle mb-0 animate__animated animate__fadeIn">
								<thead class="bg-light">
									<tr class="small text-uppercase fw-bold text-muted">
										<th class="ps-4">ID</th>
										<th>Nome</th>
										<th>E-mail</th>
										<th class="pe-4">Cidade/UF</th>
									</tr>
								</thead>
								<tbody>${rows}</tbody>
							</table>`;
		}

	};

	const Actions = {

		async login() {

			try {

				const email	= UI.el('loginEmail')?.value;
				const pass	= UI.el('loginPassword')?.value;

				if (!email || !pass) {
					showAlert('Preencha os dados de acesso', 'warning');
					return;
				}

				const res = await fetch(AUTH_URL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password: pass })
				});

				let data = {};
				try {
				  data = await res.json();
				} catch {}
				// const data = await res.json();

        if (res.status === 202) {
					Swal.fire('Acesso negado', data.detail, 'error');
					return;
        }

        if (!res.ok) {
					throw new Error(data.detail || 'Erro ao processar requisição.');
        }

				localStorage.setItem('press_user_email', email);
				state.token = data.accessToken;

				showAlert(`Bem-vindo, ${email.split('@')[0]}!`, 'success');
				this.list();

			} catch (e) {

				const msg =
					e instanceof TypeError
						? 'API indisponível. Tente novamente mais tarde.'
						: e.message;

				Swal.fire('Ocorreu um erro ao acessar', msg, 'error');

			}

		},

		async list() {

			if (!state.token) return;

			try {

				const res = await fetch(API_URL, {
					headers: { 'Authorization': `Bearer ${state.token}` }
				});

		    if (res.status === 401) {
		    	console.log('Error 401');
		      state.token = '';
		      return; 
		    }

		    if (!res.ok) throw new Error('Erro na API');

				const data = await res.json();
				UI.renderTable(data);

			} catch (e) {
				showAlert('Erro ao atualizar lista', 'error');
		    state.token = ''; 
			}

		},

		async save() {

			const form			= UI.el('formUsuario');
			const formData	= new FormData(form);
			const payload		= Object.fromEntries(formData.entries());

			if (!payload.id || payload.id === "0") {
				delete payload.id;
			} else {
				payload.id = Number(payload.id);
			}

			const isEdit		= !!payload.id;
			const url				= isEdit ? `${API_URL}/${payload.id}` : API_URL;
			const method		= isEdit ? 'PUT' : 'POST';
			const headers		= { 'Content-Type': 'application/json' };

			if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

			try {

				const res = await fetch(url, {
					method: method,
					headers: headers,
					body: JSON.stringify(payload)
				});

				if (!res.ok) throw new Error('Erro ao salvar registro!');

				showAlert(isEdit ? 'Dados do usuário atualizados com sucesso!' : 'Cadastro realizado com sucesso!', 'success');
				UI.toggleDrawer('drawerUsuario', false);

				if (!isEdit && !state.token) {

					const emailCadastrado	= payload.email;
					const inputLoginEmail	= UI.el('loginEmail');
					const inputLoginPass	= UI.el('loginPassword');

					if (inputLoginEmail) inputLoginEmail.value = emailCadastrado;

					setTimeout(() => {
						if (inputLoginPass) {
							inputLoginPass.focus();
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					}, 600);

				}

				if (state.token) this.list();

			} catch (e) {
				Swal.fire('Erro', e.message, 'error');
			}

		},

		async delete(id) {

			const result = await Swal.fire({
				title: 'Confirmar exclusão',
				text: `Deseja remover o registro #${id}?`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#212529',
				confirmButtonText: 'Sim, excluir'
			});

			if (result.isConfirmed) {

				try {

					const res = await fetch(`${API_URL}/${id}`, {
						method: 'DELETE',
						headers: { 'Authorization': `Bearer ${state.token}` }
					});

					if (!res.ok) throw new Error('Erro no servidor.');
					showAlert('Usuário excluído');
					this.list();

				} catch (e) {
					showAlert(e.message, 'error');
				}

			}

		}

	};

	document.addEventListener('click', e => {

		const row = e.target.closest('.selectable-row');

		if (row) {

			const isAuth = !!state.token;
			if (!isAuth) return;

			const clickedId = row.dataset.id;

			if (state.selectedUserId === clickedId) {
				state.selectedUserId = null;
				row.classList.remove('row-selected');
			} else {
				document.querySelectorAll('.selectable-row').forEach(r => r.classList.remove('row-selected'));
				row.classList.add('row-selected');
				state.selectedUserId = clickedId;
			}

			UI.el('ButtonEdit').disabled = !isAuth;
			UI.el('ButtonDelete').disabled = !isAuth;

			return;

		}

		const t = e.target.closest('[id]');

		if (!t) return;

		if (t.id === 'btnLogin') Actions.login();

		if (t.id === 'btnLogout') {
			state.token = '';
			UI.el('mainOutput').innerHTML = '<div class="text-center py-5 opacity-25"><i class="bi bi-shield-lock fs-1"></i><p>Faça login para continuar.</p></div>';
		}

		if (t.id === 'ButtonCreate') {
			UI.el('formUsuario').reset();
			UI.el('userIdField').value = '';
			UI.el('drawerTitle').innerText = 'Novo Usuário';
			UI.toggleDrawer('drawerUsuario', true);
		}

		if (t.id === 'ButtonEdit') {

			if (!state.selectedUserId) {
				return showAlert('Selecione um registro para editar', 'warning');
			}

			const user = state.users.find(u => u.id == state.selectedUserId);

			if (user) {
				UI.el('userIdField').value = user.id;
				UI.el('drawerTitle').innerText = 'Editar Usuário';
				const form = UI.el('formUsuario');

				Object.keys(user).forEach(key => {
					if (form.elements[key]) form.elements[key].value = user[key] || '';
				});

				UI.toggleDrawer('drawerUsuario', true);
			}

		}

		if (t.id === 'ButtonRead') Actions.list();

		if (t.id === 'ButtonDelete') {

			if (!state.selectedUserId) {
				return showAlert('Selecione um registro para excluir', 'warning');
			}

			Actions.delete(state.selectedUserId);

		}

		if (t.id === 'btnOpenPassModal')	UI.toggleDrawer('drawerPerfil', true);

		if (t.id === 'btnCloseDrawer' || t.id === 'btnClosePerfil' || t.id === 'overlay') {
			UI.toggleDrawer('drawerUsuario', false);
			UI.toggleDrawer('drawerPerfil', false);
		}

	});

	window.addEventListener('load', () => {

		UI.el('formUsuario').onsubmit = e => {
			e.preventDefault();
			Actions.save();
		};

		UI.el('formSenha').onsubmit = e => {
			e.preventDefault();
			showAlert('Senha atualizada!', 'success');
			UI.toggleDrawer('drawerPerfil', false);
		};

		if (window.VMasker) {
			VMasker(UI.el("maskCpf")).maskPattern("999.999.999-99");
			VMasker(UI.el("maskPhone")).maskPattern("(99) 99999-9999");
		}

		UI.sync();
		if (state.token) Actions.list();

	});

	function showAlert(msg, icon = 'success') {

		Swal.fire({
			toast: true,
			position: 'top-end',
			showConfirmButton: false,
			timer: 3000,
			icon,
			title: msg
		});

	}

})();