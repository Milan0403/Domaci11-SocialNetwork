class Post {
	post_id = '';
	post_content = '';
	user_id = '';
	likes = '';
	api_url = 'https://62dbc6e3d1d97b9e0c53c63e.mockapi.io';

	async create() {
		let session = new Session();
		session_id = session.getSession();
		
		let data = {
			user_id: session_id,
			content: this.post_content,
			likes: 0
		}

		data = JSON.stringify(data);

		let response = await fetch(this.api_url + '/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data
		});

		data = await response.json();

		return data;
	}

	async getAllPosts() {
		let response =await fetch(this.api_url + '/posts');
		let data = await response.json();
		return data;
	}

	like(post_id, likes) {
		let data = {
			likes: likes
		};
		data = JSON.stringify(data);

		let session = new Session;
		session_id = session.getSession();

		fetch(this.api_url + '/posts/' + post_id, {
			method : 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data
		})
		.then(response => response.json())
		.then(data => {alert('Post lajkovan')});
	}

	delete(post_id) {
		fetch(this.api_url + '/posts/' + post_id, {
			method : 'DELETE',
		})
		.then(response => response.json())
		.then(data => {alert('Post obrisan')});
	}
}